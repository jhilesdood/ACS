// Capture the pinned fight-team section at several scroll positions (desktop).
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(process.argv[2] ?? 'http://localhost:4321/', { waitUntil: 'load' });
await page.waitForTimeout(800);
const top = await page.evaluate(() => document.querySelector('.tape').getBoundingClientRect().top + scrollY);
const dist = await page.evaluate(() => { const d = document.querySelector('.tape .deck'); return d.scrollWidth - document.querySelector('.tape .viewport').clientWidth; });
console.log({ top, dist });
for (const [i, f] of [0, 0.35, 0.7, 1].entries()) {
  await page.evaluate((y) => scrollTo(0, y), top + dist * f);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `screenshots/pin-${i}.png` });
}
await browser.close();
