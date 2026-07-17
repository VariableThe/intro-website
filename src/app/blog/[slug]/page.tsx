"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState, use, useRef } from "react";
import { buildingPapercache } from "../posts/building-papercache";
import { recentProjects } from "../posts/recent-projects";

// ─── Import your post content here ────────────────────────────────────────
// When you add a new post, create a file in src/app/blog/posts/<slug>.ts
// and add it to this map. See the README for full instructions.
const POSTS: Record<string, {
  title: string;
  date: string;
  tags: string[];
  content: string; // raw HTML or plain text for now
}> = {
  "building-papercache": buildingPapercache,
  "recent-projects-roundup": recentProjects,
};
// ──────────────────────────────────────────────────────────────────────────

function BlogContentWithCopy({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const preElements = containerRef.current.querySelectorAll("pre");

    preElements.forEach((pre) => {
      // Check if already wrapped
      if (pre.parentElement?.classList.contains("github-code-block")) return;

      const codeEl = pre.querySelector("code");
      const codeText = codeEl ? codeEl.innerText : pre.innerText;

      // Determine language
      let lang = pre.getAttribute("data-lang") || codeEl?.getAttribute("data-lang");
      if (!lang) {
        const classStr = `${pre.className} ${codeEl?.className || ""}`;
        const match = classStr.match(/language-(\w+)/i);
        if (match) {
          lang = match[1];
        } else if (codeText.includes("brew ") || codeText.includes("npm ") || codeText.includes("git ")) {
          lang = "bash";
        } else if (codeText.includes("import ") || codeText.includes("export ")) {
          lang = "typescript";
        } else {
          lang = "text";
        }
      }

      // Create main wrapper matching GitHub / brutalist style
      const wrapper = document.createElement("div");
      wrapper.className = "github-code-block border border-border my-6 bg-foreground/[0.02]";

      // Create top header
      const header = document.createElement("div");
      header.className = "flex items-center justify-between px-4 py-2 border-b border-border bg-foreground/[0.04] text-foreground/60 font-mono text-xs select-none";

      const langSpan = document.createElement("span");
      langSpan.className = "font-bold tracking-widest uppercase text-[11px] text-foreground/70";
      langSpan.innerText = lang.toUpperCase();

      const copyBtn = document.createElement("button");
      copyBtn.className = "flex items-center gap-1.5 px-2.5 py-1 hover:text-foreground hover:bg-foreground/10 transition-all bg-foreground/5 border border-border/50 text-[11px] font-mono tracking-wider cursor-pointer";
      
      const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
      const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M20 6 9 17l-5-5"/></svg>`;

      copyBtn.innerHTML = `${copyIcon}<span>Copy</span>`;

      copyBtn.onclick = () => {
        navigator.clipboard.writeText(codeText.trim());
        copyBtn.innerHTML = `${checkIcon}<span class="text-primary font-bold">Copied!</span>`;
        copyBtn.classList.add("border-primary/50", "bg-primary/5");
        setTimeout(() => {
          copyBtn.innerHTML = `${copyIcon}<span>Copy</span>`;
          copyBtn.classList.remove("border-primary/50", "bg-primary/5");
        }, 2000);
      };

      header.appendChild(langSpan);
      header.appendChild(copyBtn);

      // Insert wrapper and move pre inside
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);

      // Clean up pre and code classes to avoid double borders/margins or inline highlight boxes
      pre.classList.remove("my-4", "my-6", "border", "border-border", "rounded", "bg-foreground/5");
      pre.classList.add("p-4", "m-0", "overflow-x-auto", "bg-transparent", "font-mono", "text-sm", "border-none");
      if (codeEl) {
        codeEl.classList.remove("bg-foreground/5", "border", "border-border", "px-1.5", "py-0.5", "rounded");
        codeEl.classList.add("bg-transparent", "border-none", "p-0", "m-0", "block", "shadow-none");
      }
      wrapper.appendChild(pre);
    });
  }, [content]);

  return <div ref={containerRef} className="blog-content" dangerouslySetInnerHTML={{ __html: content }} />;
}

export default function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const [blogUrl, setBlogUrl] = useState("/blog");
  const { slug } = use(params);
  const post = POSTS[slug];

  useEffect(() => {
    if (typeof window !== "undefined" && /^blog\./i.test(window.location.hostname)) {
      queueMicrotask(() => setBlogUrl("/"));
    }
  }, []);

  if (!post) notFound();

  const accentColor = slug.includes("papercache") ? "#7c3aed" : "#e11d48";

  return (
    <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
      <div className="max-w-4xl mx-auto">

        <Link href={blogUrl} className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group font-mono">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Blog</span>
        </Link>

        <article className="border border-border p-6 sm:p-10 md:p-14 bg-background">
          {/* Top accent bar */}
          <div className="w-10 h-1 mb-6 shrink-0" style={{ backgroundColor: accentColor }} />

          {/* Header metadata */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest text-foreground/40 mb-3">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.tags.length} Tags</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2 pb-8 mb-10 border-b border-border">
            {post.tags.map(tag => (
              <span key={tag} className="font-mono text-xs text-foreground/40 bg-foreground/5 px-2.5 py-1 border border-border/40">
                {tag}
              </span>
            ))}
          </div>

          <BlogContentWithCopy content={post.content} />

          <div className="border-t border-border mt-16 pt-8 flex items-center justify-between">
            <Link
              href={blogUrl}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>All Posts</span>
            </Link>
            <span className="font-mono text-xs text-foreground/25 uppercase tracking-widest">
              END OF ENTRY
            </span>
          </div>
        </article>

      </div>
    </main>
  );
}
