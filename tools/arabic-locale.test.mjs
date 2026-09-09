import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'locales', name), 'utf8').replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
function flatten(object, prefix = '') {
  return Object.fromEntries(Object.entries(object).flatMap(([key, value]) => typeof value === 'object' ? Object.entries(flatten(value, `${prefix}${key}.`)) : [[prefix + key, value]]));
}
const english = flatten(read('en.default.json'));
const arabic = flatten(read('ar.json'));
test('Arabic covers every default-locale key and preserves interpolation variables', () => {
  const vars = value => [...value.matchAll(/\{\{\s*(.*?)\s*\}\}/g)].map(match => match[1]).sort();
  for (const [key, value] of Object.entries(english)) {
    assert.equal(typeof arabic[key], 'string', key);
    assert.ok(arabic[key].trim(), key);
    // Arabic singular/dual forms can express the count grammatically.
    const expected = vars(value);
    if (/\.(zero|one|two)$/.test(key) && !vars(arabic[key]).includes('count')) expected.splice(expected.indexOf('count'), expected.includes('count') ? 1 : 0);
    assert.deepEqual(vars(arabic[key]), expected, key);
  }
});
test('custom Arabic copy retains technical quantities, contact details and postal destinations', () => {
  for (const [key, value] of Object.entries(english).filter(([key]) => /^suntneew_(auto|planner)\./.test(key))) {
    const quantities = text => [...text.matchAll(/\d+(?:[.,]\d+)*(?:V|A|Ah|mAh|Wh|kWh|W|L|cm|mm)\b/g)].map(match => match[0]).sort();
    assert.deepEqual(quantities(arabic[key]), quantities(value), key);
    if (/^info@|^2125 Gateway|^Hebron,|^381 S Brea|^Walnut,|^Online Seller RMA$/.test(value)) assert.equal(arabic[key], value, key);
  }
});
