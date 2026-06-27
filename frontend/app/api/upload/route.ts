import { NextRequest, NextResponse } from "next/server";

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

    // Convert to base64
    const bytes    = await file.arrayBuffer();
    const base64   = Buffer.from(bytes).toString("base64");
    const contentType = file.type || TYPE_MAP[type];

    // Store in NeonDB via backend
    const r = await fetch(`${API}/api/admin/files/${type}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Secret": secret },
      body: JSON.stringify({ content_type: contentType, data: base64 }),
    });

    if (!r.ok) {
      const e = await r.json().catch(() => ({ detail: "Backend error" }));
      throw new Error(e.detail || "Failed to save file");
    }

    return NextResponse.json({ status: "ok", type });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
