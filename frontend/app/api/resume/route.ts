import { readFile } from "fs/promises";
import { join } from "path";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET() {
  // Try DB first — 5s timeout so it doesn't hang if HuggingFace is sleeping
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    const r = await fetch(`${API}/api/files/resume`, { signal: controller.signal, cache: "no-store" });
    clearTimeout(t);
    if (r.ok) {
      const data = await r.arrayBuffer();
      return new Response(data, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline; filename=resume.pdf",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch {}

  // Fall back to static file in public/ (readable on Vercel, only writing is restricted)
  try {
    const data = await readFile(join(process.cwd(), "public", "resume.pdf"));
    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=resume.pdf",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {}

  return new Response("Resume not found. Please upload one via the admin dashboard.", { status: 404 });
}
