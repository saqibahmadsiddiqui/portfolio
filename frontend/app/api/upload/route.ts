import { NextRequest, NextResponse } from "next/server";

export const dynamic    = "force-dynamic";
export const maxDuration = 60; // extend Vercel function timeout to 60s

const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-secret";
const API          = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TYPE_MAP: Record<string, string> = {
  picture: "image/jpeg",
  resume:  "application/pdf",
  icon:    "image/svg+xml",
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData    = await req.formData();
    const file        = formData.get("file") as File;
    const type        = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json({ error: "File and type required" }, { status: 400 });
    }
    if (!TYPE_MAP[type]) {
      return NextResponse.json({ error: "Invalid type. Use: picture, resume, icon" }, { status: 400 });
    }

    const bytes       = await file.arrayBuffer();
    const base64      = Buffer.from(bytes).toString("base64");
    const contentType = file.type || TYPE_MAP[type];

    // Give HuggingFace up to 55s to wake up and process (just under our 60s maxDuration)
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 55000);

    const r = await fetch(`${API}/api/admin/files/${type}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Secret": secret },
      body: JSON.stringify({ content_type: contentType, data: base64 }),
      signal: controller.signal,
    });
    clearTimeout(t);

    if (!r.ok) {
      const e = await r.json().catch(() => ({ detail: "Backend error" }));
      throw new Error(e.detail || `Backend returned ${r.status}`);
    }

    // Verify it was actually saved by reading it back
    const verify = await fetch(`${API}/api/files/${type}`, { cache: "no-store" });
    const savedSize = verify.ok ? (await verify.arrayBuffer()).byteLength : 0;

    return NextResponse.json({
      status:    "ok",
      type,
      uploaded:  bytes.byteLength,
      savedSize,
      verified:  verify.ok && savedSize > 0,
    });
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Upload timed out. HuggingFace may be waking up — try again in 30 seconds." }, { status: 504 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
