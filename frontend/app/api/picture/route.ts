import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET() {
  try {
    const r = await fetch(`${API}/api/files/picture`, { next: { revalidate: 3600 } });
    if (r.ok) {
      const data = await r.arrayBuffer();
      return new Response(data, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch {}
  // Fallback to static file
  return NextResponse.redirect(new URL("/Picture.jpeg", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
