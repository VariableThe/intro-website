"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

interface Project {
    id: number;
    title: string;
    description: string;
    tags: string[];
    color: string;
    url: string;
}

const COLORS = [
    "var(--primary)",                   // Default / Reddish (usually)
    "var(--emerald-500, #10b981)",      // Green
    "var(--blue-500, #3b82f6)",         // Blue
    "var(--amber-500, #f59e0b)",         // Yellow/Orange
    "var(--rose-500, #f43f5e)",         // Pink/Rose
    "var(--purple-500, #a855f7)",       // Purple
    "var(--cyan-500, #06b6d4)"          // Cyan
];

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Fetch public repositories, sort by recently updated
                const response = await fetch("https://api.github.com/users/VariableThe/repos?sort=updated&per_page=100");

                if (!response.ok) {
                    throw new Error("Failed to fetch projects");
                }

                const data = await response.json();

                // Map the data
                const mappedProjects: Project[] = data
                    .filter((repo: any) => !repo.fork) // Exclude forks
                    .map((repo: any, index: number) => {
                        const tags: string[] = [];
                        if (repo.language) tags.push(repo.language);
                        if (repo.topics && Array.isArray(repo.topics)) {
                            // Adding up to 3 topics to keep UI clean
                            tags.push(...repo.topics.slice(0, 3));
                        }

                        return {
                            id: repo.id,
                            title: repo.name.replace(/-/g, ' '),
                            description: repo.description || "No description provided.",
                            tags: tags.length > 0 ? tags : ["Code"],
                            color: COLORS[index % COLORS.length],
                            url: repo.html_url,
                        };
                    });

                setProjects(mappedProjects);
            } catch (err: any) {
                console.error("Error fetching projects:", err);
                setError(err.message || "Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

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

                {loading ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center">
                        <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
                        <p className="text-xl md:text-2xl font-black uppercase p5-skew tracking-widest animate-pulse">Loading Repositories...</p>
                    </div>
                ) : error ? (
                    <div className="w-full max-w-2xl mx-auto border-4 border-destructive p-8 bg-destructive/10 sketch-border flex flex-col items-center justify-center">
                        <p className="text-2xl font-black text-destructive uppercase p5-skew mb-4">Error loading data</p>
                        <p className="font-mono text-center">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12">
                        {projects.map((project, index) => (
                            <motion.a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.1, 1), duration: 0.5 }}
                                key={project.id}
                                className="group relative block h-full focus:outline-none"
                            >
                                <div
                                    className="absolute inset-0 bg-primary p5-skew translate-x-3 translate-y-3 transition-transform duration-300 group-hover:translate-x-6 group-hover:translate-y-6 group-focus-visible:translate-x-6 group-focus-visible:translate-y-6"
                                    style={{ backgroundColor: project.color || 'var(--primary)' }}
                                />
                                <div className="relative bg-background border-4 border-foreground p-6 md:p-8 h-full flex flex-col justify-between sketch-border transition-transform duration-300 group-hover:-translate-y-2 group-hover:-translate-x-2 group-focus-visible:-translate-y-2 group-focus-visible:-translate-x-2">
                                    <div>
                                        <div className="flex justify-between items-start mb-4 gap-4">
                                            <h2 className="text-2xl md:text-3xl font-black uppercase pb-1 p5-skew break-words">
                                                {project.title}
                                            </h2>
                                            <ExternalLink className="w-6 h-6 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity mt-1" />
                                        </div>
                                        <div className="w-12 h-2 bg-primary mb-6 p5-skew" style={{ backgroundColor: project.color }} />
                                        <p className="text-sm md:text-base font-mono opacity-80 mb-8 leading-relaxed line-clamp-4">
                                            {project.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {project.tags.map((tag, idx) => (
                                            <span
                                                key={`${tag}-${idx}`}
                                                className="text-xs font-bold uppercase tracking-wider px-2 py-1 border-2 border-foreground p5-skew bg-foreground/5 shadow-sm whitespace-nowrap"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
