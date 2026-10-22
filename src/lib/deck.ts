/**
 * Swipe deck: a horizontal scroll-snap list with prev/next buttons, an optional "1 / 3" counter,
 * optional dot buttons and arrow-key support. Used by the fight team and membership cards.
 *
 * Markup inside `root`: `.deck` (the scroller) with `.card` children, and optionally
 * `button.prev`, `button.next`, `.cur` (counter number), `.dots` (empty container) and `.controls`
 * (shown once JS runs). Cards must be `position: relative` so hidden text can't overflow the page.
 */
export function initDeck(
  root: HTMLElement,
  { startIndex = 0, label = 'item', align = 'start' as 'start' | 'center' } = {},
) {
  const found = root.querySelector<HTMLElement>('.deck');
  if (!found) return;
  const deck: HTMLElement = found;
  const cards = [...deck.querySelectorAll<HTMLElement>('.card')];
  if (!cards.length) return;

  const controls = root.querySelector<HTMLElement>('.controls');
  const prev = root.querySelector<HTMLButtonElement>('button.prev');
  const next = root.querySelector<HTMLButtonElement>('button.next');
  const cur = root.querySelector<HTMLElement>('.cur');
  const dotsWrap = root.querySelector<HTMLElement>('.dots');
  if (controls) controls.hidden = false;

  const dots = dotsWrap
    ? cards.map((card, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'dot';
        const name = card.dataset.name ?? `${label} ${i + 1}`;
        dot.setAttribute('aria-label', `Show ${name}`);
        dot.addEventListener('click', () => go(i));
        dotsWrap.append(dot);
        return dot;
      })
    : [];

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The scrollLeft that snaps a card into place (start-aligned after the scroll padding, or centered),
  // clamped to what the deck can actually scroll.
  const target = (c: HTMLElement) => {
    const d = deck.getBoundingClientRect();
    const r = c.getBoundingClientRect();
    const base = deck.scrollLeft + r.left - d.left;
    const pad = parseFloat(getComputedStyle(deck).scrollPaddingLeft) || 0;
    const left = align === 'center' ? base - (d.width - r.width) / 2 : base - pad;
    return Math.min(Math.max(0, left), deck.scrollWidth - deck.clientWidth);
  };

  const index = () => {
    const left = deck.scrollLeft;
    let best = 0;
    cards.forEach((c, i) => {
      if (Math.abs(target(c) - left) < Math.abs(target(cards[best]) - left)) best = i;
    });
    return best;
  };

  function go(i: number, smooth = true) {
    const card = cards[Math.min(cards.length - 1, Math.max(0, i))];
    deck.scrollTo({ left: target(card), behavior: smooth && !reduce() ? 'smooth' : 'auto' });
  }

  const update = () => {
    const i = index();
    if (cur) cur.textContent = String(i + 1);
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === cards.length - 1;
    dots.forEach((d, j) => d.setAttribute('aria-current', String(j === i)));
  };

  prev?.addEventListener('click', () => go(index() - 1));
  next?.addEventListener('click', () => go(index() + 1));
  let raf = 0;
  deck.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    },
    { passive: true },
  );
  deck.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    go(index() + (e.key === 'ArrowRight' ? 1 : -1));
  });

  // Only jump to a start card when the deck actually scrolls (on wide layouts it doesn't).
  if (startIndex > 0 && deck.scrollWidth > deck.clientWidth + 1) go(startIndex, false);
  update();
}
