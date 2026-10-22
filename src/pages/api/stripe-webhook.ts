import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from 'astro:env/server';
import { notifyGym } from '../../lib/mail';

export const prerender = false;

// Stripe sends events here (Dashboard > Developers > Webhooks, or `stripe listen` locally).
export const POST: APIRoute = async ({ request }) => {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) return new Response('Not configured', { status: 503 });

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const signature = request.headers.get('stripe-signature') ?? '';
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response('Bad signature', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const fields = (s.custom_fields ?? []).map((f) => `${f.label.custom}: ${f.text?.value ?? ''}`);
      await notifyGym(`New member: ${s.customer_details?.name ?? s.customer_details?.email}`, [
        `Plan: ${s.metadata?.plan ?? 'unknown'}`,
        `Name: ${s.customer_details?.name ?? ''}`,
        `Email: ${s.customer_details?.email ?? ''}`,
        `Phone: ${s.customer_details?.phone ?? ''}`,
        ...fields,
        '',
        'Check the waiver is signed before their first class.',
      ]);
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const customer = await stripe.customers.retrieve(String(sub.customer));
      const who = customer.deleted ? String(sub.customer) : `${customer.name ?? ''} <${customer.email ?? ''}>`;
      await notifyGym(`Membership cancelled: ${who}`, [`Plan: ${sub.metadata?.plan ?? 'unknown'}`, `Customer: ${who}`]);
    }
  } catch (err) {
    // Return 500 so Stripe retries the event later.
    console.error('[stripe-webhook]', err);
    return new Response('Handler error', { status: 500 });
  }

  return new Response('ok');
};
