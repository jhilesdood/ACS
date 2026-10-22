// @ts-check
import { defineConfig, envField } from 'astro/config';

import vercel from '@astrojs/vercel';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TBD: real domain
  site: process.env.SITE_URL || 'https://example.com',

  adapter: vercel(),
  // The dev toolbar sits on top of the mobile thumb bar; keep it off.
  devToolbar: { enabled: false },

  env: {
    schema: {
      // Stripe (server only). Without these, checkout shows "online sign-up is not switched on yet".
      STRIPE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      STRIPE_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Resend email (server only). The gym inbox receives inquiries and new-member notices.
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GYM_INBOX: envField.string({ context: 'server', access: 'secret', optional: true }),
      MAIL_FROM: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Public links
      PUBLIC_WAIVER_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_PORTAL_LOGIN_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      // Keystatic in production: "owner/repo" of the GitHub repo it commits content edits to.
      PUBLIC_KEYSTATIC_GITHUB_REPO: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },

  integrations: [
    react(),
    keystatic(),
    sitemap({ filter: (page) => !/\/(keystatic|join|sent|account)\b/.test(new URL(page).pathname) }),
  ],
});