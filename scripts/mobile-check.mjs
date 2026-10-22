// Phone checks (iPhone 13 emulation). Usage: node scripts/mobile-check.mjs [baseUrl]
// Screenshots go to ./screenshots (m-*.png). Exits non-zero if a check fails.
import { chromium, devices } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4321';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['iPhone 13'] });
const p = await ctx.newPage();
const errors = [];
const fails = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) fails.push(name);
};
p.on('pageerror', (e) => errors.push(e.message));
const open = async (path) => {
  await p.goto(base + path, { waitUntil: 'load' });
  await p.waitForTimeout(900);
};

// 1. Every page fits the phone (no zoom-out from horizontal overflow)
for (const path of ['/', '/adults', '/youth', '/personal-training', '/fight-team', '/schedule', '/memberships', '/coaches', '/contact']) {
  await open(path);
  const w = await p.evaluate(() => innerWidth);
  check(`fits 390px: ${path}`, w === 390, `innerWidth ${w}`);
}

// 2. Home: fold, menu sheet
await open('/');
await p.screenshot({ path: 'screenshots/m-fold.png' });
await p.locator('.thumb-bar .menu-btn').tap();
await p.waitForTimeout(400);
check('menu sheet opens', await p.locator('#mobile-menu').isVisible());
await p.screenshot({ path: 'screenshots/m-menu.png' });
await p.locator('.thumb-bar .menu-btn').tap();

// 3. Hero headline keeps its size when only the height changes (address bar)
const before = await p.evaluate(() => [...document.querySelectorAll('.hero .set')].find((s) => s.offsetParent)?.style.fontSize);
await p.setViewportSize({ width: 390, height: 750 });
await p.waitForTimeout(400);
const after = await p.evaluate(() => [...document.querySelectorAll('.hero .set')].find((s) => s.offsetParent)?.style.fontSize);
check('hero size stable on height-only resize', before === after, `${before} -> ${after}`);
await p.setViewportSize({ width: 390, height: 664 });

// 4. Header: scroll jitter near the middle of the page must not flip it
await p.evaluate(() => scrollTo(0, 1600));
await p.waitForTimeout(400);
let flips = 0;
let last = await p.evaluate(() => document.querySelector('.header').classList.contains('tucked'));
for (let i = 0; i < 12; i++) {
  await p.evaluate((d) => scrollBy(0, d), i % 2 ? -10 : 10);
  await p.waitForTimeout(60);
  const now = await p.evaluate(() => document.querySelector('.header').classList.contains('tucked'));
  if (now !== last) flips++;
  last = now;
}
check('header ignores ±10px jitter', flips === 0, `${flips} flips`);
await p.evaluate(() => scrollBy(0, 200));
await p.waitForTimeout(300);
check('header tucks on real scroll down', await p.evaluate(() => document.querySelector('.header').classList.contains('tucked')));
await p.evaluate(() => scrollBy(0, -80));
await p.waitForTimeout(300);
check('header returns on scroll up', !(await p.evaluate(() => document.querySelector('.header').classList.contains('tucked'))));

// 5. Parallax: background moves while scrolling through the hero
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(300);
await p.evaluate(() => scrollTo(0, 300));
await p.waitForTimeout(500);
const bgTransform = await p.evaluate(() => getComputedStyle(document.querySelector('.hero .bg')).transform);
check('hero parallax active', bgTransform !== 'none', bgTransform);
await p.screenshot({ path: 'screenshots/m-parallax.png' });

// 6. Fight team deck
await p.locator('.tape').scrollIntoViewIfNeeded();
await p.locator('.tape button.next').tap();
await p.waitForTimeout(900);
const count = (await p.locator('.tape .count').textContent()).replace(/\s+/g, ' ').trim();
check('fight deck advances', count.startsWith('2'), count);
await p.screenshot({ path: 'screenshots/m-tape.png' });

// 7. Plans deck opens on the featured plan; arrows and dots work
await p.locator('.pricing .deck').scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
const current = () => p.evaluate(() => [...document.querySelectorAll('.pricing .dot')].findIndex((d) => d.getAttribute('aria-current') === 'true'));
const featured = await p.evaluate(() => [...document.querySelectorAll('.pricing .card')].findIndex((c) => c.classList.contains('featured')));
check('plans deck starts on featured plan', (await current()) === featured, `dot ${await current()}, featured ${featured}`);
await p.locator('.pricing').scrollIntoViewIfNeeded();
await p.screenshot({ path: 'screenshots/m-plans.png' });
await p.locator('.pricing button.prev').tap();
await p.waitForTimeout(800);
check('plans prev arrow', (await current()) === featured - 1, `dot ${await current()}`);
await p.screenshot({ path: 'screenshots/m-plans-first.png' });
await p.locator('.pricing .dot').last().tap();
await p.waitForTimeout(800);
check('plans dot jumps to last', (await current()) === 2, `dot ${await current()}`);

// 8. Footer clears the thumb bar
const spacing = await p.evaluate(() => {
  scrollTo(0, document.body.scrollHeight);
  const bar = document.querySelector('.thumb-bar').getBoundingClientRect();
  const legal = document.querySelector('.footer .legal').getBoundingClientRect();
  return { barTop: Math.round(bar.top), legalBottom: Math.round(legal.bottom) };
});
check('footer clears thumb bar', spacing.legalBottom <= spacing.barTop, JSON.stringify(spacing));

check('no page errors', errors.length === 0, errors.join(' | '));
await b.close();
if (fails.length) process.exit(1);
