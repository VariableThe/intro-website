"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Loader2, ExternalLink, Star, GitFork, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

interface Project {
    id: number | string;
    title: string;
    repoName: string;
    description: string;
    tags: string[];
    color: string;
    url: string;
    stars: number;
    forks: number;
    language?: string;
    highlights?: string[];
}

const COLORS = [
    "#e11d48",  // red
    "#2563eb",  // blue
    "#059669",  // green
    "#d97706",  // amber
    "#7c3aed",  // violet
    "#0891b2",  // cyan
    "#db2777",  // pink
];

const FEATURED: Project[] = [
    {
        id: "papercache",
        title: "PaperCache",
        repoName: "PaperCache",
        description: "A reactive markdown notebook with live formula calculations, inline AI, custom variables, and scratchpads. Local-first, no lock-in.",
        tags: ["TypeScript", "Next.js"],
        color: "#e11d48",
        url: "https://github.com/VariableThe/PaperCache",
        stars: 8,
        forks: 1,
        language: "TypeScript"
    },
    {
        id: "omelette-raycast",
        title: "Omelette",
        repoName: "Omelette-The-Openrouter-Extention-for-Raycast",
        description: "Raycast extension for OpenRouter — quick access to any AI model from the launcher. No subscription required.",
        tags: ["TypeScript", "Raycast"],
        color: "#2563eb",
        url: "https://github.com/VariableThe/Omelette-The-Openrouter-Extention-for-Raycast",
        stars: 3,
        forks: 0,
        language: "TypeScript"
    },
    {
        id: "vinyl",
        title: "Vinyl",
        repoName: "Vinyl",
        description: "Native Swift macOS app that shows real-time lyrics for Apple Music and Spotify in the menu bar.",
        tags: ["Swift", "macOS"],
        color: "#7c3aed",
        url: "https://github.com/VariableThe/Vinyl",
        stars: 2,
        forks: 0,
        language: "Swift"
    },
    {
        id: "omelette-vicinae",
        title: "Omelette for Vicinae",
        repoName: "Omelette-vicinae",
        description: "Port of Omelette to Vicinae — brings OpenRouter AI to Linux and cross-platform workflows.",
        tags: ["TypeScript", "Vicinae"],
        color: "#059669",
        url: "https://github.com/VariableThe/Omelette-vicinae",
        stars: 1,
        forks: 0,
        language: "TypeScript"
    },
    {
        id: "pipewire-audio-controller",
        title: "PipeWire Monitor Splitter",
        repoName: "pipewire-audio-controller",
        description: "Python utility for splitting and routing audio between monitors using PipeWire on Linux.",
        tags: ["Python", "Linux"],
        color: "#d97706",
        url: "https://github.com/VariableThe/pipewire-audio-controller",
        stars: 0,
        forks: 0,
        language: "Python"
    },
    {
        id: "terminal-helper",
        title: "Terminal AI Helper",
        repoName: "Terminal_helper",
        description: "Lightweight Python scripts that add AI assistance to your terminal via OpenRouter or Hugging Face.",
        tags: ["Python", "CLI"],
        color: "#0891b2",
        url: "https://github.com/VariableThe/Terminal_helper",
        stars: 1,
        forks: 0,
        language: "Python"
    },
    {
        id: "newsfeed",
        title: "Newsfeed",
        repoName: "newsfeed",
        description: "Personal RSS aggregator built for quick scanning on mobile. Fast, distraction-free.",
        tags: ["TypeScript", "Next.js"],
        color: "#db2777",
        url: "https://github.com/VariableThe/newsfeed",
        stars: 1,
        forks: 0,
        language: "TypeScript"
    },
    {
        id: "peer-network",
        title: "Blockchain P2P",
        repoName: "Peer-Network",
        description: "Peer-to-peer information sharing network built on a custom blockchain with cryptographic verification.",
        tags: ["Python", "Blockchain"],
        color: "#2563eb",
        url: "https://github.com/VariableThe/Peer-Network",
        stars: 1,
        forks: 0,
        language: "Python"
    }
];

const CATEGORIES = ["All", "TypeScript", "Swift", "Python", "Other"];

