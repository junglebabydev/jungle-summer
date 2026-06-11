// ============================================================
// POST /api/share — email a "thing to do" link via Resend.
// Body: { email, eventId, eventTitle, eventVenue?, eventArea? }
// Requires env: RESEND_API_KEY, optional SHARE_FROM_EMAIL.
// ============================================================
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = (body.email || '').trim();
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Email sending is not configured yet.' },
      { status: 503 }
    );
  }

  const from = process.env.SHARE_FROM_EMAIL || 'Jungle Summer <summer@jungle.baby>';
  const title = body.eventTitle || 'this thing to do';
  const link = `https://jungle.baby/summer/${body.eventId || ''}`;
  const where = [body.eventVenue, body.eventArea].filter(Boolean).join(', ');

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: `${title} — Summer in SG`,
      html: emailHtml({ title, link, where }),
    });
    if (error) {
      return Response.json({ error: 'Could not send the email. Try again.' }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Could not send the email. Try again.' }, { status: 502 });
  }
}

function emailHtml({ title, link, where }) {
  return `<!doctype html>
<html><body style="margin:0;background:#F5F5F0;font-family:Manrope,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,.06);">
      <div style="background:#0C3C26;padding:22px 28px;">
        <span style="color:#9FE3BD;font-size:13px;font-weight:700;letter-spacing:.04em;">SUMMER IN SG</span>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 6px;font-size:13.5px;color:#666;">Here's the thing to do you saved:</p>
        <h1 style="margin:0 0 ${where ? '6px' : '20px'};font-size:24px;line-height:1.2;color:#0C3C26;">${escapeHtml(title)}</h1>
        ${where ? `<p style="margin:0 0 20px;font-size:14.5px;color:#666;">📍 ${escapeHtml(where)}</p>` : ''}
        <a href="${escapeHtml(link)}" style="display:inline-block;background:#009B4D;color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:9999px;">View details</a>
        <p style="margin:24px 0 0;font-size:12.5px;color:#999;">Or open this link:<br><a href="${escapeHtml(link)}" style="color:#009B4D;">${escapeHtml(link)}</a></p>
      </div>
    </div>
    <p style="text-align:center;margin:20px 0 0;font-size:12px;color:#aaa;">Singapore's guide to kids' activities, camps and things to do.</p>
  </div>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}
