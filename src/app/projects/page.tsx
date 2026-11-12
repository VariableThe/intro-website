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

interface ProjectLink {
    label: string;
    url: string;
}

// A curated project. `repoName` drives live GitHub stats and the default
// source link; `links` overrides/adds explicit source and demo destinations.
interface CuratedProject {
    repoName: string;
    title: string;
    blurb: string;
    stack?: string[];
    links?: ProjectLink[];
}

// Flagship projects get a fuller treatment: prose, capabilities, and a
// status/role line where authorship or scope needs to be explicit.
interface FeaturedProject extends CuratedProject {
    color: string;
    description: string;
    capabilities: string[];
    role?: string;
    status?: string;
}

const githubUrl = (repo: string) => `https://github.com/VariableThe/${repo}`;

// ─── Flagship projects ───────────────────────────────────────────────────────
// Shown first. Each detail is drawn from the project's public README and source.

const FEATURED: FeaturedProject[] = [
    {
        repoName: "PaperCache",
        title: "PaperCache",
        color: "#e11d48",
        blurb: "A floating, local-first knowledge manager that computes as you type.",
        description:
            "A hotkey summons the notepad at your cursor, where it evaluates math, tracks tasks, and can answer with AI before vanishing again. Notes stay on your machine; the optional AI assistant runs against a local Ollama instance or a cloud model on OpenRouter.",
        capabilities: [
            "Reactive math and variables: `/var rate = 85`, then `rate * 40 =` resolves to 3400 and updates everywhere when the variable changes.",
            "Optional inline AI: `/ai` answers in place, using a local Ollama instance or OpenRouter, with keys kept in your keychain.",
            "Slash commands for checkboxes, due-date reminders, and timers, plus a searchable WebGL graph view.",
        ],
        stack: ["Tauri v2", "Rust", "React", "TypeScript"],
        links: [
            { label: "Source", url: githubUrl("PaperCache") },
            { label: "Live app", url: "https://papercache.vrbl.win" },
        ],
    },
    {
        repoName: "viewfindrr",
        title: "Viewfindrr",
        color: "#2563eb",
        blurb: "A local-first field monitor and Sony camera control surface.",
        description:
            "Turns a laptop into a larger production monitor for Sony cameras. Preview, exposure and focus assists, scopes, and camera control all run locally on your machine.",
        capabilities: [
            "Monitor assists: zebra, false color, focus peaking, waveform, vectorscope, and frame guides.",
            "Camera control for ISO, shutter, aperture, white balance, and focus over Sony transports.",
            "Local recording and PNG export, plus a virtual camera output for calls.",
        ],
        stack: ["Python", "Qt", "OpenCV", "gphoto2"],
        status: "MIT-licensed with CI. Linux and macOS first; Windows supports capture cards and network streams.",
        links: [{ label: "Source", url: githubUrl("viewfindrr") }],
    },
    {
        repoName: "agent-kit-public",
        title: "Agent Kit (public distribution)",
        color: "#7c3aed",
        blurb: "A portable agent workspace: rules, skills, and plugins, shipped as files.",
        description:
            "A portable agent setup you install into your own home directory: global rules, a skills library, and OpenCode plugins, all as plain files. An opt-in installer links them into place without touching your existing config.",
        capabilities: [
            "agent-kit-public: global rules plus two OpenCode plugins for model routing and loopback URL rewriting.",
            "agent-skills: eleven local-first skills for PDF, image, OCR, audio transcription, and more.",
            "dot-kit-public: T3 and Beeper workflow skills, with upstream connector source pinned as a submodule.",
        ],
        stack: ["Python", "Bash", "Node", "OpenCode plugins"],
        links: [
            { label: "agent-kit-public", url: githubUrl("agent-kit-public") },
            { label: "agent-skills", url: githubUrl("agent-skills") },
            { label: "dot-kit-public", url: githubUrl("dot-kit-public") },
        ],
    },
    {
        repoName: "gait-biometrics",
        title: "Gait-based Continuous Authentication",
        color: "#059669",
        blurb: "A research pipeline for gait-based user authentication on public datasets.",
        role: "Team project for a MAHE minor specialization; my role was the deep-learning model track (B1–B7).",
        description:
            "A team project split across three students for preprocessing, models, and evaluation. I built the deep-learning track: seven model and optimization approaches from papers B1 through B7, reproduced and validated as a research baseline.",
        capabilities: [
            "B1–B3: multi-sensor CNN fusion, a multi-task CNN+LSTM, and a DeepConvLSTM baseline.",
            "B4–B5: a Siamese autoencoder network and a squeeze-and-excitation ConvNet.",
            "B6–B7: pruning, quantization, and ONNX export, plus a SEGait-ConViT vision transformer.",
        ],
        stack: ["PyTorch", "Python", "CUDA/CPU"],
        status: "Research baseline, not a deployable authenticator; results are exploratory and published with their limits.",
        links: [
            { label: "Source", url: githubUrl("gait-biometrics") },
            { label: "Consolidated", url: githubUrl("gait-biometrics-final") },
        ],
    },
];

