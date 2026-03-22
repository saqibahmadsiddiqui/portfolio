import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-secret";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json({ error: "File and type required" }, { status: 400 });
    }

    const fileMap: Record<string, string> = {
      picture: "Picture.jpeg",
      resume:  "resume.pdf",
      icon:    "icon.svg",
    };

    const fileName = fileMap[type];
    if (!fileName) {
      return NextResponse.json({ error: "Invalid type. Use: picture, resume, icon" }, { status: 400 });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const publicDir = join(process.cwd(), "public");
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, fileName), buffer);

    return NextResponse.json({ status: "ok", file: fileName });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
