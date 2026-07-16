import { NextResponse } from "next/server";
import { resolveSingleArtwork } from "@/lib/music/artworkResolver";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const album = searchParams.get("album");
    const artist = searchParams.get("artist");

    if (!album || !artist) {
      return NextResponse.json({ error: "Missing album or artist" }, { status: 400 });
    }

    const result = await resolveSingleArtwork(album, artist);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/music/resolve-artwork] Failed:", error);
    return NextResponse.json({ artworkUrl: "/music/placeholder.png" }, { status: 500 });
  }
}