// ─── Curated projects, grouped by category ──────────────────────────────────
// The rest of the strongest work, each matched to a live repo for stats.

const CURATED: {
    category: string;
    color: string;
    projects: CuratedProject[];
}[] = [
    {
        category: "Web & Apps",
        color: "#e11d48",
        projects: [
            {
                repoName: "newsfeed",
                title: "Newsfeed",
                blurb: "A phone-first RSS reader with no backend. Nine publisher feeds in a swipe deck, a chronological feed, and a saved list. Installable as a PWA, with cross-source trending detection.",
                stack: ["TypeScript", "PWA"],
                links: [
                    { label: "Source", url: githubUrl("newsfeed") },
                    { label: "Live", url: "https://news.vrbl.win" },
                ],
            },
            {
                repoName: "meeting-transcriber",
                title: "Meeting Transcriber",
                blurb: "A minimal, fully local UI over faster-whisper that transcribes 2–3 minute meeting summaries offline, with no cloud round-trip.",
                stack: ["faster-whisper", "Whisper", "Python"],
                links: [{ label: "Source", url: githubUrl("meeting-transcriber") }],
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
                blurb: "A native menu bar app with synchronized, scrolling lyrics for Apple Music and Spotify. Dual-player detection, a popover with seek bar and playback controls, and a local JSON cache that skips API calls on repeat.",
                stack: ["Swift", "AppKit", "SwiftUI"],
                links: [{ label: "Source", url: githubUrl("Vinyl") }],
            },
            {
                repoName: "SwiftType",
                title: "SwiftType",
                blurb: "System-wide autocorrect for macOS, fully offline. A hybrid SymSpell + BK-Tree engine, technical vocabularies, adaptive learning, Cmd+Z undo, and automatic secure-field bypass.",
                stack: ["Swift 6", "SymSpell", "BK-Tree"],
                links: [{ label: "Source", url: githubUrl("SwiftType") }],
            },
            {
                repoName: "Dimmer",
                title: "Dimmer",
                blurb: "Content-aware adaptive brightness for the Mac menu bar. Analyzes a downsampled local capture and adjusts perceived brightness to the visible content.",
                stack: ["SwiftUI", "AppKit", "ScreenCaptureKit"],
                links: [{ label: "Source", url: githubUrl("Dimmer") }],
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
                blurb: "OpenRouter access straight from the Raycast launcher, with any model and no vendor lock-in. Instant model switching, quick actions, word-by-word streaming, and local conversation history.",
                stack: ["TypeScript", "Raycast API"],
                links: [{ label: "Source", url: githubUrl("Omelette-The-Openrouter-Extention-for-Raycast") }],
            },
            {
                repoName: "Omelette-vicinae",
                title: "Omelette for Vicinae",
                blurb: "The same OpenRouter extension, ported to the Vicinae launcher so Linux users get the same keyboard-first AI prompt flow.",
                stack: ["TypeScript", "Vicinae"],
                links: [{ label: "Source", url: githubUrl("Omelette-vicinae") }],
            },
            {
                repoName: "Terminal_helper",
                title: "Terminal AI Helper",
                blurb: "Two tiny CLI tools that bring LLMs into the shell. `ai` (Hugging Face) and `fa` (OpenRouter) answer natural-language prompts with rich markdown output, reading keys from the environment.",
                stack: ["Python", "OpenRouter", "Hugging Face"],
                links: [{ label: "Source", url: githubUrl("Terminal_helper") }],
            },
            {
                repoName: "opencode-phone",
                title: "opencode-phone",
                blurb: "Drive your opencode coding agent from an Android phone over Tailscale. An Expo app plus a workstation bridge, an ntfy notifier for approvals, and one-command QR onboarding. Traffic stays on your own tailnet.",
                stack: ["Expo", "React Native", "Tailscale"],
                links: [{ label: "Source", url: githubUrl("opencode-phone") }],
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
                blurb: "Split stereo audio across dual monitors with PipeWire and WirePlumber: a 4-channel panning layout, a GTK4/Libadwaita controller GUI, and a toggle script between your DAC and speakers.",
                stack: ["PipeWire", "WirePlumber", "GTK4", "Libadwaita"],
                links: [{ label: "Source", url: githubUrl("pipewire-audio-controller") }],
            },
        ],
    },
    {
        category: "Security & Research",
        color: "#d97706",
        projects: [
            {
                repoName: "Peer-Network",
                title: "Blockchain P2P Network",
                blurb: "A research project exploring a peer-to-peer information-sharing network built on a custom blockchain with cryptographic verification.",
                stack: ["Blockchain", "Python"],
                links: [{ label: "Source", url: githubUrl("Peer-Network") }],
            },
        ],
    },
];

