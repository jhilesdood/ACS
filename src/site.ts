import { getEntry } from 'astro:content';

/** Gym-wide facts from src/content/settings.yaml (edited in Keystatic under "Gym settings"). */
export async function getSite() {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('src/content/settings.yaml is missing');
  return entry.data;
}

export const nav = [
  { href: '/adults', label: 'Adults' },
  { href: '/youth', label: 'Youth' },
  { href: '/personal-training', label: 'Personal training' },
  { href: '/fight-team', label: 'Fight team' },
  { href: '/schedule', label: 'Schedule' },
];

/** Values starting with "TBD" render as visible placeholders. */
export const isTbd = (value: string) => value.trim().toUpperCase().startsWith('TBD');
