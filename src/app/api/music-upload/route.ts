// ─── POST /api/music-upload ────────────────────────────────────────────────────
// Admin endpoint: upload a new Apple Music XML export.
// Saves it as public/music/library.xml, then clears the parsed cache so
// the next API call triggers a fresh parse + artwork enrichment.
//
// Protected by ADMIN_SECRET env var (sent as Authorization: Bearer <secret>)

import { NextResponse, type NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const XML_PATH = path.join(process.cwd(), "public", "music", "library.xml");
const PARSED_CACHE_PATH = path.join(process.cwd(), "public", "music", "library-parsed.json");

export async function POST(request: NextRequest) {
  // Auth check
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret) {
    const auth = request.headers.get("authorization");
    if (!auth || auth !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const formData = await request.formData();
    const file = formData.get("library") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided. Use field name 'library'" }, { status: 400 });
    }

    if (!file.name.endsWith(".xml")) {
      return NextResponse.json({ error: "File must be an XML file" }, { status: 400 });
    }

    const content = await file.text();

    // Basic validation: check it looks like an Apple Music plist
    if (!content.includes("<!DOCTYPE plist") && !content.includes("<plist")) {
      return NextResponse.json({ error: "File does not appear to be an Apple plist XML" }, { status: 400 });
    }

    if (!content.includes("Tracks") || !content.includes("Track ID")) {
      return NextResponse.json({ error: "File does not appear to be an Apple Music library XML" }, { status: 400 });
    }

    // Ensure directory exists
    const dir = path.dirname(XML_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Backup previous library
    if (fs.existsSync(XML_PATH)) {
      const backupPath = XML_PATH.replace(".xml", `-backup-${Date.now()}.xml`);
      fs.copyFileSync(XML_PATH, backupPath);
    }

    // Write new XML
    fs.writeFileSync(XML_PATH, content, "utf-8");

    // Clear parsed cache so next request triggers fresh parse
    if (fs.existsSync(PARSED_CACHE_PATH)) {
      fs.unlinkSync(PARSED_CACHE_PATH);
    }

    const stats = fs.statSync(XML_PATH);
    return NextResponse.json({
      success: true,
      message: "Library uploaded successfully. Cache cleared — next request will re-parse.",
      sizeBytes: stats.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[music-upload] Error:", error);
    return NextResponse.json({ error: "Upload failed", details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const exists = fs.existsSync(XML_PATH);
  const parsedExists = fs.existsSync(PARSED_CACHE_PATH);

  let lastModified: string | null = null;
  let sizeBytes: number | null = null;
  if (exists) {
    const stat = fs.statSync(XML_PATH);
    lastModified = stat.mtime.toISOString();
    sizeBytes = stat.size;
  }

  return NextResponse.json({
    libraryExists: exists,
    parsedCacheExists: parsedExists,
    lastModified,
    sizeBytes,
  });
}
