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
const apiRequests = [];

page.on('pageerror', (error) => errors.push(error.message));

await page.route('**/api/request-access', async (route) => {
  apiRequests.push(route.request().postDataJSON());
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true }),
  });
});

await page.goto(baseUrl, { waitUntil: 'load' });
const title = await page.title();
const body = await page.locator('body').innerText({ timeout: 10000 });
await page.screenshot({ path: 'guestly-landing-desktop.png', fullPage: true });

await page.getByRole('link', { name: 'Demo' }).first().click();
await page.waitForTimeout(500);
const demoVisible = await page.locator('#demo').isVisible();

await page.locator('input[name="name"]').fill('Alex Morgan');
await page.locator('input[name="business"]').fill('Northline Hotel');
await page.locator('select[name="businessType"]').selectOption({ label: 'Hotel' });
await page.locator('input[name="email"]').fill('alex@example.com');
await page.locator('textarea[name="message"]').fill('We want to catch guest complaints before reviews.');
await page.getByRole('button', { name: 'Contact for Demo' }).last().click();
const success = await page.getByText('Demo request sent.').isVisible({ timeout: 5000 });

await page.setViewportSize({ width: 390, height: 900 });
await page.goto(baseUrl, { waitUntil: 'load' });
await page.screenshot({ path: 'guestly-landing-mobile.png', fullPage: true });

await browser.close();

console.log(
  JSON.stringify(
    {
      title,
      baseUrl,
      hasHeadline: body.includes('Turn Silent Guest Feedback Into Action'),
      hasDemo: body.includes('Signal command view'),
      hasPricing: body.includes('Core Plan'),
      demoVisible,
      success,
      apiRequestCount: apiRequests.length,
      apiPayloadHasEmail: apiRequests[0]?.email === 'alex@example.com',
      errors,
      screenshots: ['guestly-landing-desktop.png', 'guestly-landing-mobile.png'],
    },
    null,
    2,
  ),
);
