// Screenshot one element: node scripts/el-shot.mjs <url> <selector> <width> <out>
import { chromium } from 'playwright';
const [url, sel, width = '375', out = 'screenshots/el.png'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +width, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
const el = p.locator(sel).first();
await el.scrollIntoViewIfNeeded();
await p.waitForFunction(() => [...document.images].every((i) => i.complete || i.loading === 'lazy' && i.getBoundingClientRect().top > innerHeight));
await p.waitForTimeout(600);
await el.screenshot({ path: out });
await b.close();
