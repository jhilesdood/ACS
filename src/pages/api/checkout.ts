import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from 'astro:env/server';

export const prerender = false;

export const POST: APIRoute = async ({ request, url, redirect }) => {
  const form = await request.formData();
  const planId = String(form.get('plan') ?? '');
  const plan = await getEntry('plans', planId);

  if (!plan) return redirect('/join/not-available', 303);
  if (!STRIPE_SECRET_KEY || !plan.data.stripePriceId) return redirect('/join/not-available', 303);

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const youth = plan.data.audience === 'youth';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.data.stripePriceId, quantity: 1 }],
      success_url: `${url.origin}/join/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/memberships#plan-${planId}`,
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      // Terms of service URL is set in the Stripe dashboard (Settings > Public details) and must link /terms.
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: {
          message: `I agree to the [membership terms](${url.origin}/terms) and will sign the [liability waiver](${url.origin}/waiver) before training.${youth ? ' I am 18 or older and the parent or legal guardian of the child named above.' : ''}`,
        },
      },
      custom_fields: youth
        ? [
            { key: 'guardian_name', label: { type: 'custom', custom: 'Parent or guardian full name' }, type: 'text' },
            { key: 'child_name', label: { type: 'custom', custom: "Child's full name" }, type: 'text' },
            {
              key: 'child_dob',
              label: { type: 'custom', custom: "Child's date of birth (DD/MM/YYYY)" },
              type: 'text',
              text: { minimum_length: 8, maximum_length: 10 },
            },
          ]
        : [],
      subscription_data: { metadata: { plan: planId } },
      metadata: { plan: planId },
    });
    return redirect(session.url!, 303);
  } catch (err) {
    console.error('[checkout]', err);
    return redirect('/join/not-available', 303);
  }
};
