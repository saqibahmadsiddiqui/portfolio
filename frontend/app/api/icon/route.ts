import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET() {
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
          "Cache-Control": "no-store",
        },
      });
    }
  } catch {}

  try {
    const data = await readFile(join(process.cwd(), "public", "icon.svg"));
    return new Response(data, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store",
      },
    });
  } catch {}

  return new Response("Icon not found.", { status: 404 });
}
