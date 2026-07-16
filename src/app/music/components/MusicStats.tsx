"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { MusicStats as MusicStatsType } from "@/lib/music/types";

interface MusicStatsProps {
  stats: MusicStatsType;
  providers: string[];
}

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}

function useCountUp(target: number, inView: boolean, decimals = 0): string {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);
  const startTs = useRef<number | null>(null);
  const DURATION = 1400; // ms

  useEffect(() => {
    if (!inView) return;
    startTs.current = null;

    const animate = (ts: number) => {
      if (startTs.current === null) startTs.current = ts;
      const elapsed = ts - startTs.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * target);
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    };

    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [inView, target]);

  return count.toFixed(decimals);
}

function StatCard({
  item,
  index,
  inView,
}: {
  item: StatItem;
  index: number;
  inView: boolean;
}) {
  const displayValue = useCountUp(item.value, inView, item.decimals ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: 0.05 * index,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex flex-col items-start justify-between p-5"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        flex: "1 1 0",
        minWidth: "120px",
      }}
    >
      <span
        className="text-3xl sm:text-4xl font-bold font-mono tracking-tight tabular-nums"
        style={{ color: "var(--foreground)" }}
      >
        {Number(displayValue).toLocaleString(undefined, {
          minimumFractionDigits: item.decimals ?? 0,
          maximumFractionDigits: item.decimals ?? 0,
        })}
        {item.suffix && (
          <span
            className="text-xl ml-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            {item.suffix}
          </span>
        )}
      </span>
      <span
        className="text-xs font-mono uppercase tracking-widest mt-3"
        style={{ color: "var(--muted-foreground)" }}
      >
        {item.label}
      </span>
    </motion.div>
  );
}

function formatLastUpdated(dateString?: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function MusicStats({ stats, providers }: MusicStatsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const statItems: StatItem[] = [
    { label: "Tracks", value: stats.totalTracks },
    { label: "Artists", value: stats.totalArtists },
    { label: "Albums", value: stats.totalAlbums },
    { label: "Genres", value: stats.totalGenres },
    ...(stats.avgBpm !== undefined
      ? [{ label: "Avg BPM", value: stats.avgBpm, decimals: 0 }]
      : []),
    ...(stats.totalPlayCount !== undefined
      ? [{ label: "Total Plays", value: stats.totalPlayCount }]
      : []),
    ...(stats.totalTimeListenedMs !== undefined && stats.totalTimeListenedMs > 0
      ? [{ label: "Time Listened", value: stats.totalTimeListenedMs / 60000, suffix: " mins", decimals: 0 }]
      : []),
  ];

  return (
    <div ref={ref} className="w-full">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <h2
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            Library Stats
          </h2>
          {stats.lastUpdated && (
            <span className="text-[11px] font-mono text-muted-foreground/70 border-l border-border/80 pl-3">
              Updated: {formatLastUpdated(stats.lastUpdated)}
            </span>
          )}
        </div>
        {providers.length > 0 && (
          <div className="flex items-center gap-2">
            {providers.map((p) => (
              <span
                key={p}
                className="text-[10px] font-mono px-2 py-0.5"
                style={{
                  color: "var(--primary)",
                  border: "1px solid var(--primary)",
                  opacity: 0.7,
                }}
              >
                {p === "appleXml" ? "Apple Music" : p === "spotify" ? "Spotify" : p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stat cards row */}
      <div className="flex gap-px w-full overflow-x-auto" style={{ background: "var(--border)" }}>
        {statItems.map((item, i) => (
          <StatCard key={item.label} item={item} index={i} inView={inView} />
        ))}
      </div>
    </div>
  );
}