// ─── Small presentational pieces ─────────────────────────────────────────────

function StackChips({ stack }: { stack?: string[] }) {
    if (!stack || stack.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-1.5">
            {stack.map(s => (
                <span
                    key={s}
                    className="font-mono text-[11px] text-foreground/55 border border-border px-2 py-0.5"
                >
                    {s}
                </span>
            ))}
        </div>
    );
}

function LinksRow({ links }: { links?: ProjectLink[] }) {
    if (!links || links.length === 0) return null;
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {links.map(l => (
                <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-foreground/60 hover:text-foreground transition-colors group/link"
                >
                    {l.label}
                    <ExternalLink size={11} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>
            ))}
        </div>
    );
}

function LiveStats({
    language,
    stars,
    forks,
}: {
    language: string;
    stars: number;
    forks: number;
}) {
    return (
        <div className="flex items-center gap-3 text-xs font-mono text-foreground/55">
            {language && <span>{language}</span>}
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
    );
}

// ─── Featured card ───────────────────────────────────────────────────────────

function FeaturedCard({
    project,
    live,
    index,
}: {
    project: FeaturedProject;
    live: { stars: number; forks: number; language: string };
    index: number;
}) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.2 }}
            className="border border-border hover:border-foreground/25 p-6 md:p-7 transition-colors flex flex-col gap-4"
        >
            {/* Accent line */}
            <div className="w-8 h-0.5 shrink-0" style={{ backgroundColor: project.color }} />

            <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-foreground text-lg leading-snug">{project.title}</h3>
                <a
                    href={githubUrl(project.repoName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} on GitHub`}
                    className="text-foreground/35 hover:text-foreground/65 transition-colors shrink-0 mt-0.5"
                >
                    <ExternalLink size={15} />
                </a>
            </div>

            {project.role && (
                <p className="font-mono text-xs text-primary/85 leading-relaxed border-l-2 border-primary pl-3">
                    {project.role}
                </p>
            )}

            <p className="text-sm text-foreground/70 leading-relaxed">{project.blurb}</p>
            <p className="text-sm text-foreground/70 leading-relaxed">{project.description}</p>

            <ul className="space-y-2">
                {project.capabilities.map(c => (
                    <li key={c} className="flex gap-2.5 text-sm text-foreground/70 leading-relaxed">
                        <span
                            className="mt-[0.6em] w-1.5 h-1.5 shrink-0"
                            style={{ backgroundColor: project.color }}
                        />
                        <span>{c}</span>
                    </li>
                ))}
            </ul>

            {project.status && (
                <p className="font-mono text-xs text-foreground/60 leading-relaxed">
                    {project.status}
                </p>
            )}

            <div className="mt-auto pt-1 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                <StackChips stack={project.stack} />
                <LiveStats language={live.language} stars={live.stars} forks={live.forks} />
            </div>

            <LinksRow links={project.links} />
        </motion.article>
    );
}

// ─── Standard curated card ───────────────────────────────────────────────────

function ProjectCard({
    project,
    live,
    color,
    index,
}: {
    project: CuratedProject;
    live: { stars: number; forks: number; language: string };
    color: string;
    index: number;
}) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02, duration: 0.2 }}
            className="group flex flex-col border border-border hover:border-foreground/25 p-5 transition-colors card-lift"
        >
            <div className="w-6 h-0.5 mb-4 shrink-0" style={{ backgroundColor: color }} />

            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-foreground text-base leading-snug">{project.title}</h3>
                <a
                    href={githubUrl(project.repoName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} on GitHub`}
                    className="text-foreground/25 group-hover:text-foreground/60 transition-colors shrink-0 mt-0.5"
                >
                    <ExternalLink size={14} />
                </a>
            </div>

            <p className="text-sm text-foreground/70 leading-relaxed flex-1 mb-4">
                {project.blurb}
            </p>

            <div className="flex flex-col gap-3">
                <StackChips stack={project.stack} />
                <div className="flex items-center justify-between gap-3">
                    <LiveStats language={live.language} stars={live.stars} forks={live.forks} />
                    <LinksRow links={project.links} />
                </div>
            </div>
        </motion.article>
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
            transition={{ delay: Math.min(index * 0.006, 0.12), duration: 0.15 }}
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

