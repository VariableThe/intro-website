"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Import your post content here ────────────────────────────────────────
// When you add a new post, create a file in src/app/blog/posts/<slug>.ts
// and add it to this map. See the README for full instructions.
const POSTS: Record<string, {
  title: string;
  date: string;
  tags: string[];
  content: string; // raw HTML or plain text for now
}> = {
  // "building-papercache": {
  //   title: "Building PaperCache",
  //   date: "2026-07-01",
  //   tags: ["open-source", "react"],
  //   content: `<p>Post content goes here...</p>`,
  // },
};
// ──────────────────────────────────────────────────────────────────────────

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [blogUrl, setBlogUrl] = useState("/blog");
  const post = POSTS[params.slug];

  useEffect(() => {
    if (typeof window !== "undefined" && /^blog\./i.test(window.location.hostname)) {
      setBlogUrl("/");
    }
  }, []);

  if (!post) notFound();

  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
      <div className="max-w-2xl mx-auto">

        <Link href={blogUrl} className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Blog</span>
        </Link>

        <article>
          <span className="font-mono text-xs text-foreground/35 block mb-2">{post.date}</span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">{post.title}</h1>
          <div className="flex gap-2 mb-10">
            {post.tags.map(tag => (
              <span key={tag} className="font-mono text-xs text-foreground/35 bg-foreground/5 px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
          <div
            className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed text-foreground/80"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

      </div>
    </main>
  );
}
