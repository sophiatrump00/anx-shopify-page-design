import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { contact, hash, verifyProxy, activeRule, campaignFingerprint } from './domain.mjs';
import { shopifyClient, assertProduct, saveCustomer, issueDiscount } from './shopify.mjs';

export function createService({ database, secret, proxySecret, shop, loadPlan, api, sendEmail, now = Date.now }) {
  if (secret.length < 32) throw new Error('Use a permanent random secret of at least 32 characters.');
  const encryptionKey = crypto.createHash('sha256').update(secret).digest();
  const seal = value => {
    const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    const data = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
  };
  const open = value => { const b = Buffer.from(value, 'base64'), decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, b.subarray(0, 12)); decipher.setAuthTag(b.subarray(12, 28)); return JSON.parse(Buffer.concat([decipher.update(b.subarray(28)), decipher.final()]).toString()); };
  const db = new DatabaseSync(database);
  db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS challenges(id TEXT PRIMARY KEY, identity TEXT NOT NULL, otp TEXT NOT NULL, payload TEXT NOT NULL, expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS requests(identity TEXT NOT NULL, created INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS request_time ON requests(created);`);
  const busy = new Set();
  async function request(body) {
    const input = contact(body), plan = loadPlan();
    const { campaign, rule } = activeRule(plan, body.campaign, body.variantId, now());
    await assertProduct(api, rule);
    const identity = hash(secret, input.email), time = now();
    db.prepare('DELETE FROM challenges WHERE expires < ?').run(time);
    db.prepare('DELETE FROM requests WHERE created < ?').run(time - 3600000);
    const recent = db.prepare('SELECT created FROM requests WHERE identity = ? ORDER BY created DESC').all(identity);
    if ((recent[0] && time - recent[0].created < 60000) || recent.length >= 5 || db.prepare('SELECT count(*) AS n FROM requests').get().n >= 300) throw new Error('rate_limited');
    db.prepare('INSERT INTO requests VALUES (?,?)').run(identity, time);
    const id = crypto.randomUUID(), otp = String(crypto.randomInt(100000, 1000000));
    db.prepare('DELETE FROM challenges WHERE identity = ?').run(identity);
    const payload = { ...input, campaign: campaign.key, variantId: String(rule.variantId), fingerprint: campaignFingerprint(campaign) };
    db.prepare('INSERT INTO challenges(id,identity,otp,payload,expires) VALUES (?,?,?,?,?)').run(id, identity, hash(secret, `${id}:${otp}`), seal(payload), time + 600000);
    try { await sendEmail(input.email, otp); } catch { db.prepare('DELETE FROM challenges WHERE id=?').run(id); throw new Error('backend_unavailable'); }
    return { challengeId: id, expiresIn: 600 };
  }
  async function verify(body) {
    const id = String(body.challengeId || '');
    if (busy.has(id)) throw new Error('rate_limited');
    busy.add(id);
    try {
      const row = db.prepare('SELECT * FROM challenges WHERE id=?').get(id);
      if (!row || row.expires <= now() || row.attempts >= 5) throw new Error('invalid_code');
      db.prepare('UPDATE challenges SET attempts=attempts+1 WHERE id=?').run(id);
      const supplied = hash(secret, `${id}:${String(body.code || '')}`);
      if (!crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(row.otp))) throw new Error('invalid_code');
      const input = open(row.payload), plan = loadPlan();
      const { campaign, rule } = activeRule(plan, input.campaign, input.variantId, now());
      if (campaignFingerprint(campaign) !== input.fingerprint) throw new Error('not_available');
      await assertProduct(api, rule);
      const customerId = await saveCustomer(api, input, `${campaign.key}-${campaign.startsAt.slice(0, 10)}`);
      // Stable per customer / campaign / SKU, including retries after a lost API response.
      const code = `MD-${hash(secret, `${input.email}:${input.fingerprint}:${rule.variantId}`).slice(0, 28).toUpperCase()}`;
      await issueDiscount(api, campaign, rule, customerId, code);
      activeRule(loadPlan(), input.campaign, input.variantId, now());
      db.prepare('DELETE FROM challenges WHERE id=?').run(id);
      return { code, variantId: rule.variantId, expiresAt: campaign.endsAt, discountPath: `/discount/${code}?redirect=%2Fcheckout` };
    } finally { busy.delete(id); }
  }
  const handler = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json'); res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'POST' || !verifyProxy(req.url, proxySecret, shop, now())) { res.writeHead(403).end('{"error":"forbidden"}'); return; }
    let bytes = 0, raw = '';
    try {
      for await (const chunk of req) { bytes += chunk.length; if (bytes > 4096) throw new Error('invalid_contact'); raw += chunk; }
      const route = new URL(req.url, 'https://proxy.invalid').pathname.split('/').at(-1);
      const result = route === 'request' ? await request(JSON.parse(raw)) : route === 'verify' ? await verify(JSON.parse(raw)) : null;
      if (!result) { res.writeHead(404).end('{}'); return; }
      res.end(JSON.stringify(result));
    } catch (error) {
      const safe = ['invalid_contact', 'invalid_code', 'rate_limited', 'not_available', 'backend_unavailable'].includes(error.message) ? error.message : 'backend_unavailable';
      res.writeHead(safe === 'rate_limited' ? 429 : safe === 'backend_unavailable' ? 503 : 400).end(JSON.stringify({ error: safe }));
    }
  };
  return { handler, request, verify, close: () => db.close() };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const key of ['SHOPIFY_STORE', 'SHOPIFY_API_SECRET', 'DROP_SECRET', 'DROP_PLAN_PATH', 'DROP_DATABASE_PATH', 'SMTP_USER', 'SMTP_PASS', 'DROP_EMAIL_FROM']) if (!process.env[key]) throw new Error(`Missing ${key}`);
  const env = process.env;
  if (!env.SHOPIFY_ADMIN_ACCESS_TOKEN && !env.SHOPIFY_CLIENT_ID) throw new Error('Provide SHOPIFY_CLIENT_ID for an installed app in your own organization, or a managed SHOPIFY_ADMIN_ACCESS_TOKEN.');
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(env.SHOPIFY_STORE)) throw new Error('Invalid shop domain');
  fs.mkdirSync(path.dirname(path.resolve(env.DROP_DATABASE_PATH)), { recursive: true, mode: 0o700 });
  const service = createService({ database: env.DROP_DATABASE_PATH, secret: env.DROP_SECRET, proxySecret: env.SHOPIFY_API_SECRET, shop: env.SHOPIFY_STORE,
    loadPlan: () => JSON.parse(fs.readFileSync(env.DROP_PLAN_PATH, 'utf8')),
    api: shopifyClient({ shop: env.SHOPIFY_STORE, token: env.SHOPIFY_ADMIN_ACCESS_TOKEN, clientId: env.SHOPIFY_CLIENT_ID, clientSecret: env.SHOPIFY_API_SECRET }),
    sendEmail: async (email, code) => {
      const transporter = nodemailer.createTransport({ host: 'smtp.qiye.aliyun.com', port: 465, secure: true, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } });
      await transporter.sendMail({ from: env.DROP_EMAIL_FROM, to: email, subject: 'Your SuntNeew verification code', text: `Your Member Drops verification code is ${code}. It expires in 10 minutes. If you did not request this code, ignore this email. This email does not subscribe you to marketing.` });
    }
  });
  fs.chmodSync(env.DROP_DATABASE_PATH, 0o600);
  const server = http.createServer(service.handler); server.requestTimeout = 20000; server.headersTimeout = 10000;
  server.listen(Number(env.PORT || 8787), '0.0.0.0', () => console.log('Member Drops service listening.'));
  const stop = () => server.close(() => { service.close(); process.exit(0); }); process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