const CURATED_NAMES = new Set([
    ...FEATURED.map(p => p.repoName.toLowerCase()),
    ...CURATED.flatMap(g => g.projects.map(p => p.repoName.toLowerCase())),
]);

// Repos already surfaced via a featured card's links, kept out of the
// auto-generated "Everything else" list to avoid duplication.
const SUPPRESSED = new Set([
    "agent-skills",
    "dot-kit-public",
    "gait-biometrics-final",
    "gait-biometrics-student-b",
]);

interface GitHubRepoItem {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    stargazers_count?: number;
    forks_count?: number;
    language?: string | null;
    fork?: boolean;
}

export default function Projects() {
    // Live data from GitHub
    const [liveRepos, setLiveRepos] = useState<Record<string, { stars: number; forks: number; language: string }>>({});
    const [otherRepos, setOtherRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [homeUrl, setHomeUrl] = useState("/");

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
        const fetchRepos = async () => {
            try {
                const res = await fetch("https://api.github.com/users/VariableThe/repos?per_page=100&sort=updated");
                if (!res.ok) throw new Error("GitHub API error");
                const data = (await res.json()) as GitHubRepoItem[];

                const lookup: Record<string, { stars: number; forks: number; language: string }> = {};
                data.forEach(r => {
                    lookup[r.name.toLowerCase()] = {
                        stars: r.stargazers_count || 0,
                        forks: r.forks_count || 0,
                        language: r.language || "",
                    };
                });
                setLiveRepos(lookup);

                const rest: Repo[] = data
                    .filter(r => !r.fork && !CURATED_NAMES.has(r.name.toLowerCase()) && !SUPPRESSED.has(r.name.toLowerCase()))
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
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "GitHub API error";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchRepos();
    }, []);

    const getLive = (repoName: string) =>
        liveRepos[repoName.toLowerCase()] ?? { stars: 0, forks: 0, language: "" };

    return (
        <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">
            <div className="max-w-5xl mx-auto">

                <Link href={homeUrl} className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Home</span>
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">Projects</h1>
                    <p className="text-foreground/50 text-base max-w-2xl">
                        Open source tools and experiments from{" "}
                        <a href="https://github.com/VariableThe" target="_blank" rel="noreferrer"
                            className="underline hover:text-foreground transition-colors">
                            github.com/VariableThe
                        </a>
                    </p>
                </motion.div>

                {/* GitHub Activity Grid */}
                <GithubActivityGrid username="VariableThe" />

                {/* ─── Featured ─── */}
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <h2 className="font-mono text-xs uppercase tracking-widest text-foreground/50">
                            Featured
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {FEATURED.map((p, i) => (
                            <FeaturedCard key={p.repoName} project={p} live={getLive(p.repoName)} index={i} />
                        ))}
                    </div>
                </motion.section>

                {/* ─── Curated categories ─── */}
                <div className="space-y-16">
                    {CURATED.map((group, gi) => {
                        return (
                            <motion.section
                                key={group.category}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: gi * 0.03, duration: 0.2 }}
                            >
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                                    <h2 className="font-mono text-xs uppercase tracking-widest text-foreground/50">
                                        {group.category}
                                    </h2>
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {group.projects.map((p, pi) => (
                                        <ProjectCard
                                            key={p.repoName}
                                            project={p}
                                            live={getLive(p.repoName)}
                                            color={group.color}
                                            index={gi * 10 + pi}
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