export default function Projects() {
    const [featured, setFeatured] = useState<Project[]>(FEATURED);
    const [allRepos, setAllRepos] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("https://api.github.com/users/VariableThe/repos?sort=updated&per_page=100");
                if (!response.ok) throw new Error("Failed to fetch repositories");
                const data = await response.json();

                // Sync live star counts to featured
                const updatedFeatured = FEATURED.map(f => {
                    const match = data.find((r: any) => r.name.toLowerCase() === f.repoName.toLowerCase());
                    if (match) {
                        return {
                            ...f,
                            stars: Math.max(f.stars, match.stargazers_count || 0),
                            forks: Math.max(f.forks, match.forks_count || 0)
                        };
                    }
                    return f;
                });
                setFeatured(updatedFeatured);

                const mapped: Project[] = data
                    .filter((repo: any) => !repo.fork)
                    .map((repo: any, index: number) => {
                        const tags: string[] = [];
                        if (repo.language) tags.push(repo.language);
                        if (repo.topics?.length) tags.push(...repo.topics.slice(0, 2));
                        return {
                            id: repo.id,
                            title: repo.name.replace(/-/g, " ").replace(/_/g, " "),
                            repoName: repo.name,
                            description: repo.description || "",
                            tags: tags.length > 0 ? tags : ["—"],
                            color: COLORS[index % COLORS.length],
                            url: repo.html_url,
                            stars: repo.stargazers_count || 0,
                            forks: repo.forks_count || 0,
                            language: repo.language || ""
                        };
                    });
                setAllRepos(mapped);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const filteredRepos = useMemo(() => {
        return allRepos.filter(repo => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                repo.title.toLowerCase().includes(q) ||
                repo.description.toLowerCase().includes(q) ||
                repo.tags.some(t => t.toLowerCase().includes(q));
            if (!matchesSearch) return false;
            if (selectedCategory === "All") return true;
            if (selectedCategory === "TypeScript") return repo.language === "TypeScript" || repo.language === "JavaScript";
            if (selectedCategory === "Swift") return repo.language === "Swift";
            if (selectedCategory === "Python") return repo.language === "Python";
            if (selectedCategory === "Other") return !["TypeScript", "JavaScript", "Swift", "Python"].includes(repo.language || "");
            return true;
        });
    }, [allRepos, searchQuery, selectedCategory]);

    return (
        <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
            <div className="max-w-5xl mx-auto">

                {/* Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Home</span>
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-14"
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">Projects</h1>
                    <p className="text-foreground/50 text-base">
                        Open source tools and experiments — <a href="https://github.com/VariableThe" target="_blank" rel="noreferrer" className="underline hover:text-foreground transition-colors">github.com/VariableThe</a>
                    </p>
                </motion.div>

                {/* ─── Featured ─── */}
                <section className="mb-20">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/40 mb-6">Featured</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {featured.map((project, index) => (
                            <motion.a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={`feat-${project.id}`}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                                className="group block border border-border hover:border-foreground/30 p-5 card-lift transition-colors"
                            >
                                {/* Color accent line */}
                                <div className="w-8 h-0.5 mb-4" style={{ backgroundColor: project.color }} />

                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className="font-semibold text-foreground text-lg">{project.title}</h3>
                                    <ExternalLink size={15} className="text-foreground/25 group-hover:text-foreground/60 transition-colors shrink-0 mt-0.5" />
                                </div>

                                <p className="text-base text-foreground/55 leading-relaxed mb-4 line-clamp-2">
                                    {project.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {project.tags.slice(0, 2).map((tag) => (
                                            <span key={tag} className="text-xs font-mono text-foreground/40 bg-foreground/5 px-2 py-0.5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-mono text-foreground/40">
                                        {project.stars > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                                {project.stars}
                                            </span>
                                        )}
                                        {project.forks > 0 && (
                                            <span className="flex items-center gap-1">
                                                <GitFork size={11} />
                                                {project.forks}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </section>

                {/* ─── All repos ─── */}
                <section>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                        <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/40">
                            All repos {allRepos.length > 0 && <span className="text-foreground/25">({allRepos.length})</span>}
                        </h2>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`text-[11px] font-mono px-2.5 py-1 transition-colors ${
                                        selectedCategory === cat
                                            ? "bg-foreground text-background"
                                            : "text-foreground/50 hover:text-foreground border border-border hover:border-foreground/30"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border border-border pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-foreground/25 font-mono"
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-3 text-foreground/40">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm font-mono">Loading...</span>
                        </div>
                    ) : error ? (
                        <p className="text-sm text-foreground/50 py-10">
                            Couldn't load repos from GitHub. <a href="https://github.com/VariableThe" className="underline">View directly →</a>
                        </p>
                    ) : filteredRepos.length === 0 ? (
                        <p className="text-sm text-foreground/40 py-10 font-mono">No results for "{searchQuery}".</p>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredRepos.map((repo, index) => (
                                <motion.a
                                    key={repo.id}
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: Math.min(index * 0.02, 0.4) }}
                                    className="group flex items-start justify-between gap-4 py-4 hover:bg-foreground/2 -mx-2 px-2 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-medium text-base text-foreground group-hover:text-primary transition-colors truncate">
                                                {repo.title}
                                            </span>
                                            {repo.stars > 0 && (
                                                <span className="flex items-center gap-0.5 text-[11px] font-mono text-amber-500 shrink-0">
                                                    <Star size={10} className="fill-amber-400" />
                                                    {repo.stars}
                                                </span>
                                            )}
                                        </div>
                                        {repo.description && (
                                            <p className="text-sm text-foreground/45 leading-relaxed line-clamp-1">
                                                {repo.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {repo.language && (
                                            <span className="text-xs font-mono text-foreground/35 hidden sm:block">
                                                {repo.language}
                                            </span>
                                        )}
                                        <ExternalLink size={12} className="text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
