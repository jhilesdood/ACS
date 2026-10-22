// axe accessibility scan of every public page: node scripts/a11y.mjs [baseUrl]
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base = process.argv[2] ?? 'http://127.0.0.1:4400';
const pages = ['/', '/adults', '/youth', '/personal-training', '/fight-team', '/schedule', '/memberships', '/coaches', '/the-gym', '/contact', '/join/success', '/join/not-available', '/account', '/waiver', '/terms', '/privacy', '/sent', '/404.html'];
const b = await chromium.launch();
let total = 0;
for (const width of [375, 1440]) {
  for (const path of pages) {
    const ctx = await b.newContext({ viewport: { width, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(base + path, { waitUntil: 'load' });
    await p.waitForTimeout(400);
    const { violations } = await new AxeBuilder({ page: p }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    for (const v of violations) {
      total++;
      console.log(`${width} ${path}: [${v.impact}] ${v.id} (${v.nodes.length}) ${v.nodes[0].target.join(' ')}`);
    }
    await ctx.close();
  }
}
console.log(total ? `${total} violation groups` : 'axe: no violations on any page at 375 or 1440');
await b.close();
