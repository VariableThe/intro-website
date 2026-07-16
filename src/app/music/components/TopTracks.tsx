"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CoverImage } from "./CoverImage";
import type { TopItems, NormalizedTrack, TimeRange } from "@/lib/music/types";

interface TopTracksProps {
  topTracks: TopItems<NormalizedTrack>;
}

const TABS: { label: string; key: TimeRange }[] = [
  { label: "4 Weeks", key: "short" },
  { label: "6 Months", key: "medium" },
  { label: "All Time", key: "long" },
];

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function TopTracks({ topTracks }: TopTracksProps) {
  const [activeTab, setActiveTab] = useState<TimeRange>("short");
  const [direction, setDirection] = useState(0);

  const tracks = topTracks[activeTab].slice(0, 20);

  const handleTabChange = (key: TimeRange) => {
    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    const nextIndex = TABS.findIndex((t) => t.key === key);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setActiveTab(key);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-foreground/50">
          Top Tracks
        </h2>

        {/* Tabs */}
        <div className="relative flex gap-0 border border-[var(--border)]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className="relative px-4 py-2 text-xs font-mono font-medium tracking-wider transition-colors duration-200 cursor-pointer"
              style={{
                color:
                  activeTab === tab.key
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
              }}
            >
              {activeTab === tab.key && (
                <motion.span
                  layoutId="top-tracks-tab-bg"
                  className="absolute inset-0 bg-[var(--primary)]"
                  style={{ zIndex: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Track list */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="flex flex-col"
        >
          {tracks.map((track, index) => (
            <TrackRow key={track.id} track={track} rank={index + 1} />
          ))}

          {tracks.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)] font-mono py-8 text-center">
              No tracks available for this period.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function TrackRow({
  track,
  rank,
}: {
  track: NormalizedTrack;
  rank: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.03, duration: 0.2 }}
      className="group flex items-center gap-4 px-2 py-3 border-b border-[var(--border)] hover:bg-[var(--card)] transition-colors duration-150"
    >
      {/* Rank */}
      <span
        className="font-mono text-sm w-6 text-right shrink-0 tabular-nums"
        style={{
          color: rank <= 3 ? "var(--primary)" : "var(--muted-foreground)",
          fontWeight: rank <= 3 ? 700 : 400,
        }}
      >
        {rank}
      </span>

      {/* Artwork */}
      <div className="relative w-[50px] h-[50px] shrink-0 overflow-hidden rounded bg-[var(--card)]">
        <CoverImage
          src={track.artwork}
          alt={track.title}
          sizes="50px"
          album={track.album}
          artist={track.artist}
          type="track"
        />
      </div>

      {/* Title + Artist */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium font-mono text-[var(--foreground)] truncate">
          {track.title}
        </p>
        <p className="text-xs font-mono text-[var(--muted-foreground)] truncate mt-0.5">
          {track.artist}
        </p>
      </div>

      {/* Popularity bar + duration */}
      <div className="flex flex-col items-end gap-1.5 shrink-0 w-28">
        {typeof track.popularity === "number" && (
          <div className="w-full h-[3px] bg-[var(--border)] overflow-hidden">
            <motion.div
              className="h-full bg-[var(--primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${track.popularity}%` }}
              transition={{ delay: rank * 0.03 + 0.1, duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}
        {typeof track.duration === "number" && (
          <span className="text-[10px] font-mono text-[var(--muted-foreground)] tabular-nums">
            {formatDuration(track.duration)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
