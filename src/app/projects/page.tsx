"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PROJECTS = [
    {
        id: 1,
        title: "Enterprise FD Management Portal",
        description: "Built a full-fledged web app for Fixed Deposit management with a team of 24, featuring comprehensive Admin/User portals for high-volume transactions.",
        tags: ["React", "Spring Boot", "SQL"],
        color: "var(--primary)",
    },
    {
        id: 2,
        title: "AI-Powered Finance Manager",
        description: "Developed a personal finance portal with a team of 4, integrating AI image recognition to automatically categorize and log expenditures from uploaded bill photos.",
        tags: ["Python", "AI/ML", "Next.js"],
        color: "var(--emerald-500, #10b981)",
    },
    {
        id: 3,
        title: "Ethereum Information Sharing Network",
        description: "Enabled secure peer-to-peer data recording and sharing via an Ethereum blockchain implemented using Ganache.",
        tags: ["Solidity", "DApps", "Web3"],
        color: "var(--blue-500, #3b82f6)",
    },
    {
        id: 4,
        title: "Statistical Ad-Impact Analysis",
        description: "Conducted a data-driven study on the influence of multi-medium advertisement expenditure on physical store footfall using statistical modeling.",
        tags: ["Python", "Data Science", "Stats"],
        color: "var(--amber-500, #f59e0b)",
    },
];

export default function Projects() {
    return (
        <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-24 overflow-x-hidden pt-24">
            {/* Background sketch lines */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-10"
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, var(--color-foreground) 0px, transparent 1px, transparent 10px)`
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="flex items-center gap-6 mb-16">
                    <Link href="/">
                        <motion.div
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-4 border-2 border-foreground rounded-full bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={32} />
                        </motion.div>
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-6xl md:text-8xl font-black uppercase tracking-tighter p5-skew sketch-border px-8 py-2 bg-foreground text-background inline-block"
                    >
                        Projects
                    </motion.h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {PROJECTS.map((project, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            key={project.id}
                            className="group relative"
                        >
                            <div
                                className="absolute inset-0 bg-primary p5-skew translate-x-3 translate-y-3 transition-transform duration-300 group-hover:translate-x-6 group-hover:translate-y-6"
                                style={{ backgroundColor: project.color || 'var(--primary)' }}
                            />
                            <div className="relative bg-background border-4 border-foreground p-8 h-full flex flex-col justify-between sketch-border transition-transform duration-300 group-hover:-translate-y-2 group-hover:-translate-x-2">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black uppercase mb-4 p5-skew">{project.title}</h2>
                                    <div className="w-16 h-2 bg-primary mb-6 p5-skew" style={{ backgroundColor: project.color }} />
                                    <p className="text-lg font-mono opacity-80 mb-8 leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {project.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="text-xs md:text-sm font-bold uppercase tracking-wider px-3 py-1 border-2 border-foreground p5-skew"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
