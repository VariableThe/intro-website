"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Github, Linkedin, Twitter, Instagram, Mail, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Projects", href: "/projects", external: false },
  { label: "About", href: "/about", external: false },
  { label: "Blog", href: "/blog", external: false },
  { label: "Fun", href: "/fun", external: false },
];

const EXTERNAL = [
  { label: "gallery.vrbl.win", href: "https://gallery.vrbl.win" },
  { label: "tools.vrbl.win", href: "https://tools.vrbl.win" },
];

const SOCIALS = [
  { href: "https://github.com/VariableThe", label: "GitHub", Icon: Github },
  { href: "https://www.linkedin.com/in/aditya-sharma-4aa716336/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://x.com/Variable_the_", label: "X / Twitter", Icon: Twitter },
  { href: "https://www.instagram.com/variable_the/", label: "Instagram", Icon: Instagram },
  { href: "mailto:adityasharma.variable@gmail.com", label: "Email", Icon: Mail },
];

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-8 bg-background">

      {/* Parallax circles */}
      <motion.div
        className="absolute w-[600px] h-[600px] border border-foreground/8 rounded-full pointer-events-none"
        animate={{ x: mousePosition.x * -30, y: mousePosition.y * -30 }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] border border-foreground/5 rounded-full pointer-events-none"
        animate={{ x: mousePosition.x * -15, y: mousePosition.y * -15 }}
        transition={{ type: "spring", stiffness: 50, damping: 25 }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-xl mx-auto text-center">

        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-7xl md:text-[9rem] font-black uppercase leading-none tracking-tighter p5-skew">
            <span className="bg-foreground text-background px-3 py-1 inline-block p5-shadow">Aditya</span>
          </h1>
          <div className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tighter mt-1 text-primary p5-skew">
            Sharma
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-lg md:text-xl text-foreground/55 leading-relaxed"
        >
          Building open-source tools, native apps, and whatever else feels interesting.
        </motion.p>

        {/* Internal nav */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="border border-foreground/20 text-foreground/70 hover:text-foreground hover:border-foreground/50 font-mono text-sm px-5 py-2 transition-colors duration-150 cursor-pointer">
                {item.label}
              </div>
            </Link>
          ))}
        </motion.div>

        {/* External links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {EXTERNAL.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-mono text-sm text-foreground/40 hover:text-primary transition-colors duration-150 group"
            >
              {link.label}
              <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="w-16 h-px bg-border"
        />

        {/* Social icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="flex items-center gap-6"
        >
          {SOCIALS.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noreferrer"
              className="text-foreground/40 hover:text-foreground transition-colors duration-150"
            >
              <Icon size={20} />
              <span className="sr-only">{label}</span>
            </a>
          ))}
        </motion.div>

      </div>
    </main>
  );
}
