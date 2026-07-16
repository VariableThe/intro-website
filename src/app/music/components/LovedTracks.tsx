"use client";

import { CoverImage } from "./CoverImage";
import { Heart } from "lucide-react";
import type { NormalizedTrack } from "@/lib/music/types";

interface LovedTracksProps {
  tracks: NormalizedTrack[];
}

export function LovedTracks({ tracks }: LovedTracksProps) {
  if (tracks.length === 0) return null;

  return (
    <section className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 text-primary">
          <Heart size={20} className="fill-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Loved Tracks
          </h2>
          <p className="text-foreground/40 text-sm font-mono">
            Songs I&apos;ve marked as loved in my library
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </section>
  );
}

function TrackCard({ track }: { track: NormalizedTrack }) {
  return (
    <div className="group flex flex-col gap-2">
      <div className="relative aspect-square w-full overflow-hidden bg-card border border-border/60">
        <CoverImage
          src={track.artwork}
          alt={track.title}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="transition-transform duration-300 group-hover:scale-105"
          album={track.album}
          artist={track.artist}
          type="track"
        />

        {/* Heart badge */}
        <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm">
          <Heart size={12} className="text-primary fill-primary" />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold font-mono text-foreground truncate leading-snug group-hover:text-primary transition-colors">
          {track.title}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
          {track.artist}
        </p>
      </div>
    </div>
  );
}
