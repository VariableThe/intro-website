"use client";

import { CoverImage } from "./CoverImage";
import { SkipForward } from "lucide-react";
import type { NormalizedTrack } from "@/lib/music/types";

interface MostSkippedProps {
  tracks: NormalizedTrack[];
}

export function MostSkipped({ tracks }: MostSkippedProps) {
  if (!tracks.length) return null;

  const maxSkip = Math.max(...tracks.map((t) => t.skipCount ?? 0), 1);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary">
          <SkipForward size={20} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Most Skipped
          </h2>
          <p className="text-foreground/40 text-sm font-mono">
            Songs that never quite got the full listen
          </p>
        </div>
      </div>

      <div className="divide-y divide-border border border-border bg-card/40">
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

interface SkipRowProps {
  track: NormalizedTrack;
  rank: number;
  maxSkip: number;
}

function SkipRow({ track, rank, maxSkip }: SkipRowProps) {
  const skipCount = track.skipCount ?? 0;
  const skipPercentage = Math.round((skipCount / maxSkip) * 100);

  return (
    <div className="group relative flex items-center gap-4 px-4 py-3 hover:bg-foreground/[0.03] transition-colors duration-150 overflow-hidden">
      {/* Background skip bar */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-primary/[0.03] pointer-events-none transition-all"
        style={{ width: `${skipPercentage}%` }}
      />

      {/* Rank */}
      <span className="font-mono text-xs text-muted-foreground/50 tabular-nums w-5 text-right shrink-0 z-10">
        {rank}
      </span>

      {/* Artwork */}
      <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded bg-muted border border-border z-10">
        <CoverImage
          src={track.artwork}
          alt={`${track.album || track.title}`}
          sizes="40px"
          album={track.album}
          artist={track.artist}
          type="track"
        />
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0 z-10">
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
      <div className="flex items-center gap-1.5 shrink-0 z-10">
        <SkipForward
          className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
          strokeWidth={1.5}
        />
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {skipCount.toLocaleString()}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/50 hidden sm:inline">
          {skipCount === 1 ? "skip" : "skips"}
        </span>
      </div>
    </div>
  );
}
