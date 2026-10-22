// Screenshot pages at the four design breakpoints for visual review.
// Usage: node scripts/shots.mjs [baseUrl] [path ...]   (output: ./screenshots, git-ignored)
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const [base = 'http://localhost:4321', ...paths] = process.argv.slice(2);
const routes = paths.length ? paths : ['/'];
const widths = [375, 768, 1024, 1440];
const reduced = process.env.REDUCED === '1';

await mkdir('screenshots', { recursive: true });
const browser = await chromium.launch();
for (const route of routes) {
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: width < 768 ? 812 : 900 },
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const name = `${route === '/' ? 'home' : route.replaceAll('/', '_').replace(/^_/, '')}-${width}${reduced ? '-rm' : ''}`;
    await page.screenshot({ path: `screenshots/${name}-fold.png` });
    await page.screenshot({ path: `screenshots/${name}-full.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${name}: horizontal overflow ${overflow}px${errors.length ? ` ERRORS: ${errors.join(' | ')}` : ''}`);
    await page.close();
  }
}
await browser.close();
