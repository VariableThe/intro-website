"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star, GitFork, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { GithubActivityGrid } from "@/components/GithubActivityGrid";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Repo {
    id: number | string;
    name: string;
    repoName: string;
    description: string;
    url: string;
    stars: number;
    forks: number;
    language: string;
}

// ─── Curated projects, grouped by category ──────────────────────────────────
// Edit this to control what appears in the main sections.
// Each project is matched to a live repo for star/fork counts.

const CURATED: {
    category: string;
    color: string;
    projects: {
        repoName: string;
        title: string;
        description: string;
    }[];
}[] = [
    {
        category: "Web & Apps",
        color: "#e11d48",
        projects: [
            {
                repoName: "PaperCache",
                title: "PaperCache",
                description: "Reactive markdown notebook with live formula calculations, inline AI, custom variables, and scratchpads. Local-first.",
            },
            {
                repoName: "newsfeed",
                title: "Newsfeed",
                description: "Personal RSS aggregator for quick scanning on mobile. Fast and distraction-free.",
            },
        ],
    },
    {
        category: "macOS & Swift",
        color: "#7c3aed",
        projects: [
            {
                repoName: "Vinyl",
                title: "Vinyl",
                description: "Native Swift app showing real-time lyrics for Apple Music and Spotify in the macOS menu bar.",
            },
        ],
    },
    {
        category: "AI & Tooling",
        color: "#2563eb",
        projects: [
            {
                repoName: "Omelette-The-Openrouter-Extention-for-Raycast",
                title: "Omelette for Raycast",
                description: "Raycast extension for OpenRouter — quick access to any AI model from the launcher, no subscription needed.",
            },
            {
                repoName: "Omelette-vicinae",
                title: "Omelette for Vicinae",
                description: "Port of Omelette to Vicinae for Linux and cross-platform OpenRouter access.",
            },
            {
                repoName: "Terminal_helper",
                title: "Terminal AI Helper",
                description: "Lightweight Python scripts that add AI assistance to your terminal via OpenRouter or Hugging Face.",
            },
        ],
    },
    {
        category: "Linux & Systems",
        color: "#059669",
        projects: [
            {
                repoName: "pipewire-audio-controller",
                title: "PipeWire Monitor Splitter",
                description: "Routes audio between monitors using PipeWire on Linux. Useful for multi-monitor setups with independent sound.",
            },
        ],
    },
    {
        category: "Security & Research",
        color: "#d97706",
        projects: [
            {
                repoName: "Peer-Network",
                title: "Blockchain P2P",
                description: "Peer-to-peer information network built on a custom blockchain with cryptographic verification.",
            },
        ],
    },
];

// ─── Component ───────────────────────────────────────────────────────────────

function ProjectCard({
    title,
    description,
    url,
    stars,
    forks,
    language,
    color,
    index,
}: {
    title: string;
    description: string;
    url: string;
    stars: number;
    forks: number;
    language: string;
    color: string;
    index: number;
}) {
    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="group flex flex-col border border-border hover:border-foreground/25 p-5 transition-colors card-lift"
        >
            {/* Accent line */}
            <div className="w-6 h-0.5 mb-4 shrink-0" style={{ backgroundColor: color }} />

            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-foreground text-base leading-snug">{title}</h3>
                <ExternalLink
                    size={14}
                    className="text-foreground/20 group-hover:text-foreground/55 transition-colors shrink-0 mt-0.5"
                />
            </div>

            <p className="text-sm text-foreground/50 leading-relaxed flex-1 mb-4 line-clamp-3">
                {description}
            </p>

            <div className="flex items-center justify-between mt-auto">
                {language && (
                    <span className="font-mono text-xs text-foreground/35">{language}</span>
                )}
                <div className="flex items-center gap-3 ml-auto text-xs font-mono text-foreground/35">
                    {stars > 0 && (
                        <span className="flex items-center gap-1">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            {stars}
                        </span>
                    )}
                    {forks > 0 && (
                        <span className="flex items-center gap-1">
                            <GitFork size={11} />
                            {forks}
                        </span>
                    )}
                </div>
            </div>
        </motion.a>
    );
}

function SmallRepoRow({ repo, index }: { repo: Repo; index: number }) {
    return (
        <motion.a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(index * 0.015, 0.3) }}
            className="group flex items-center justify-between gap-4 py-3 hover:bg-foreground/[0.02] -mx-2 px-2 transition-colors"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground/80 group-hover:text-foreground transition-colors truncate">
                        {repo.name}
                    </span>
                    {repo.stars > 0 && (
                        <span className="flex items-center gap-0.5 text-[11px] font-mono text-amber-500 shrink-0">
                            <Star size={10} className="fill-amber-400" />
                            {repo.stars}
                        </span>
                    )}
                </div>
                {repo.description && (
                    <p className="text-xs text-foreground/35 truncate mt-0.5">{repo.description}</p>
                )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
                {repo.language && (
                    <span className="font-mono text-[11px] text-foreground/30 hidden sm:block">
                        {repo.language}
                    </span>
                )}
                <ExternalLink size={12} className="text-foreground/15 group-hover:text-foreground/45 transition-colors" />
            </div>
        </motion.a>
    );
}

