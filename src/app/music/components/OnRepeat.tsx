"use client";

import { motion } from "framer-motion";
import { Repeat, Headphones } from "lucide-react";
import { CoverImage } from "./CoverImage";
import type { NormalizedTrack } from "@/lib/music/types";

interface Props {
  tracks: NormalizedTrack[];
}

export function OnRepeat({ tracks }: Props) {
  if (!tracks || tracks.length === 0) return null;

  const maxPlays = Math.max(...tracks.map((t) => t.playCount ?? 0), 1);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "text-[#FFD700] font-black text-2xl md:text-3xl";
    if (rank === 2) return "text-[#C0C0C0] font-black text-2xl md:text-3xl";
    if (rank === 3) return "text-[#CD7F32] font-black text-2xl md:text-3xl";
    return "text-foreground/25 font-bold text-xl md:text-2xl";
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 text-primary">
          <Repeat size={20} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            On Repeat
          </h2>
          <p className="text-foreground/40 text-sm font-mono">
            Most played tracks across my library collection
          </p>
        </div>
      </div>

      <div className="mt-8 divide-y divide-border/60 bg-card/40 border border-border">
        {tracks.slice(0, 15).map((track, i) => {
          const rank = i + 1;
          const plays = track.playCount ?? 0;
          const percentage = Math.min(100, Math.max(2, (plays / maxPlays) * 100));

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
                <span className="font-mono text-sm md:text-base font-semibold text-foreground/80">
                  {plays.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
