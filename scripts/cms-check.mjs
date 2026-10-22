// Smoke-test Keystatic: open the dashboard and a plan entry.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto('http://localhost:4321/keystatic', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.screenshot({ path: 'screenshots/cms-home.png' });
await p.goto('http://localhost:4321/keystatic/collection/plans/item/unlimited', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.screenshot({ path: 'screenshots/cms-plan.png' });
console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no page errors');
await b.close();
