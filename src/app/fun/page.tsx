"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Music2, ArrowRight, Flag, Image } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Things to add here later ──────────────────────────────────────────────
// Ideas: 3D models, paper origami catalogue, prop photos, game jam entries,
//        Blender renders, CTF writeups, YouTube archive, woodworking stuff...
// ──────────────────────────────────────────────────────────────────────────

type SectionStatus = "live" | "soon";

interface Section {
  id: string;
  label: string;
  desc: string;
  status: SectionStatus;
  href?: string;
  icon?: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "wallpapers",
    label: "Wallpapers",
    desc: "A collection of high-quality wallpapers. Click any to edit and download.",
    status: "live",
    href: "/fun/wallpapers",
    icon: <Image size={18} className="text-primary" />,
  },
  {
    id: "music",
    label: "Music",
    desc: "A personal music dashboard — what I've been listening to, loving, and repeating.",
    status: "live",
    href: "/music",
    icon: <Music2 size={18} className="text-primary" />,
  },
  {
    id: "3d",
    label: "3D & Modelling",
    desc: "Blender renders, CAD models, and assorted geometry.",
    status: "soon",
  },
  {
    id: "props",
    label: "Props & Making",
    desc: "Physical stuff — woodworking, origami, cardboard engineering.",
    status: "soon",
  },
  {
    id: "ctf",
    label: "CTF Writeups",
    desc: "Notes from KernelCTF, picoCTF, and other offensive security challenges.",
    status: "live",
    href: "/ctf",
    icon: <Flag size={18} className="text-primary" />,
  },
  {
    id: "games",
    label: "Game Dev",
    desc: "Unity experiments, game jam entries, prototypes.",
    status: "soon",
  },
];

export default function Fun() {
  const [homeUrl, setHomeUrl] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const h = window.location.hostname.toLowerCase();
      if (/^(blog|projects|about|fun)\./.test(h)) {
        if (h.includes("localhost")) {
          queueMicrotask(() => setHomeUrl(`http://localhost:${window.location.port || "3000"}`));
        } else {
          queueMicrotask(() => setHomeUrl("https://intro.vrbl.win"));
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
            Non-code stuff. Physical making, 3D, games, and other things that don&apos;t fit anywhere else.
          </p>
        </motion.div>

        <div className="divide-y divide-border">
          {SECTIONS.map((section, i) => {
            const isLive = section.status === "live";
            const inner = (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className={`py-6 flex items-start justify-between gap-6 group ${isLive ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {section.icon && (
                    <span className="mt-1 shrink-0">{section.icon}</span>
                  )}
                  <div>
                    <h2 className={`font-semibold text-lg mb-1 transition-colors ${isLive ? "text-foreground group-hover:text-primary" : "text-foreground"}`}>
                      {section.label}
                    </h2>
                    <p className="text-foreground/50 text-base">{section.desc}</p>
                  </div>
                </div>
                {isLive ? (
                  <ArrowRight
                    size={16}
                    className="text-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1.5"
                  />
                ) : (
                  <span className="font-mono text-xs text-foreground/25 bg-foreground/5 px-2.5 py-1 shrink-0 mt-1">
                    coming soon
                  </span>
                )}
              </motion.div>
            );

            return isLive && section.href ? (
              <Link key={section.id} href={section.href} className="block">
                {inner}
              </Link>
            ) : (
              <div key={section.id}>{inner}</div>
            );
          })}
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
