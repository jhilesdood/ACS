// Cut the circular ACS badge out of the source logo (its "transparent" checkerboard is baked into the pixels)
// and export web sizes with real transparency. Usage: node scripts/logo-cutout.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const src = 'logo/hf_20261021_011327_a944cf14-31f1-4567-884e-910c7543ccd6.png';
// Measured from the dark outer rim (see commit history / scripts): center and radius in source pixels.
const cx = 2404, cy = 1744, r = 1614;
const inset = 6; // trim the soft drop-shadow fringe just outside the rim
const size = (r - inset) * 2;

const crop = await sharp(src)
  .extract({ left: cx - r + inset, top: cy - r + inset, width: size, height: size })
  .toBuffer();
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#fff"/></svg>`,
);
const badge = await sharp(crop).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

await mkdir('public/brand', { recursive: true });
await mkdir('src/assets', { recursive: true });
await sharp(badge).resize(1600, 1600).png({ compressionLevel: 9 }).toFile('src/assets/acs-badge.png'); // source for <Image>, Astro makes sizes
await sharp(badge).resize(1024, 1024).png({ compressionLevel: 9 }).toFile('public/brand/acs-badge-1024.png'); // for press, socials
await sharp(badge).resize(180, 180).flatten({ background: '#000000' }).png().toFile('public/apple-touch-icon.png');
await sharp(badge).resize(64, 64).png().toFile('public/favicon-64.png');
await sharp(badge).resize(32, 32).png().toFile('public/favicon-32.png');
console.log('badge exported', size, 'px source');
