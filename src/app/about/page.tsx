"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function About() {
    const skills = [
        { name: "Python", level: "95%" },
        { name: "Java / C++", level: "90%" },
        { name: "React / JS", level: "85%" },
        { name: "Spring Boot", level: "80%" },
        { name: "Unity / 3D", level: "75%" },
    ];

    const timeline = [
        { year: "2025", role: "DRDO Intern", desc: "Developed a centralized requisition management platform for secure assets." },
        { year: "2024", role: "Design Head & Committee Member", desc: "Managed 100+ designers at Finova & MIST, spearheaded CTFs, and implemented cryptographic ciphers (Vigenère/Autokey)." },
        { year: "2023", role: "B.Tech @ MIT", desc: "Computer Science & FinTech. CGPA 7.2. SAT 1440. Physics 99.98th percentile." },
        { year: "2021", role: "3D Modeler & Prop Maker", desc: "Passionate about 3D modeling (Blender, CAD) and crafting physical props using woodworking & origami." },
        { year: "2015", role: "Tech & Gaming YouTube", desc: "Created and managed a channel uploading tech reviews and gaming insights." },
    ];

    return (
        <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-24 overflow-x-hidden pt-24">
            {/* Da Vinci sketch background overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.05] dark:opacity-10"
                style={{
                    backgroundImage: `linear-gradient(90deg, transparent 49px, var(--color-foreground) 50px, transparent 51px)`,
                    backgroundSize: '100px 100px'
                }}
            />
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.05] dark:opacity-10"
                style={{
                    backgroundImage: `linear-gradient(0deg, transparent 49px, var(--color-foreground) 50px, transparent 51px)`,
                    backgroundSize: '100px 100px'
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
                {/* Left Column - Graphic & Intro */}
                <div className="flex-1">
                    <div className="flex items-center gap-6 mb-12">
                        <Link href="/">
                            <motion.div
                                whileHover={{ scale: 1.1, x: -5 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-4 border-2 border-foreground rounded-full bg-background hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-colors cursor-pointer"
                            >
                                <ArrowLeft size={32} />
                            </motion.div>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative w-full aspect-square max-w-md mx-auto lg:mx-0 mb-12"
                    >
                        {/* Persona 5 Portrait framing */}
                        <div className="absolute inset-0 bg-primary p5-skew p5-shadow translate-x-4 translate-y-4" />
                        <div className="absolute inset-0 bg-foreground p5-skew p5-shadow translate-x-1 translate-y-1" />
                        <div className="absolute inset-0 bg-background border-4 border-foreground overflow-hidden sketch-border">
                            {/* Abstract Portrait Representation */}
                            <svg viewBox="0 0 100 100" className="w-full h-full text-foreground/80 stroke-current fill-none">
                                {/* Vitruvian geometric abstraction */}
                                <circle cx="50" cy="50" r="45" strokeWidth="0.5" />
                                <rect x="15" y="15" width="70" height="70" strokeWidth="0.5" />
                                <path d="M 50 5 L 95 95 L 5 95 Z" strokeWidth="0.5" />
                                <circle cx="50" cy="35" r="10" strokeWidth="2" />
                                <path d="M 40 55 C 40 55, 50 65, 60 55" strokeWidth="2" />
                                <path d="M 20 85 C 30 70, 70 70, 80 85" strokeWidth="2" />
                                {/* Scribble texture lines */}
                                {[...Array(30)].map((_, i) => (
                                    <line
                                        key={i}
                                        x1={0} y1={i * 3.5}
                                        x2={100} y2={i * 3.5 + 10}
                                        strokeWidth="0.2"
                                        className="opacity-20"
                                    />
                                ))}
                            </svg>
                        </div>
                        {/* Status tag */}
                        <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground font-black text-2xl px-6 py-2 uppercase p5-skew p5-shadow rotate-[-5deg]">
                            LVL 67
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black uppercase tracking-tighter p5-skew"
                    >
                        About <br /> <span className="bg-foreground text-background px-4 inline-block mt-2 sketch-border">Me</span>
                    </motion.h1>
                </div>

                {/* Right Column - Skills & Timeline */}
                <div className="flex-1 flex flex-col justify-center gap-16 mt-12 lg:mt-32">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-3xl font-black uppercase mb-8 border-b-4 border-foreground pb-2 inline-block">
                            Skill Matrix
                        </h2>
                        <div className="flex flex-col gap-6 font-mono">
                            {skills.map((skill, i) => (
                                <div key={skill.name} className="relative">
                                    <div className="flex justify-between mb-2 font-bold uppercase tracking-widest text-sm">
                                        <span>{skill.name}</span>
                                        <span>{skill.level}</span>
                                    </div>
                                    <div className="h-4 w-full bg-foreground/10 sketch-border overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: skill.level }}
                                            transition={{ delay: 0.5 + (i * 0.1), duration: 1, ease: "easeOut" }}
                                            className="h-full bg-primary p5-skew origin-left"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h2 className="text-3xl font-black uppercase mb-8 border-b-4 border-foreground pb-2 inline-block">
                            Chronicle
                        </h2>
                        <div className="flex flex-col gap-8 relative">
                            <div className="absolute left-4 top-2 bottom-0 w-1 bg-foreground/30" />
                            {timeline.map((item, i) => (
                                <div key={item.year} className="relative pl-12">
                                    <div className="absolute left-2.5 top-2 w-4 h-4 rounded-full bg-foreground border-2 border-background z-10" />
                                    <div className="absolute left-[-2px] xl:left-[-120px] top-1 text-primary font-black text-xl md:text-2xl p5-skew w-24 text-right hidden xl:block">
                                        {item.year}
                                    </div>
                                    <div className="bg-background border-2 border-foreground p-6 sketch-border relative group hover:-translate-y-1 transition-transform">
                                        <div className="text-primary font-black text-xl mb-1 xl:hidden">{item.year}</div>
                                        <h3 className="font-bold uppercase text-lg mb-2">{item.role}</h3>
                                        <p className="font-mono opacity-80 text-sm">
                                            {item.desc}
                                        </p>
                                        <div className="absolute -inset-2 border-2 border-primary opacity-0 group-hover:opacity-100 p5-skew pointer-events-none transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </main>
    );
}
