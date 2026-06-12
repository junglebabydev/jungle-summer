import { Resend } from "resend";

export async function POST(request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Email sending is not configured yet." },
        { status: 503 },
      );
    }
    const resend = new Resend(apiKey);

    const { to, subject, html, text } = await request.json();

    const data = await resend.emails.send({
      from: "Jungle Contact Form <noreply@notifications.jungle.baby>",
      to: to || ["support@jungle.baby", "devs@jungle.baby"],
      subject: subject || "New Contact Form Submission",
      html: html,
      text: text,
    });

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
