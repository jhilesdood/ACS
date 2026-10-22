# ACS MMA website

Astro 7 site for ACS MMA: adult programs, youth program, personal training, fight team, schedule and online memberships (Stripe). Content is edited in Keystatic. Design rules and the photo shoot list are in [DESIGN.md](DESIGN.md).

## Run it

```sh
npm install
npm run dev          # http://localhost:4321, CMS at http://localhost:4321/keystatic
npm run build        # production build (Vercel output in .vercel/output)
npm run check        # type check
```

## Editing content

Open `/keystatic`. Everything a member sees is editable there:

| Section | What it controls | Files |
|---|---|---|
| Gym settings | Address, hours, phone, email, youth ages and safety policy | `src/content/settings.yaml` |
| Class schedule | The weekly timetable (currently a **sample**) | `src/content/schedule.yaml` |
| Membership plans | Names, prices, what's included, Stripe Price ID | `src/content/plans/` |
| Coaches, Fight team | People, credentials, records | `src/content/coaches/`, `src/content/fighters/` |
| Adult disciplines | Discipline descriptions | `src/content/disciplines/` |

Any value starting with **TBD** shows on the site as a visible placeholder. Replace TBDs with real facts only.

## Going live checklist

1. **Content:** replace every TBD (search the site for "TBD"), the sample schedule, and the photo placeholders (see the shoot list in DESIGN.md). The logo is in place (see DESIGN.md if it ever changes).
2. **Legal:** waiver, membership terms and privacy text from the gym's lawyer or insurer (`src/pages/waiver.astro`, `terms.astro`, `privacy.astro`). Do not take payments without the waiver.
3. **Stripe** (test mode first):
   - Create one Product + monthly Price per plan; paste each `price_...` ID into the plan in Keystatic.
   - Settings > Public details: set the Terms of service URL to `https://<domain>/terms` (required by checkout).
   - Settings > Billing > Customer portal: enable cancellations and card updates, copy the login link into `PUBLIC_PORTAL_LOGIN_URL`.
   - Developers > Webhooks: add `https://<domain>/api/stripe-webhook` with `checkout.session.completed` and `customer.subscription.deleted`; copy the signing secret.
4. **Waiver tool:** set up Smartwaiver or similar with guardian signing for minors; put its link in `PUBLIC_WAIVER_URL`.
5. **Email:** Resend account, verify the sending domain, set `RESEND_API_KEY`, `GYM_INBOX`, `MAIL_FROM`.
6. **Hosting:** push to GitHub, import into Vercel, add the variables from `.env.example`, set `SITE_URL` and update `public/robots.txt` with the domain. Set `PUBLIC_KEYSTATIC_GITHUB_REPO` and connect Keystatic's GitHub app so staff edits work in production.

## Testing

```sh
npm run dev
node scripts/shots.mjs http://localhost:4321 / /youth   # screenshots at 375/768/1024/1440 → screenshots/
REDUCED=1 node scripts/shots.mjs                        # same, with reduced motion
npm run build && (cd .vercel/output/static && python3 -m http.server 4400) &
node scripts/a11y.mjs http://127.0.0.1:4400             # axe scan of every page
```

Stripe end to end (test mode): `stripe listen --forward-to localhost:4321/api/stripe-webhook`, then join with card `4242 4242 4242 4242`; the gym inbox should get a "New member" email, and the youth plan should require guardian and child fields.
