import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const GMAIL_USER     = process.env.GMAIL_USER || "";
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD || "";
const ZB_KEY         = process.env.ZEROBOUNCE_KEY || "";

async function validateEmail(email: string): Promise<{ valid: boolean; reason: string }> {
  if (!ZB_KEY) return { valid: true, reason: "skipped" };
  try {
    const r = await fetch(
      `https://api.zerobounce.net/v2/validate?api_key=${ZB_KEY}&email=${encodeURIComponent(email)}`
    );
    const d = await r.json();
    if (d.status === "valid") return { valid: true, reason: "valid" };
    return { valid: false, reason: d.status || "invalid" };
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

    const { valid, reason } = await validateEmail(email);
    if (!valid) {
      return NextResponse.json(
        { error: `Email appears to be ${reason}. Please use a real email address.` },
        { status: 422 }
      );
    }

    if (!GMAIL_USER || !GMAIL_PASSWORD) {
      return NextResponse.json({ status: "ok", message: "dev mode" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_PASSWORD },
    });

    await transporter.sendMail({
      from:    `"Portfolio Contact" <${GMAIL_USER}>`,
      to:      GMAIL_USER,
      replyTo: email,
      subject: `[Portfolio] ${subject || "New message"} — from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;background:#0c1424;color:#e2e8f0;padding:32px;border-radius:12px">
          <h2 style="color:#60a5fa;margin-top:0">New Portfolio Message</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#8899bb;width:70px">From</td><td style="padding:6px 0;color:#f0f4ff"><strong>${name}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#8899bb">Email</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:#60a5fa">${email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#8899bb">Subject</td><td style="padding:6px 0;color:#f0f4ff">${subject || "—"}</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#111e33;border-radius:8px;border-left:3px solid #3b82f6">
            <p style="margin:0;line-height:1.7;color:#cbd5e1;white-space:pre-wrap">${message}</p>
          </div>
          <p style="margin-top:20px;color:#3d5278;font-size:12px">Sent via your portfolio contact form</p>
        </div>`,
    });

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: err.message || "Failed to send email." }, { status: 500 });
  }
}
