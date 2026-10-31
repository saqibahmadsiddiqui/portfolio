import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const GMAIL_USER       = process.env.GMAIL_USER || "";
const GMAIL_PASSWORD   = process.env.GMAIL_APP_PASSWORD || "";
const MAILBOXLAYER_KEY = process.env.MAILBOXLAYER_KEY || "";

async function validateEmail(email: string): Promise<{ valid: boolean; reason: string }> {
  if (!MAILBOXLAYER_KEY) return { valid: true, reason: "skipped" };
  try {
    const r = await fetch(
      `http://apilayer.net/api/check?access_key=${MAILBOXLAYER_KEY}&email=${encodeURIComponent(email)}&smtp=1&format=1`,
      { signal: AbortSignal.timeout(6000) }
    );
    const d = await r.json();
    if (d.error)                  return { valid: true,  reason: "skipped" };
    if (d.format_valid === false) return { valid: false, reason: "invalid" };
    if (d.mx_found === false)     return { valid: false, reason: "invalid domain" };
    if (d.disposable === true)    return { valid: false, reason: "disposable" };
    return { valid: true, reason: "valid" };
  } catch {
    return { valid: true, reason: "skipped" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 422 });
    }

    const { valid, reason } = await validateEmail(email);
    if (!valid) {
      const msg =
        reason === "invalid domain" ? "Email domain does not accept mail. Please use a real email address." :
        reason === "disposable"     ? "Disposable emails are not accepted. Please use a real email address." :
                                      "Email appears to be invalid. Please use a real email address.";
      return NextResponse.json({ error: msg }, { status: 422 });
    }

    if (!GMAIL_USER || !GMAIL_PASSWORD) {
      return NextResponse.json({ status: "ok", message: "dev mode" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD },
    });

    const subjectLine = subject?.trim() || "New Message";
    const sentDate    = new Date().toLocaleString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    });

    // ── 1. Notification email to portfolio owner ──────────────────────────────
    await transporter.sendMail({
      from:    `"Portfolio Contact" <${GMAIL_USER}>`,
      to:      GMAIL_USER,
      replyTo: email,
      subject: `[Portfolio] ${subjectLine} | ${name}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:620px;margin:0 auto;background:#0c1424;color:#e2e8f0;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#1e3a5f,#0f2647);padding:28px 32px;border-bottom:1px solid #1e3a6e">
            <h2 style="margin:0;font-size:18px;font-weight:600;color:#ffffff;letter-spacing:-0.3px">New Portfolio Message</h2>
            <p style="margin:4px 0 0;font-size:13px;color:#7fa8d4">${sentDate}</p>
          </div>
          <div style="padding:28px 32px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr>
                <td style="padding:8px 0;color:#7fa8d4;width:72px;vertical-align:top;font-weight:500">From</td>
                <td style="padding:8px 0;color:#f0f4ff;font-weight:600">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#7fa8d4;border-top:1px solid #1a2d4a;vertical-align:top;font-weight:500">Email</td>
                <td style="padding:8px 0;border-top:1px solid #1a2d4a"><a href="mailto:${email}" style="color:#60a5fa;text-decoration:none">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#7fa8d4;border-top:1px solid #1a2d4a;vertical-align:top;font-weight:500">Subject</td>
                <td style="padding:8px 0;border-top:1px solid #1a2d4a;color:#f0f4ff">${subjectLine}</td>
              </tr>
            </table>
            <div style="margin-top:24px;padding:20px;background:#111e33;border-radius:8px;border-left:3px solid #3b82f6">
              <p style="margin:0;font-size:14px;line-height:1.75;color:#cbd5e1;white-space:pre-wrap">${message}</p>
            </div>
            <div style="margin-top:20px;padding:12px 16px;background:#0e1e38;border-radius:6px;border:1px solid #1e3a6e">
              <p style="margin:0;font-size:12px;color:#4a6fa5">
                Hit <strong style="color:#60a5fa">Reply</strong> to respond directly to ${name} at ${email}
              </p>
            </div>
          </div>
          <div style="padding:16px 32px;border-top:1px solid #1a2d4a;background:#090f1e">
            <p style="margin:0;font-size:11px;color:#2d4a6a">Sent via your portfolio contact form</p>
          </div>
        </div>`,
    });

    // ── 2. Thank-you confirmation email to sender ─────────────────────────────
    await transporter.sendMail({
      from:    `"Saqib Ahmad" <${GMAIL_USER}>`,
      to:      email,
      subject: `Re: ${subjectLine}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:620px;margin:0 auto;background:#ffffff;color:#1a1a2e;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#1e3a5f,#0f2647);padding:28px 32px">
            <h2 style="margin:0;font-size:18px;font-weight:600;color:#ffffff">Thanks for reaching out, ${name}!</h2>
            <p style="margin:6px 0 0;font-size:13px;color:#93c5fd">I've received your message and will get back to you shortly.</p>
          </div>
          <div style="padding:28px 32px">
            <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#374151">
              Hi <strong>${name}</strong>,
            </p>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#374151">
              Thank you for getting in touch through my portfolio. I've received your message and will respond as soon as possible - typically within 24 to 48 hours.
            </p>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#374151">
              In the meantime, feel free to connect with me on
              <a href="https://www.linkedin.com/in/saqib-ahmad-siddiqui" style="color:#2563eb;text-decoration:none;font-weight:500">LinkedIn</a>.
            </p>

            <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:4px">
              <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#9ca3af;letter-spacing:0.5px;text-transform:uppercase">Your message</p>
              <div style="background:#f9fafb;border-left:3px solid #2563eb;border-radius:0 6px 6px 0;padding:16px 18px">
                <p style="margin:0 0 6px;font-size:12px;color:#6b7280">Subject: ${subjectLine}</p>
                <p style="margin:0;font-size:14px;line-height:1.75;color:#374151;white-space:pre-wrap">${message}</p>
              </div>
            </div>

            <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb">
              <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827">Saqib Ahmad Siddiqui</p>
              <p style="margin:0;font-size:13px;color:#6b7280">AI/ML & Software Engineer</p>
            </div>
          </div>
          <div style="padding:14px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:11px;color:#9ca3af">This is an automated confirmation. Please do not reply to this email.</p>
          </div>
        </div>`,
    });

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: err.message || "Failed to send email." }, { status: 500 });
  }
}
