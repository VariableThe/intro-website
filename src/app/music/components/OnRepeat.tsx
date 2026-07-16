"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Repeat, Headphones } from "lucide-react";
import { CoverImage } from "./CoverImage";
import type { NormalizedTrack } from "@/lib/music/types";

interface Props {
  tracks?: NormalizedTrack[];
  allTimeTracks?: NormalizedTrack[];
  recentTracks?: NormalizedTrack[];
}

export function OnRepeat({ tracks, allTimeTracks, recentTracks }: Props) {
  const [mode, setMode] = useState<"allTime" | "recent">("allTime");

  const activeTracks = mode === "recent"
    ? (recentTracks && recentTracks.length > 0 ? recentTracks : tracks || [])
    : (allTimeTracks && allTimeTracks.length > 0 ? allTimeTracks : tracks || []);

  if (!activeTracks || activeTracks.length === 0) return null;

  const maxPlays = Math.max(...activeTracks.map((t) => t.playCount ?? 0), 1);
  const maxRecentScore = Math.max(...activeTracks.map((t) => t.repeatScore ?? t.playCount ?? 0), 1);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "text-[#FFD700] font-black text-2xl md:text-3xl";
    if (rank === 2) return "text-[#C0C0C0] font-black text-2xl md:text-3xl";
    if (rank === 3) return "text-[#CD7F32] font-black text-2xl md:text-3xl";
    return "text-foreground/25 font-bold text-xl md:text-2xl";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
            <Repeat size={22} />
          </div>
          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-foreground/50">
              On Repeat
            </h2>
            <p className="text-foreground/40 text-xs md:text-sm font-mono">
              {mode === "allTime"
                ? "Most played tracks across my entire collection"
                : "Heavy rotation recently (plays weighted by last played date)"}
            </p>
          </div>
        </div>

        {/* ── Mode Toggle ── */}
        <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setMode("allTime")}
            className={`relative px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all rounded-md ${
              mode === "allTime"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setMode("recent")}
            className={`relative px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all rounded-md ${
              mode === "recent"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      <div className="divide-y divide-border/60 bg-card/40 border border-border">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-border/60"
          >
            {activeTracks.slice(0, 15).map((track, i) => {
              const rank = i + 1;
              const plays = track.playCount ?? 0;
              const percentage = mode === "allTime"
                ? Math.min(100, Math.max(2, (plays / maxPlays) * 100))
                : Math.min(100, Math.max(2, ((track.repeatScore ?? plays) / maxRecentScore) * 100));

              return (
                <div
                  key={track.id}
                  className="group relative flex items-center gap-4 p-4 md:p-5 hover:bg-foreground/[0.03] transition-colors overflow-hidden"
                >
                  {/* Background popularity bar */}
                  <div
                    className="absolute left-0 bottom-0 top-0 bg-primary/[0.04] group-hover:bg-primary/[0.07] transition-all pointer-events-none"
                    style={{ width: `${percentage}%` }}
                  />

                  {/* Rank */}
                  <div className="w-8 md:w-10 text-center flex-shrink-0 font-mono">
                    <span className={getRankStyle(rank)}>
                      {rank < 10 ? `0${rank}` : rank}
                    </span>
                  </div>

                  {/* Artwork */}
                  <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0 overflow-hidden rounded bg-foreground/5 border border-border/40">
                    <CoverImage
                      src={track.artwork}
                      alt={track.title}
                      className="group-hover:scale-105 transition-transform duration-300"
                      sizes="60px"
                      album={track.album}
                      artist={track.artist}
                      type="track"
                    />
                  </div>

                  {/* Title and Artist */}
                  <div className="min-w-0 flex-1 z-10">
                    <h3 className="font-bold text-base md:text-lg truncate group-hover:text-primary transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-foreground/50 text-sm truncate">
                      {track.artist}
                      {track.album ? ` — ${track.album}` : ""}
                    </p>
                  </div>

                  {/* Play count right badge */}
                  <div className="flex items-center gap-1.5 text-right flex-shrink-0 z-10 pl-2">
                    <Headphones size={14} className="text-foreground/30 group-hover:text-primary transition-colors" />
                    <span className="font-mono text-sm md:text-base font-semibold text-foreground/80 tabular-nums">
                      {plays.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
