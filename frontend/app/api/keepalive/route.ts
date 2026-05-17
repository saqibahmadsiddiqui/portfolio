import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "";

export async function GET() {
  if (!API) return NextResponse.json({ error: "No API URL set" }, { status: 400 });
  try {
    const start = Date.now();
    const r = await fetch(`${API}/`, { cache: "no-store" });
    const ms = Date.now() - start;
    return NextResponse.json({ status: r.ok ? "ok" : "error", ms, time: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
