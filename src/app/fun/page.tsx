"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Things to add here later ──────────────────────────────────────────────
// Ideas: 3D models, paper origami catalogue, prop photos, game jam entries,
//        Blender renders, CTF writeups, YouTube archive, woodworking stuff...
// ──────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "3d",
    label: "3D & Modelling",
    desc: "Blender renders, CAD models, and assorted geometry.",
    status: "soon" as const,
  },
  {
    id: "props",
    label: "Props & Making",
    desc: "Physical stuff — woodworking, origami, cardboard engineering.",
    status: "soon" as const,
  },
  {
    id: "ctf",
    label: "CTF Writeups",
    desc: "Notes from KernelCTF, AuroraCTF, IndomitusCTF and others.",
    status: "soon" as const,
  },
  {
    id: "games",
    label: "Game Dev",
    desc: "Unity experiments, game jam entries, prototypes.",
    status: "soon" as const,
  },
];

export default function Fun() {
  const [homeUrl, setHomeUrl] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hostname.toLowerCase();
      if (/^(blog|projects|about|fun)\./.test(h)) {
        if (h.includes("localhost")) {
          setHomeUrl(`http://localhost:${window.location.port || "3000"}`);
        } else {
          setHomeUrl("https://intro.vrbl.win");
        }
      }
    }
  }, []);

  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
      <div className="max-w-2xl mx-auto">

        <Link href={homeUrl} className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-14"
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">Fun</h1>
          <p className="text-foreground/50 text-base">
            Non-code stuff. Physical making, 3D, games, and other things that don't fit anywhere else.
          </p>
        </motion.div>

        <div className="divide-y divide-border">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className="py-6 flex items-start justify-between gap-6"
            >
              <div>
                <h2 className="font-semibold text-lg text-foreground mb-1">{section.label}</h2>
                <p className="text-foreground/50 text-base">{section.desc}</p>
              </div>
              <span className="font-mono text-xs text-foreground/25 bg-foreground/5 px-2.5 py-1 shrink-0 mt-1">
                coming soon
              </span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="mt-12 text-foreground/25 font-mono text-xs"
        >
          This section will grow over time.
        </motion.p>

      </div>
    </main>
  );
}