export default function Projects() {
    // Live data from GitHub
    const [liveRepos, setLiveRepos] = useState<Record<string, { stars: number; forks: number; language: string }>>({});
    const [otherRepos, setOtherRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // All curated repo names (for deduplication in "everything else")
    const curatedNames = new Set(
        CURATED.flatMap(g => g.projects.map(p => p.repoName.toLowerCase()))
    );

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const res = await fetch("https://api.github.com/users/VariableThe/repos?per_page=100&sort=updated");
                if (!res.ok) throw new Error("GitHub API error");
                const data: any[] = await res.json();

                // Build live lookup
                const lookup: Record<string, { stars: number; forks: number; language: string }> = {};
                data.forEach(r => {
                    lookup[r.name.toLowerCase()] = {
                        stars: r.stargazers_count || 0,
                        forks: r.forks_count || 0,
                        language: r.language || "",
                    };
                });
                setLiveRepos(lookup);

                // Everything not in curated sections
                const rest: Repo[] = data
                    .filter(r => !r.fork && !curatedNames.has(r.name.toLowerCase()))
                    .map(r => ({
                        id: r.id,
                        name: r.name.replace(/-/g, " ").replace(/_/g, " "),
                        repoName: r.name,
                        description: r.description || "",
                        url: r.html_url,
                        stars: r.stargazers_count || 0,
                        forks: r.forks_count || 0,
                        language: r.language || "",
                    }));
                setOtherRepos(rest);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRepos();
    }, []);

    // Merge live stats into a curated project card
    const getLive = (repoName: string) =>
        liveRepos[repoName.toLowerCase()] ?? { stars: 0, forks: 0, language: "" };

    return (
        <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
            <div className="max-w-5xl mx-auto">

                <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Home</span>
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">Projects</h1>
                    <p className="text-foreground/50 text-base">
                        Open source tools and experiments —{" "}
                        <a href="https://github.com/VariableThe" target="_blank" rel="noreferrer"
                            className="underline hover:text-foreground transition-colors">
                            github.com/VariableThe
                        </a>
                    </p>
                </motion.div>

                {/* GitHub Activity Grid */}
                <GithubActivityGrid username="VariableThe" />

                {/* ─── Curated categories ─── */}
                <div className="space-y-16">
                    {CURATED.map((group, gi) => {
                        const cards = group.projects.map((p, pi) => {
                            const live = getLive(p.repoName);
                            return { ...p, ...live, index: gi * 10 + pi };
                        });

                        return (
                            <motion.section
                                key={group.category}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: gi * 0.07, duration: 0.4 }}
                            >
                                {/* Category heading */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                                    <h2 className="font-mono text-xs uppercase tracking-widest text-foreground/50">
                                        {group.category}
                                    </h2>
                                </div>

                                <div className={`grid gap-4 ${cards.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                                    {cards.map(card => (
                                        <ProjectCard
                                            key={card.repoName}
                                            title={card.title}
                                            description={card.description}
                                            url={`https://github.com/VariableThe/${card.repoName}`}
                                            stars={card.stars}
                                            forks={card.forks}
                                            language={card.language}
                                            color={group.color}
                                            index={card.index}
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        );
                    })}
                </div>

                {/* ─── Everything else ─── */}
                <section className="mt-20 pt-10 border-t border-border">
                    <h2 className="font-mono text-xs uppercase tracking-widest text-foreground/35 mb-6">
                        Everything else{" "}
                        {otherRepos.length > 0 && (
                            <span className="text-foreground/20">({otherRepos.length})</span>
                        )}
                    </h2>

                    {loading ? (
                        <div className="flex items-center gap-3 py-10 text-foreground/35">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="font-mono text-sm">Fetching from GitHub...</span>
                        </div>
                    ) : error ? (
                        <p className="text-sm text-foreground/40 py-8">
                            Couldn&apos;t load from GitHub.{" "}
                            <a href="https://github.com/VariableThe" className="underline">View directly →</a>
                        </p>
                    ) : (
                        <div className="divide-y divide-border">
                            {otherRepos.map((repo, i) => (
                                <SmallRepoRow key={repo.id} repo={repo} index={i} />
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}
