import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
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
