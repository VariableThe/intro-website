import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const file = searchParams.get("file");

  if (!file) {
    return new NextResponse("Missing file parameter", { status: 400 });
  }

  try {
    const remoteUrl = `https://nc.vrbl.win/public.php/webdav/${encodeURIComponent(file)}`;
    
    const res = await fetch(remoteUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from("q4tysLXz76Tw4YH:").toString("base64")}`,
      },
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch from Nextcloud", { status: res.status });
    }

    // Forward the image with appropriate headers
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
