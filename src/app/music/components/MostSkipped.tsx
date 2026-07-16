"use client";

import { motion, type Variants } from "framer-motion";
import { CoverImage } from "./CoverImage";
import { SkipForward, Music2 } from "lucide-react";
import type { NormalizedTrack } from "@/lib/music/types";

interface MostSkippedProps {
  tracks: NormalizedTrack[];
}

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function MostSkipped({ tracks }: MostSkippedProps) {
  if (!tracks.length) return null;

  const maxSkip = Math.max(...tracks.map((t) => t.skipCount ?? 0), 1);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-none bg-primary/10 border border-primary/30">
            <SkipForward className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="font-mono text-xl font-semibold tracking-tight text-foreground">
            Most Skipped
          </h2>
        </div>
        <p className="font-mono text-xs text-muted-foreground pl-12">
          Songs that didn&apos;t make the cut. No shame in moving along.
        </p>
      </div>

      {/* List */}
      {/* List */}
      <div className="divide-y divide-border border border-border bg-card">
        {tracks.map((track, i) => (
          <SkipRow
            key={track.id}
            track={track}
            rank={i + 1}
            maxSkip={maxSkip}
          />
        ))}
      </div>
    </section>
  );
}

// ── Individual skipped row ───────────────────────────────────────────────────

interface SkipRowProps {
  track: NormalizedTrack;
  rank: number;
  maxSkip: number;
}

function SkipRow({ track, rank, maxSkip }: SkipRowProps) {
  const skipCount = track.skipCount ?? 0;
  const skipPercentage = Math.round((skipCount / maxSkip) * 100);

  return (
    <div className="group flex items-center gap-4 px-4 py-3 hover:bg-foreground/[0.02] transition-colors duration-150">
      {/* Rank */}
      <span className="font-mono text-xs text-muted-foreground/50 tabular-nums w-5 text-right shrink-0">
        {rank}
      </span>

      {/* Artwork */}
      <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded bg-muted border border-border">
        <CoverImage
          src={track.artwork}
          alt={`${track.album || track.title}`}
          sizes="40px"
          album={track.album}
          artist={track.artist}
          type="track"
        />
        {/* Subtle skip overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-150 pointer-events-none" />
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-medium text-foreground truncate">
          {track.title}
        </p>
        <p className="font-mono text-xs text-muted-foreground truncate">
          {track.artist}
          {track.album && track.album !== track.title && (
            <span className="text-muted-foreground/50"> · {track.album}</span>
          )}
        </p>
      </div>

      {/* Skip count */}
      <div className="flex items-center gap-1.5 shrink-0">
        <SkipForward
          className="w-3 h-3 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors"
          strokeWidth={1.5}
        />
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {skipCount.toLocaleString()}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/50 hidden sm:inline">
          {skipCount === 1 ? "skip" : "skips"}
        </span>
      </div>

      {/* Playful skip bar — proportional width relative to max */}
      <div className="hidden md:block w-20 h-1 bg-muted shrink-0 overflow-hidden">
        <SkipBar pct={skipPercentage} />
      </div>
    </div>
  );
}

// ── Skip bar fill ────────────────────────────────────────────────────────────

function SkipBar({ pct }: { pct: number }) {
  return (
    <div
      style={{ width: `${pct}%` }}
      className="h-full bg-muted-foreground/30 transition-all duration-300"
    />
  );
}
