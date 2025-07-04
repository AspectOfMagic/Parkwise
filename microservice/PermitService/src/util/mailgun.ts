import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'key',
});

export async function sendEmail(to: string, subject: string, text: string) {
  return mg.messages.create(process.env.MAILGUN_DOMAIN || 'domain', {
    from: process.env.MAILGUN_FROM_EMAIL || 'email',
    to,
    subject,
    text,
  });
}
