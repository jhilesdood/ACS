import { Resend } from 'resend';
import { RESEND_API_KEY, GYM_INBOX, MAIL_FROM } from 'astro:env/server';

export const mailConfigured = Boolean(RESEND_API_KEY && GYM_INBOX && MAIL_FROM);

/** Send a plain-text notice to the gym inbox. In dev without keys it logs instead. */
export async function notifyGym(subject: string, lines: string[], replyTo?: string) {
  const text = lines.join('\n');
  if (!mailConfigured) {
    if (import.meta.env.DEV) {
      console.log(`[mail:dev] ${subject}\n${text}`);
      return;
    }
    throw new Error('Email is not configured.');
  }
  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: MAIL_FROM!,
    to: GYM_INBOX!,
    subject,
    text,
    replyTo,
  });
  if (error) throw new Error(error.message);
}
