import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

// All content lives in src/content as YAML and is edited through Keystatic (/keystatic, see keystatic.config.ts).
// Folders hold one file per entry (the filename is the id). Values that start with "TBD" render as
// visible placeholders until the gym supplies real facts.

const entries = (folder: string) => glob({ pattern: '*.yaml', base: `src/content/${folder}` });

const disciplines = defineCollection({
  loader: entries('disciplines'),
  schema: z.object({
    order: z.number().default(99),
    name: z.string(),
    short: z.string(),
    summary: z.string(),
    classLooksLike: z.string(),
    gear: z.string(),
    shot: z.string(),
  }),
});

const fighters = defineCollection({
  loader: entries('fighters'),
  schema: z.object({
    order: z.number().default(99),
    name: z.string(),
    nickname: z.string().nullish().transform((v) => v || undefined),
    division: z.string(),
    wins: z.coerce.string(),
    losses: z.coerce.string(),
    draws: z.coerce.string(),
    titles: z.array(z.string()).default([]),
    nextBout: z.string().nullish().transform((v) => v || undefined),
    tapology: z.url().nullish().or(z.literal('')).transform((v) => v || undefined),
    shot: z.string(),
  }),
});

const coaches = defineCollection({
  loader: entries('coaches'),
  schema: z.object({
    order: z.number().default(99),
    name: z.string(),
    role: z.string(),
    credentials: z.array(z.string()).default([]),
    bio: z.string(),
    trainsPrivate: z.boolean().default(false),
    shot: z.string(),
  }),
});

const plans = defineCollection({
  loader: entries('plans'),
  schema: z.object({
    order: z.number().default(99),
    name: z.string(),
    audience: z.enum(['adult', 'youth']),
    price: z.string(),
    period: z.string(),
    summary: z.string(),
    includes: z.array(z.string()),
    stripePriceId: z.string().nullish().transform((v) => v || undefined),
    featured: z.boolean().default(false),
    badge: z.string().nullish().transform((v) => v || undefined),
  }),
});

// Single-file content: the schedule (a list of classes) and gym-wide settings.
const schedule = defineCollection({
  loader: file('src/content/schedule.yaml', {
    parser: (text) => (parse(text).classes ?? []).map((c: object, i: number) => ({ id: String(i), ...c })),
  }),
  schema: z.object({
    day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
    start: z.coerce.string(),
    end: z.coerce.string(),
    title: z.string(),
    discipline: z.enum(['MMA', 'BJJ', 'Muay Thai', 'Wrestling', 'Boxing', 'Youth', 'Open mat']),
    level: z.enum(['All levels', 'Beginner', 'Intermediate', 'Advanced', 'Fight team', 'Youth']),
  }),
});

const settings = defineCollection({
  loader: file('src/content/settings.yaml', { parser: (text) => [{ id: 'site', ...parse(text) }] }),
  schema: z.object({
    city: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.string(),
    hours: z.array(z.object({ days: z.string(), time: z.string() })),
    youthAges: z.string(),
    youthRatio: z.string(),
    youthSafety: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }),
});

export const collections = { disciplines, fighters, coaches, plans, schedule, settings };
