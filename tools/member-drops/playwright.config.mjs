import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  testDir: path.resolve(directory, '../../tests/member-drops'), testMatch: 'browser.spec.mjs',
  fullyParallel: false, workers: 1, retries: 0, timeout: 25000,
  reporter: 'list', outputDir: path.resolve(directory, '../../output/member-drops/browser-tests'),
  use: { baseURL: 'http://127.0.0.1:4178', viewport: { width: 1440, height: 1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'node preview.mjs', cwd: directory, url: 'http://127.0.0.1:4178', reuseExistingServer: true }
});
