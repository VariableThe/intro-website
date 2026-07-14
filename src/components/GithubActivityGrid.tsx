"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, Github } from "lucide-react";

interface ContributionDay {
    date: string;
    count: number;
    level: number;
}

interface ContributionResponse {
    total: {
        [year: string]: number;
    };
    contributions: ContributionDay[];
}

const LEVEL_CLASSES: Record<number, string> = {
    0: "bg-foreground/[0.04] border border-foreground/[0.07]",
    1: "bg-red-900/30 dark:bg-red-950/60 border border-red-500/30",
    2: "bg-red-700/60 dark:bg-red-800/70 border border-red-500/50",
    3: "bg-red-600/85 dark:bg-red-600/90 border border-red-500/70",
    4: "bg-red-500 dark:bg-[#ff1b51] border border-red-400 dark:shadow-[0_0_6px_rgba(255,27,81,0.5)]",
};

export function GithubActivityGrid({ username = "VariableThe" }: { username?: string }) {
    const [data, setData] = useState<ContributionDay[] | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);

    useEffect(() => {
        const fetchContributions = async () => {
            try {
                const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
                if (!res.ok) throw new Error("Could not load GitHub activity");
                const json: ContributionResponse = await res.json();
                
                setData(json.contributions || []);
                setTotal(json.total.lastYear || json.contributions?.reduce((acc, d) => acc + d.count, 0) || 0);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchContributions();
    }, [username]);

    // Group flat days into columns of 7 (Sunday=0 to Saturday=6)
    const { weeks, monthLabels } = useMemo(() => {
        if (!data || data.length === 0) return { weeks: [], monthLabels: [] };

        const resultWeeks: (ContributionDay | null)[][] = [];
        let currentWeek: (ContributionDay | null)[] = [];

        // Determine starting day of week (0 = Sunday, 1 = Monday, ...)
        const firstDayOfWeek = new Date(data[0].date).getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }

        for (const day of data) {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                resultWeeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Push partial last week if needed
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            resultWeeks.push(currentWeek);
        }

        // Calculate month labels and their week column indices
        const labels: { month: string; colIndex: number }[] = [];
        let lastMonth = -1;

        resultWeeks.forEach((week, colIndex) => {
            const firstValidDay = week.find((d): d is ContributionDay => d !== null);
            if (firstValidDay) {
                const dateObj = new Date(firstValidDay.date);
                const month = dateObj.getMonth();
                if (month !== lastMonth && colIndex < resultWeeks.length - 2) {
                    labels.push({
                        month: dateObj.toLocaleDateString("en-US", { month: "short" }),
                        colIndex,
                    });
                    lastMonth = month;
                }
            }
        });

        return { weeks: resultWeeks, monthLabels: labels };
    }, [data]);

    const formatDate = (dateStr: string) => {
        const dateObj = new Date(dateStr);
        return dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="border border-border p-6 mb-16 flex items-center justify-center gap-3 text-foreground/40 font-mono text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Loading contribution grid...</span>
            </div>
        );
    }

    if (error || !data || data.length === 0) {
        return null; // Silently hide if API fails so it doesn't break page aesthetic
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="border border-border p-5 sm:p-6 mb-16 bg-background/50 backdrop-blur-sm"
        >
            {/* Header / Title */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2.5">
                    <Github size={18} className="text-foreground/70" />
                    <h2 className="font-mono text-xs uppercase tracking-widest text-foreground/60">
                        GitHub Contributions
                    </h2>
                </div>
                {total !== null && (
                    <span className="font-mono text-xs text-foreground/45">
                        <strong className="text-foreground font-semibold">{total}</strong> in the last year
                    </span>
                )}
            </div>

            {/* Grid Container */}
            <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                <div className="min-w-[700px]">
                    {/* Month Labels Header */}
                    <div className="relative h-5 mb-1.5 ml-7 font-mono text-[10px] text-foreground/35 select-none">
                        {monthLabels.map(({ month, colIndex }) => (
                            <span
                                key={`${month}-${colIndex}`}
                                className="absolute top-0"
                                style={{ left: `${colIndex * 14}px` }}
                            >
                                {month}
                            </span>
                        ))}
                    </div>

                    {/* Day Rows + Cells */}
                    <div className="flex gap-2">
                        {/* Day of week labels (Mon, Wed, Fri) */}
                        <div className="flex flex-col justify-between py-0.5 pr-2 font-mono text-[10px] text-foreground/30 select-none h-[94px]">
                            <span></span>
                            <span>Mon</span>
                            <span></span>
                            <span>Wed</span>
                            <span></span>
                            <span>Fri</span>
                            <span></span>
                        </div>

                        {/* Weeks columns */}
                        <div className="flex gap-[3px] flex-1">
                            {weeks.map((week, weekIdx) => (
                                <div key={weekIdx} className="flex flex-col gap-[3px]">
                                    {week.map((day, dayIdx) => {
                                        if (!day) {
                                            return (
                                                <div
                                                    key={dayIdx}
                                                    className="w-3 h-3 rounded-[2px] bg-transparent"
                                                />
                                            );
                                        }

                                        return (
                                            <div
                                                key={day.date}
                                                onMouseEnter={() => setHoveredDay(day)}
                                                onMouseLeave={() => setHoveredDay(null)}
                                                title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}`}
                                                className={`w-3 h-3 rounded-[2px] transition-all duration-150 cursor-pointer hover:scale-125 hover:z-10 ${LEVEL_CLASSES[day.level] || LEVEL_CLASSES[0]}`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Reactive Hover Info + Legend */}
            <div className="mt-5 pt-3 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                <div className="text-foreground/60 min-h-[18px]">
                    {hoveredDay ? (
                        <span>
                            <strong className="text-foreground font-semibold">{hoveredDay.count}</strong> contribution{hoveredDay.count === 1 ? "" : "s"} on <span className="text-foreground/80">{formatDate(hoveredDay.date)}</span>
                        </span>
                    ) : (
                        <span className="text-foreground/40">Hover over any square for details</span>
                    )}
                </div>

                {/* Color Legend */}
                <div className="flex items-center gap-1.5 text-[11px] text-foreground/40 select-none ml-auto sm:ml-0">
                    <span>Less</span>
                    {[0, 1, 2, 3, 4].map((lvl) => (
                        <div
                            key={lvl}
                            className={`w-3 h-3 rounded-[2px] ${LEVEL_CLASSES[lvl]}`}
                        />
                    ))}
                    <span>More</span>
                </div>
            </div>
        </motion.section>
    );
}
