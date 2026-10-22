import { config, collection, singleton, fields } from '@keystatic/core';

// Staff edit content at /keystatic. Locally it writes straight to src/content;
// in production set PUBLIC_KEYSTATIC_GITHUB_REPO ("owner/repo") so edits are committed to GitHub
// and Vercel rebuilds the site.
const repo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO as `${string}/${string}` | undefined;

const tbdHint = 'Start a value with "TBD" to show it as a placeholder on the site.';
const order = fields.integer({ label: 'Display order', description: 'Lower numbers show first.', defaultValue: 99 });
const shot = fields.text({ label: 'Shot ID', description: 'Photo slot from the shoot list in DESIGN.md, e.g. 4a.' });

export default config({
  storage: repo ? { kind: 'github', repo } : { kind: 'local' },
  ui: {
    brand: { name: 'ACS MMA' },
    navigation: {
      'Gym': ['settings', 'schedule', 'plans'],
      'People': ['coaches', 'fighters'],
      'Programs': ['disciplines'],
    },
  },
  singletons: {
    settings: singleton({
      label: 'Gym settings',
      path: 'src/content/settings',
      format: { data: 'yaml' },
      schema: {
        address: fields.text({ label: 'Street address', description: tbdHint }),
        city: fields.text({ label: 'City' }),
        phone: fields.text({ label: 'Phone' }),
        email: fields.text({ label: 'Public email' }),
        hours: fields.array(
          fields.object({ days: fields.text({ label: 'Days' }), time: fields.text({ label: 'Opening hours' }) }),
          { label: 'Opening hours', itemLabel: (p) => `${p.fields.days.value}: ${p.fields.time.value}` },
        ),
        youthAges: fields.text({ label: 'Youth ages', description: 'e.g. 7 to 14' }),
        youthRatio: fields.text({ label: 'Youth coaches per class' }),
        youthSafety: fields.array(
          fields.object({ label: fields.text({ label: 'Topic' }), value: fields.text({ label: 'Policy', multiline: true }) }),
          {
            label: 'Youth safety policy',
            description: 'Shown to parents on the youth page. Keep "Sparring policy" as a topic; the home page uses it.',
            itemLabel: (p) => p.fields.label.value,
          },
        ),
      },
    }),
    schedule: singleton({
      label: 'Class schedule',
      path: 'src/content/schedule',
      format: { data: 'yaml' },
      schema: {
        classes: fields.array(
          fields.object({
            day: fields.select({
              label: 'Day',
              options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({ label: d, value: d })),
              defaultValue: 'Mon',
            }),
            start: fields.text({ label: 'Start (24h, e.g. 18:00)' }),
            end: fields.text({ label: 'End (24h, e.g. 19:00)' }),
            title: fields.text({ label: 'Class name' }),
            discipline: fields.select({
              label: 'Discipline',
              options: ['MMA', 'BJJ', 'Muay Thai', 'Wrestling', 'Boxing', 'Youth', 'Open mat'].map((d) => ({ label: d, value: d })),
              defaultValue: 'MMA',
            }),
            level: fields.select({
              label: 'Level',
              options: ['All levels', 'Beginner', 'Intermediate', 'Advanced', 'Fight team', 'Youth'].map((d) => ({ label: d, value: d })),
              defaultValue: 'All levels',
            }),
          }),
          {
            label: 'Classes',
            itemLabel: (p) => `${p.fields.day.value} ${p.fields.start.value} ${p.fields.title.value}`,
          },
        ),
      },
    }),
  },
  collections: {
    plans: collection({
      label: 'Membership plans',
      path: 'src/content/plans/*',
      slugField: 'name',
      format: { data: 'yaml' },
      schema: {
        name: fields.slug({ name: { label: 'Plan name' } }),
        order,
        audience: fields.select({
          label: 'Who it is for',
          options: [
            { label: 'Adults', value: 'adult' },
            { label: 'Youth (guardian signs up)', value: 'youth' },
          ],
          defaultValue: 'adult',
        }),
        price: fields.text({ label: 'Price shown', description: 'e.g. $150. Must match the Stripe price.' }),
        period: fields.text({ label: 'Billing period', defaultValue: 'per month' }),
        summary: fields.text({ label: 'One-line summary' }),
        includes: fields.array(fields.text({ label: 'Item' }), { label: "What's included", itemLabel: (p) => p.value }),
        stripePriceId: fields.text({
          label: 'Stripe Price ID',
          description: 'From Stripe > Product catalog > price (starts with price_). Leave empty to turn off online sign-up for this plan.',
        }),
        featured: fields.checkbox({ label: 'Highlight this plan' }),
        badge: fields.text({
          label: 'Label on the card',
          description: 'Short tag such as "Recommended". Leave empty for none. Avoid claims you can\'t back up, like "Most popular".',
        }),
      },
    }),
    coaches: collection({
      label: 'Coaches',
      path: 'src/content/coaches/*',
      slugField: 'name',
      format: { data: 'yaml' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        order,
        role: fields.text({ label: 'Role', description: 'e.g. Head coach, MMA' }),
        credentials: fields.array(fields.text({ label: 'Credential' }), {
          label: 'Credentials',
          description: 'Real, verifiable only: belt rank, certifications, background check.',
          itemLabel: (p) => p.value,
        }),
        bio: fields.text({ label: 'Bio', multiline: true }),
        trainsPrivate: fields.checkbox({ label: 'Offers personal training' }),
        shot,
      },
    }),
    fighters: collection({
      label: 'Fight team',
      path: 'src/content/fighters/*',
      slugField: 'name',
      format: { data: 'yaml' },
      schema: {
        name: fields.slug({ name: { label: 'Fighter name' } }),
        order,
        nickname: fields.text({ label: 'Nickname' }),
        division: fields.text({ label: 'Division', description: 'e.g. Lightweight (155 lb)' }),
        wins: fields.integer({ label: 'Wins', defaultValue: 0 }),
        losses: fields.integer({ label: 'Losses', defaultValue: 0 }),
        draws: fields.integer({ label: 'Draws', defaultValue: 0 }),
        titles: fields.array(fields.text({ label: 'Title' }), { label: 'Titles', itemLabel: (p) => p.value }),
        nextBout: fields.text({ label: 'Next bout', description: 'Event, date and opponent. Leave empty if none.' }),
        tapology: fields.url({ label: 'Tapology profile URL', validation: { isRequired: false } }),
        shot,
      },
    }),
    disciplines: collection({
      label: 'Adult disciplines',
      path: 'src/content/disciplines/*',
      slugField: 'name',
      format: { data: 'yaml' },
      schema: {
        name: fields.slug({ name: { label: 'Discipline name' } }),
        order,
        short: fields.text({ label: 'Short label', description: 'e.g. Gi and no-gi grappling' }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        classLooksLike: fields.text({ label: 'What a class looks like', multiline: true }),
        gear: fields.text({ label: 'What to bring', multiline: true }),
        shot,
      },
    }),
  },
});
