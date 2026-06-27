import { readFile } from "fs/promises";
import { join } from "path";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET() {
  // Try DB first — 3s timeout (icon needs to load fast)
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    const r = await fetch(`${API}/api/files/icon`, { signal: controller.signal, cache: "no-store" });
    clearTimeout(t);
    if (r.ok) {
      const data = await r.arrayBuffer();
      return new Response(data, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch {}

  // Fall back to static file in public/
  try {
    const data = await readFile(join(process.cwd(), "public", "icon.svg"));
    return new Response(data, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {}

  return new Response("Icon not found.", { status: 404 });
}
