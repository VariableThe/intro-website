"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Add your posts here ───────────────────────────────────────────────────
// Each post is a plain object. When you write a real post, add it to the top
// of this array. See the README section "How to add a blog post" for details.
const POSTS: {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
}[] = [
  // Example — delete this and add real ones:
  // {
  //   slug: "building-papercache",
  //   title: "Building PaperCache",
  //   date: "2026-07-01",
  //   tags: ["open-source", "react"],
  //   excerpt: "Why I built a reactive markdown notebook and what I learned.",
  // },
];
// ──────────────────────────────────────────────────────────────────────────

export default function Blog() {
  const [homeUrl, setHomeUrl] = useState("/");
  const hasPosts = POSTS.length > 0;

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
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">Blog</h1>
          <p className="text-foreground/50 text-base">
            Writing about things I've built, broken, or figured out.
          </p>
        </motion.div>

        {hasPosts ? (
          <div className="divide-y divide-border">
            {POSTS.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025, duration: 0.2 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span className="font-mono text-xs text-foreground/35 block mb-1">{post.date}</span>
                      <h2 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                        {post.title}
                      </h2>
                      <p className="text-foreground/55 text-base leading-relaxed line-clamp-2">{post.excerpt}</p>
                      <div className="flex gap-2 mt-3">
                        {post.tags.map(tag => (
                          <span key={tag} className="font-mono text-xs text-foreground/35 bg-foreground/5 px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-foreground/20 group-hover:text-foreground/60 mt-1 shrink-0 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="py-16 border-t border-border"
          >
            <p className="text-foreground/35 font-mono text-sm">Nothing here yet.</p>
            <p className="text-foreground/25 font-mono text-xs mt-1">
              Posts will appear here once added — see code comments for how.
            </p>
          </motion.div>
        )}

      </div>
    </main>
  );
}
