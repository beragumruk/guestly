import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(
  '/Users/esragumruk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright',
);
const baseUrl = process.env.GUESTLY_BASE_URL || 'http://127.0.0.1:3000';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];

page.on('pageerror', (error) => errors.push(error.message));

await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Continue to Workspace/i }).click();
await page.waitForURL('**/dashboard');
const title = await page.title();
const body = await page.locator('body').innerText({ timeout: 10000 });
await page.screenshot({ path: 'guestly-dashboard-overview.png', fullPage: true });

await page.goto(`${baseUrl}/dashboard/locations`, { waitUntil: 'networkidle' });
const locationsBody = await page.locator('body').innerText();
await page.screenshot({ path: 'guestly-dashboard-qr-toast.png', fullPage: true });

await page.goto(`${baseUrl}/f/guestly-demo-table`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: '2' }).click();
await page.getByLabel('What should the team know?').fill('My food allergy was not handled confidently by the server.');
await page.getByRole('button', { name: /Submit feedback/i }).click();
const success = await page.getByText('Thank you for telling us.').isVisible({ timeout: 5000 });

await page.goto(`${baseUrl}/dashboard/feedback`, { waitUntil: 'networkidle' });
await page.getByPlaceholder(/Search feedback/i).fill('allergy');
await page.screenshot({ path: 'guestly-dashboard-inbox.png', fullPage: true });
const inboxBody = await page.locator('body').innerText();

await page.setViewportSize({ width: 390, height: 900 });
await page.goto(`${baseUrl}/f/guestly-demo-room`, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'guestly-guest-mobile.png', fullPage: true });

await browser.close();

console.log(
  JSON.stringify(
    {
      title,
      baseUrl,
      dashboardLoads: body.includes('Command view for guest experience risk'),
      locationsLoad: locationsBody.includes('guestly-demo-room'),
      inboxShowsClassification: inboxBody.includes('Critical') && inboxBody.includes('Allergy'),
      success,
      errors,
      screenshots: [
        'guestly-dashboard-overview.png',
        'guestly-dashboard-qr-toast.png',
        'guestly-dashboard-inbox.png',
        'guestly-guest-mobile.png',
      ],
    },
    null,
    2,
  ),
);
