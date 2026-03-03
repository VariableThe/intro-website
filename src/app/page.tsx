"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react";
import { useEffect, useState } from "react";

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
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4 bg-background">
      {/* Da Vinci sketch / grid background layout */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-5"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--color-foreground) 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      {/* Background Parallax Element (Vitruvian/Geometric hint) */}
      <motion.div
        className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border border-foreground/30 rounded-full flex items-center justify-center pointer-events-none"
        animate={{
          x: mousePosition.x * -60,
          y: mousePosition.y * -60,
          rotate: mousePosition.x * 15,
        }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
      >
        <div className="w-[70%] h-[70%] border border-foreground/20 rounded-sm rotate-45" />
        <div className="absolute w-full h-[1px] bg-foreground/20" />
        <div className="absolute h-full w-[1px] bg-foreground/20" />
      </motion.div>

      {/* Main Content (Persona 5 Bold Typography + Da Vinci sketch borders) */}
      <div className="relative z-10 flex flex-col items-center gap-6 md:gap-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "backOut" }}
          className="relative flex flex-col items-center"
        >
          <div className="relative">
            <h1 className="text-6xl md:text-[10rem] font-black uppercase leading-none tracking-tighter text-foreground p5-skew px-8 py-6 sketch-border bg-background/90 backdrop-blur-md p5-shadow">
              Aditya
            </h1>
            <motion.div
              className="absolute -bottom-6 -right-2 md:-bottom-8 md:-right-8 bg-primary text-primary-foreground text-2xl md:text-4xl font-black uppercase p-4 md:p-6 p5-cut-lg shadow-xl rotate-[4deg] hover:rotate-[2deg] hover:scale-105 transition-all cursor-crosshair whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
            >
              Sharma
            </motion.div>
          </div>
          <div className="mt-12 md:mt-16 relative bg-foreground text-background sketch-border p-4 p5-skew text-center p5-shadow max-w-2xl px-8">
            <p className="font-bold text-lg md:text-xl uppercase tracking-widest leading-relaxed">
              Web Developer <span className="text-primary mx-2">/</span> Cybersecurity Enthusiast <span className="text-primary mx-2">/</span> Game Developer
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-8"
        >
          <Link href="/projects" className="group">
            <div className="relative overflow-hidden bg-foreground text-background font-bold text-xl md:text-2xl uppercase px-10 py-4 sketch-border p5-skew transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:p5-shadow">
              Projects
            </div>
          </Link>
          <Link href="/about" className="group">
            <div className="relative overflow-hidden bg-background text-foreground font-bold text-xl md:text-2xl uppercase px-10 py-4 sketch-border p5-skew transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-secondary group-hover:p5-shadow border border-foreground">
              About Me
            </div>
          </Link>
        </motion.div>

        {/* Social Icons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center gap-6 mt-4"
        >
          <a href="https://github.com/VariableThe" target="_blank" rel="noreferrer" className="group p-3 sketch-border border-2 border-foreground bg-background hover:bg-foreground hover:text-background p5-skew transition-all duration-300 hover:-translate-y-1 hover:p5-shadow">
            <Github size={28} className="transition-transform group-hover:scale-110" />
            <span className="sr-only">GitHub</span>
          </a>
          <a href="https://www.linkedin.com/in/aditya-sharma-4aa716336/" target="_blank" rel="noreferrer" className="group p-3 sketch-border border-2 border-foreground bg-background hover:bg-blue-600 hover:text-white hover:border-blue-600 p5-skew transition-all duration-300 hover:-translate-y-1 hover:p5-shadow">
            <Linkedin size={28} className="transition-transform group-hover:scale-110" />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a href="https://x.com/Variable_the_" target="_blank" rel="noreferrer" className="group p-3 sketch-border border-2 border-foreground bg-background hover:bg-sky-500 hover:text-white hover:border-sky-500 p5-skew transition-all duration-300 hover:-translate-y-1 hover:p5-shadow">
            <Twitter size={28} className="transition-transform group-hover:scale-110" />
            <span className="sr-only">Twitter / X</span>
          </a>
          <a href="https://www.instagram.com/variable_the/" target="_blank" rel="noreferrer" className="group p-3 sketch-border border-2 border-foreground bg-background hover:bg-pink-500 hover:text-white hover:border-pink-500 p5-skew transition-all duration-300 hover:-translate-y-1 hover:p5-shadow">
            <Instagram size={28} className="transition-transform group-hover:scale-110" />
            <span className="sr-only">Instagram</span>
          </a>
          <a href="mailto:adityasharma.variable@gmail.com" className="group p-3 sketch-border border-2 border-foreground bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary p5-skew transition-all duration-300 hover:-translate-y-1 hover:p5-shadow">
            <Mail size={28} className="transition-transform group-hover:scale-110" />
            <span className="sr-only">Email</span>
          </a>
        </motion.div>
      </div>

      {/* Decorative Technical Text - Da Vinci notes vibe */}
      <motion.div
        className="absolute top-8 left-8 text-xs md:text-sm font-mono opacity-50 uppercase tracking-[0.2em] max-w-[250px] leading-relaxed hidden md:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        // FIG. 1 - PROPORTIONS OF CODE<br />
        ANNOTATIONS: The structural foundation of reactive interfaces.
      </motion.div>

      <motion.div
        className="absolute bottom-8 right-8 text-xs md:text-sm font-mono opacity-50 uppercase tracking-[0.2em] text-right hidden md:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ delay: 1 }}
      >
        [ SYSTEM METRICS ACTIVE ] <br />
        AESTHETIC: REACTIVE PARALLAX<br />
        STATUS: NOMINAL
      </motion.div>
    </main>
  );
}
