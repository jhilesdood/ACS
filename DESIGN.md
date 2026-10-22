# ACS MMA design system: "Red Corner"

The fighter in the red corner, the fight poster, the tale of the tape. The site should read like fight-night material, not a fitness app. Tokens live in `src/styles/tokens.css`; this file explains the rules behind them.

## Color

| Token | Hex | Use |
|---|---|---|
| `--black` | `#000000` | Page background. True black, never a tinted near-black. |
| `--corner-red` | `#D0021B` | Brand red: large type, fills, buttons with white text (5.3:1). **Never small red text on black** (3.6:1). |
| `--blood` | `#7A0010` | Hover and pressed states, deep red fields. |
| `--canvas` | `#F2F2F0` | Light sections (cool mat-white, not cream) and body text on black. |
| `--steel` | `#8A8D91` | Secondary text on black (6.4:1). |
| `--steel-dark` | `#55585C` | Secondary text on canvas. |
| `--white` | `#FFFFFF` | Text on red. |

Section rhythm: black is the default, the **red field** is reserved for youth, and the **canvas** section is reserved for personal training and youth safety. Don't add more colors.

## Type

One variable family: **Archivo** (self-hosted via `@fontsource-variable/archivo`, width axis 62–125%).

- **Display:** weight 850–900, `font-stretch: 62%`, uppercase, tight leading (0.84–0.9). Uppercase is for display headings only.
- **Body:** `font-stretch: 100%`, weight 400, 18px, line-height 1.55, max about 66ch.
- **Numbers** (records, prices, times): `font-variant-numeric: tabular-nums`. No monospace.
- Labels and UI text are sentence case. No tracked all-caps eyebrows, no "→" on buttons, no middle-dot meta strings.

## The signature moment

On load, the home hero headline expands from 62% to 125% width (`Hero.astro`), like a strike landing. A script sizes each line so its final width fills the container exactly. **This is the only automatic animation on the site.** While scrolling through the hero, a light parallax moves the background slower than the page and fades the words (never the buttons). The headline is only resized when the screen *width* changes, never the height, so a phone's address bar can't make the page jump. Everything else moves only in response to the visitor (menu, schedule filter, FAQ). The fight team "tale of the tape" is the only pinned scroll section. Both switch off under `prefers-reduced-motion`.

## Mobile first

Phones are the main platform. Design and check every change at 390px first, then scale up.

- **Thumb bar:** below 64rem, a fixed bottom bar holds Menu, Schedule and Join (`Header.astro`). The top bar is just the logo and tucks away while scrolling down. Tap targets are at least 44px and the bar pads for the iPhone home indicator (`env(safe-area-inset-bottom)`); `--thumb-bar-h` reserves page space for it and is `0px` on desktop.
- **Menu sheet:** a full-screen sheet with links anchored at the bottom, within thumb reach. Escape, the Close button or tapping the backdrop closes it.
- **Swipe, never hidden swipe:** swipe decks (`src/lib/deck.ts`, used by the fight team and memberships) use native scroll-snap, a peeking next card, a counter or dots, and arrow buttons. Desktop pins the fight team and lays the plans out side by side.
- **Top bar:** tucks only after 64px of continuous downward scroll and returns after 32px up; bounce and jitter are ignored.
- **Membership cards:** name band (with optional CMS label such as "Recommended", never an unverifiable claim like "Most popular"), large price, summary, check-mark list, full-width Join and fine print. On phones the deck opens centered on the featured plan; on desktop, subgrid keeps names, prices and buttons aligned across cards.
- **No horizontal overflow, ever.** Anything inside a horizontal scroller needs a positioned ancestor (`position: relative`) or absolutely positioned children (like `.visually-hidden` text) escape and make phones zoom the whole page out. `scripts/mobile-check.mjs` catches this.
- **Hero:** fills the screen above the thumb bar; the headline is fitted per screen.

## Layout

- Left-aligned and asymmetric. Poster-scale type against full-bleed imagery.
- Programs get full-width bands, not identical rounded cards. Media has radius 0; controls have 2px.
- Numbered markers only where content is a real sequence (the personal training steps, the post-checkout steps).
- Breakpoints checked: 375, 768, 1024 and 1440px. No horizontal scroll at any width.

## Placeholders

- **`TBD` values:** any content value starting with "TBD" renders as a muted italic placeholder (`isTbd()` in `src/site.ts`). Never replace one with an invented fact: coach credentials, fight records, prices and safety policy must be real.
- **Photos:** `Shot.astro` renders a labelled placeholder per slot. Replace each with the matching shot from the list below.
- **Logo:** the circular ACS badge. The source file in `logo/` has its checkerboard baked into the pixels, so `node scripts/logo-cutout.mjs` cuts out the circle with real transparency into `src/assets/acs-badge.png`, `public/brand/`, and the favicons. Re-run it, then `node scripts/og-image.mjs`, if the logo changes. The badge's lettering is unreadable below about 120px, so the header pairs it with an "ACS MMA" text wordmark. The motto on the badge (Strength, Character, Discipline) is the gym's own and is used on the youth page.

## Shoot list

Slot IDs match the `Shot` IDs and `shot` fields in the content.

| ID | Shot | Notes |
|---|---|---|
| 1 | Hero: slow-motion sparring exchange | 120fps, 10–15s seamless loop, low angle. Deliver MP4 + WebM under ~4 MB plus a poster frame. |
| 2a–2d | One per discipline: MMA, BJJ scramble, Muay Thai pads, wrestling/boxing | Wide and tight of each. |
| 3a, 3b | Youth class: group drill; coach demonstrating | **Signed parent photo release for every child.** |
| 4a–4c | Fighter portraits | Black seamless, red rim light, fight-poster style. 4:5 crop. |
| 5a–5d | Coach portraits | Same setup as fighters, plus teaching shots. |
| 6a–6d | Facility: cage and mats empty (wide); wraps, gloves, tape (details) | |
| 7 | Personal training 1:1 session | |
