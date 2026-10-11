import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DotMatrixMirror } from "@/components/DotMatrixMirror";

export const metadata = {
  title: "DotMatrix Mirror — Fun",
  description: "Turn your webcam into a dot-matrix LED display, right in the browser.",
};

export default function DotMatrixPage() {
  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/fun"
          className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Fun</span>
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">DotMatrix Mirror</h1>
          <p className="text-foreground/50 text-base">
            Your webcam as an LED wall. Press start, allow the camera, tune the dots.
          </p>
        </div>

        <DotMatrixMirror mode="interactive" />

        <div className="mt-10 border-t border-border pt-6 font-mono text-xs leading-relaxed text-foreground/40">
          <p>
            Ported from a Python + OpenCV desktop toy. The web version samples video to a tiny grid on a hidden canvas
            and redraws it as dots — nothing is uploaded anywhere.
          </p>
        </div>
      </div>
    </main>
  );
}
