"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function About() {
    const [repoCount, setRepoCount] = useState<number | string>("52");
    const [starCount, setStarCount] = useState<number | string>("18");
    const [forkCount, setForkCount] = useState<number | string>("—");
    const [followers, setFollowers] = useState<number | string>("—");
    const [homeUrl, setHomeUrl] = useState("/");
    const yearsCoding = new Date().getFullYear() - 2015;

    useEffect(() => {
        if (typeof window !== "undefined") {
            const h = window.location.hostname.toLowerCase();
            if (/^(blog|projects|about|fun)\./.test(h)) {
                if (h.includes("localhost")) {
                    setHomeUrl(`http://localhost:${window.location.port || "3000"}`);
                } else {
                    setHomeUrl("https://intro.vrbl.win");
                }
            }
        }
        const fetchStats = async () => {
            try {
                const userRes = await fetch("https://api.github.com/users/VariableThe");
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.public_repos) setRepoCount(userData.public_repos);
                    if (userData.followers) setFollowers(userData.followers);
                }
                const reposRes = await fetch("https://api.github.com/users/VariableThe/repos?per_page=100");
                if (reposRes.ok) {
                    const reposData = await reposRes.json();
                    const totalStars = reposData.reduce((acc: number, r: any) => acc + (r.stargazers_count || 0), 0);
                    const totalForks = reposData.reduce((acc: number, r: any) => acc + (r.forks_count || 0), 0);
                    if (totalStars > 0) setStarCount(totalStars);
                    if (totalForks >= 0) setForkCount(totalForks);
                }
            } catch (err) {
                // silently fail — fallback values remain
            }
        };
        fetchStats();
    }, []);

    const skillGroups = [
        {
            label: "Languages",
            skills: ["Python", "TypeScript", "Swift", "Java", "C", "C++"],
        },
        {
            label: "Web & Frameworks",
            skills: ["Next.js", "React", "Spring Boot", "Tailwind"],
        },
        {
            label: "Native & Systems",
            skills: ["SwiftUI", "AppKit", "Linux", "PipeWire", "Docker"],
        },
        {
            label: "Other",
            skills: ["Blender", "Unity", "Blockchain", "CTF / Security"],
        },
    ];

    const timeline = [
        {
            year: "2026",
            role: "Open-source projects",
            desc: "Shipped PaperCache — a reactive markdown notebook with live calculations and inline AI (8 stars). Built Omelette, an OpenRouter extension for Raycast and Vicinae. Published Vinyl, a macOS menu bar lyrics app in Swift."
        },
        {
            year: "2025",
            role: "DRDO & IIT Indore internships",
            desc: "Built a requisition management platform at DRDO. Researched EVM and smart contracts at IIT Indore. Built a PipeWire audio splitter for multi-monitor routing on Linux. Served as General Secretary for PRISM."
        },
        {
            year: "2024",
            role: "Design Head & CTF organiser",
            desc: "Managed 100+ designers across Finova and MIST. Spearheaded KernelCTF, AuroraCTF, and IndomitusCTF. Built Python blockchain P2P networks and ML-based network intrusion detection."
        },
        {
            year: "2023",
            role: "Started B.Tech at MIT",
            desc: "Computer Science & FinTech. SAT 1440."
        },
        {
            year: "2021",
            role: "3D modelling & prop making",
            desc: "Blender, CAD, woodworking, origami. Mostly just making things."
        },
        {
            year: "2015",
            role: "YouTube — tech & gaming",
            desc: "Ran a channel doing tech reviews and gaming content."
        },
    ];

    return (
        <main className="min-h-screen w-full bg-background p-6 md:p-12 lg:p-20 pt-16 md:pt-20">

            <div className="max-w-5xl mx-auto">

                {/* Back */}
                <Link href={homeUrl} className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors text-sm mb-12 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Home</span>
                </Link>

                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Left column */}
                    <div className="lg:w-80 shrink-0">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">
                                Aditya<br />
                                <span className="text-primary">Sharma</span>
                            </h1>
                            <p className="text-foreground/60 text-base leading-relaxed mt-4 mb-8">
                                Nothing special — just building what I feel like. CS & FinTech student at MIT. Into open source, native apps, security, and making physical things.
                            </p>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-10">
                                <div>
                                    <div className="text-3xl font-black tabular-nums">{repoCount}</div>
                                    <div className="text-xs text-foreground/45 font-mono uppercase tracking-wider mt-1">public repos</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black flex items-center gap-1.5">
                                        {starCount}
                                        <Star size={20} className="text-amber-400 fill-amber-400" />
                                    </div>
                                    <div className="text-xs text-foreground/45 font-mono uppercase tracking-wider mt-1">GitHub stars</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black tabular-nums">{forkCount}</div>
                                    <div className="text-xs text-foreground/45 font-mono uppercase tracking-wider mt-1">forks</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black tabular-nums">{followers}</div>
                                    <div className="text-xs text-foreground/45 font-mono uppercase tracking-wider mt-1">followers</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black">{yearsCoding}+</div>
                                    <div className="text-xs text-foreground/45 font-mono uppercase tracking-wider mt-1">years coding</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black">3</div>
                                    <div className="text-xs text-foreground/45 font-mono uppercase tracking-wider mt-1">CTFs organised</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black">2</div>
                                    <div className="text-xs text-foreground/45 font-mono uppercase tracking-wider mt-1">internships</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black">7.16</div>
                                    <div className="text-xs text-foreground/45 font-mono uppercase tracking-wider mt-1">CGPA @ MIT</div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/40 mb-5">Skills</h2>
                                <div className="flex flex-col gap-4">
                                    {skillGroups.map(group => (
                                        <div key={group.label}>
                                            <span className="text-[11px] font-mono text-foreground/30 uppercase tracking-widest block mb-2">
                                                {group.label}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {group.skills.map(skill => (
                                                    <span
                                                        key={skill}
                                                        className="text-sm text-foreground/70 bg-foreground/[0.06] px-2.5 py-1 font-mono"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right column — Timeline */}
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.06, duration: 0.22 }}
                        >
                            <h2 className="text-xs font-mono uppercase tracking-widest text-foreground/40 mb-8">Timeline</h2>

                            <div className="flex flex-col gap-0">
                                {timeline.map((item, i) => (
                                    <motion.div
                                        key={item.year}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.08 + i * 0.03, duration: 0.2 }}
                                        className="flex gap-6 group"
                                    >
                                        {/* Year + line */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-px h-3 bg-border" />
                                            <div className="w-2 h-2 rounded-full bg-foreground/20 group-hover:bg-primary transition-colors shrink-0" />
                                            <div className="w-px flex-1 bg-border" />
                                        </div>

                                        {/* Content */}
                                        <div className="pb-8 flex-1">
                                            <span className="font-mono text-sm text-foreground/40">{item.year}</span>
                                            <h3 className="font-semibold text-foreground text-lg mt-0.5 mb-1.5">{item.role}</h3>
                                            <p className="text-base text-foreground/60 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </main>
    );
}
