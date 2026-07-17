"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { buildingPapercache } from "./posts/building-papercache";
import { recentProjects } from "./posts/recent-projects";

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
  recentProjects,
  buildingPapercache,
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
          queueMicrotask(() => setHomeUrl(`http://localhost:${window.location.port || "3000"}`));
        } else {
          queueMicrotask(() => setHomeUrl("https://intro.vrbl.win"));
        }
      }
    }
  }, []);

  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
      <div className="max-w-4xl mx-auto">

        <Link href={homeUrl} className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">Blog</h1>
          <p className="text-foreground/50 text-base">
            Writing about things I&apos;ve built, broken, or figured out.
          </p>
        </motion.div>

        {hasPosts ? (
          <div className="space-y-6">
            {POSTS.map((post, i) => {
              const accentColor = post.slug.includes("papercache") ? "#7c3aed" : "#e11d48";
              return (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col border border-border hover:border-foreground/25 p-6 sm:p-8 transition-colors card-lift"
                  >
                    {/* Accent line */}
                    <div className="w-8 h-0.5 mb-5 shrink-0" style={{ backgroundColor: accentColor }} />

                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="font-mono text-xs uppercase tracking-widest text-foreground/40 block mb-2">
                          {post.date}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="text-foreground/20 group-hover:text-foreground/60 shrink-0 mt-1 transition-colors"
                      />
                    </div>

                    <p className="text-sm sm:text-base text-foreground/55 leading-relaxed mb-6">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-4 border-t border-border/50">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                          <span key={tag} className="font-mono text-xs text-foreground/40 bg-foreground/5 px-2 py-0.5 border border-border/40">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="font-mono text-xs uppercase tracking-widest text-foreground/40 group-hover:text-foreground transition-colors flex items-center gap-1">
                        Read <span className="text-primary font-bold">→</span>
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="py-16 border border-border p-8"
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
