// Render public/og.png (1200x630 share image): the ACS badge plus the hero line. Re-run if either changes.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const badge = readFileSync('public/brand/acs-badge-1024.png').toString('base64');
const font = readFileSync('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2').toString('base64');
const html = `<style>
@font-face{font-family:A;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900;font-stretch:62% 125%}
body{margin:0;width:1200px;height:630px;background:#000;color:#fff;font-family:A;display:flex;flex-direction:column;justify-content:space-between;padding:64px;box-sizing:border-box;
background-image:radial-gradient(90% 90% at 85% 20%,rgba(208,2,27,.55),transparent 60%)}
.badge{position:absolute;right:64px;top:50%;width:380px;height:380px;transform:translateY(-50%)}
.word{font-weight:900;font-stretch:62%;font-size:56px;line-height:1}.word span{color:#D0021B}
h1{margin:0;font-weight:900;font-stretch:125%;font-size:96px;line-height:.86;text-transform:uppercase;letter-spacing:-.015em}
</style><img class="badge" src="data:image/png;base64,${badge}"><div class="word">ACS <span>MMA</span></div><h1>Train<br>like you<br>mean it</h1>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: 'public/og.png' });
await b.close();
console.log('public/og.png written');
