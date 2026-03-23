import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-secret";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (process.env.VERCEL === "1") {
    return NextResponse.json({ error: "File uploads not supported on Vercel. Use git push instead." }, { status: 503 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const publicDir = join(process.cwd(), "public");
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, "Picture.jpeg"), buffer);
    return NextResponse.json({ status: "ok", file: "Picture.jpeg" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
