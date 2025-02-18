import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const dirPath = path.join(process.cwd(), "saved-snippets");
    await fs.mkdir(dirPath, { recursive: true }); // Ensure directory exists

    const filePath = path.join(dirPath, `snippet-${Date.now()}.js`);
    await fs.writeFile(filePath, code, "utf8"); // Save snippet

    return NextResponse.json({ message: "Snippet saved successfully!" }, { status: 200 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Failed to save snippet" }, { status: 500 });
  }
}
