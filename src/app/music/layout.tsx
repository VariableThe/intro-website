import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Music — Aditya Sharma",
  description:
    "A personal music dashboard. What I've been listening to, loving, and repeating — powered by Spotify and my Apple Music library.",
  openGraph: {
    title: "Music — Aditya Sharma",
    description: "Personal music taste and listening history.",
  },
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Back navigation */}
      <div className="fixed top-0 left-0 z-30 p-6 md:p-8">
        <Link
          href="/fun"
          className="inline-flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors text-sm group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="font-mono">fun</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
