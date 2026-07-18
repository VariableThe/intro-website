
import { Gallery } from "@/components/Gallery";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WallpapersPage() {
  let images: string[] = [];
  try {
    const res = await fetch("https://nc.vrbl.win/public.php/webdav/", {
      method: "PROPFIND",
      headers: {
        Authorization: `Basic ${Buffer.from("q4tysLXz76Tw4YH:").toString("base64")}`,
        Depth: "1",
      },
      cache: "no-store",
    });
    
    if (res.ok) {
      const xmlText = await res.text();
      // Extract <d:href>...</d:href> contents
      const hrefMatches = xmlText.match(/<d:href>([^<]+)<\/d:href>/g);
      if (hrefMatches) {
        images = hrefMatches
          .map(match => match.replace(/<\/?d:href>/g, ""))
          .map(href => decodeURIComponent(href.split("/").pop() || ""))
          .filter(file => /\.(png|jpe?g|webp|gif)$/i.test(file));
      }
    } else {
      console.error("Failed to fetch WebDAV", res.status);
    }
  } catch (error) {
    console.error("Failed to fetch images from Nextcloud", error);
  }

  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/fun"
          className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Fun</span>
        </Link>

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
            Wallpapers
          </h1>
          <p className="text-foreground/50 text-base">
            A collection of high-quality wallpapers. Click any to edit and download.
          </p>
        </div>

        <Gallery images={images} />
      </div>
    </main>
  );
}
