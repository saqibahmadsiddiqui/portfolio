import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic     = "force-dynamic";
export const maxDuration = 30;

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET() {
  // Try DB — 15s timeout (enough for HuggingFace to respond if already awake)
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    const r = await fetch(`${API}/api/files/resume`, { signal: controller.signal, cache: "no-store" });
    clearTimeout(t);
    if (r.ok) {
      const data = await r.arrayBuffer();
      return new Response(data, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline; filename=resume.pdf",
          "Cache-Control": "no-store",
        },
      });
    }
  } catch {}

  // Fall back to static file
  try {
    const data = await readFile(join(process.cwd(), "public", "resume.pdf"));
    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=resume.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch {}

  return new Response("Resume not found.", { status: 404 });
}
