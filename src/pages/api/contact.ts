import type { APIRoute } from 'astro';
import { notifyGym } from '../../lib/mail';

export const prerender = false;

const subjects = {
  consult: 'Personal training consult request',
  contact: 'Website message',
  youth: 'Youth program question',
} as const;

// Best-effort rate limit per server instance: 5 submissions per IP per 10 minutes.
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
};

const clean = (v: FormDataEntryValue | null, max = 2000) => String(v ?? '').trim().slice(0, max);

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json');
  const fail = (status: number, error: string) =>
    wantsJson ? Response.json({ error }, { status }) : new Response(error, { status });

  const form = await request.formData();
  const type = clean(form.get('type')) as keyof typeof subjects;
  const done = () => (wantsJson ? Response.json({ ok: true }) : redirect('/sent', 303));

  // Honeypot: bots fill the hidden field. Pretend success.
  if (clean(form.get('website'))) return done();
  if (!(type in subjects)) return fail(400, 'Unknown form.');
  if (limited(clientAddress)) return fail(429, 'Too many messages in a short time. Wait a few minutes.');

  const name = clean(form.get('name'), 200);
  const email = clean(form.get('email'), 200);
  if (!name) return fail(400, 'Enter your name.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, 'Enter a valid email address.');

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${clean(form.get('phone'), 50) || 'not given'}`,
    ...(type === 'consult' ? [`Goal: ${clean(form.get('goal'), 100)}`] : []),
    ...(type === 'youth' ? [`Child's age: ${clean(form.get('childAge'), 20) || 'not given'}`] : []),
    '',
    clean(form.get('message')) || '(no message)',
  ];

  try {
    await notifyGym(`${subjects[type]}: ${name}`, lines, email);
  } catch (err) {
    console.error('[contact]', err);
    return fail(503, 'The message did not send.');
  }
  return done();
};
