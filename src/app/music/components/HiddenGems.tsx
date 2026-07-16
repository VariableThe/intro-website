"use client";

import { CoverImage } from "./CoverImage";
import { Gem } from "lucide-react";
import type { NormalizedAlbum } from "@/lib/music/types";

interface HiddenGemsProps {
  albums: NormalizedAlbum[];
  onAlbumClick: (album: NormalizedAlbum) => void;
}

export function HiddenGems({ albums, onAlbumClick }: HiddenGemsProps) {
  if (!albums.length) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary">
          <Gem size={20} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Hidden Gems
          </h2>
          <p className="text-foreground/40 text-sm font-mono">
            Albums I clearly love that might surprise you
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {albums.map((album) => (
          <GemCard key={album.id} album={album} onClick={onAlbumClick} />
        ))}
      </div>
    </section>
  );
}

interface GemCardProps {
  album: NormalizedAlbum;
  onClick: (album: NormalizedAlbum) => void;
}

function GemCard({ album, onClick }: GemCardProps) {
  return (
    <button
      onClick={() => onClick(album)}
      className="group relative flex flex-col gap-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Artwork */}
      <div className="relative w-full aspect-square overflow-hidden bg-card border border-border transition-all duration-200 group-hover:border-primary/50">
        <CoverImage
          src={album.artwork}
          alt={`${album.title} by ${album.artist}`}
          className="transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
          album={album.title}
          artist={album.artist}
          type="album"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>

      {/* Info */}
      <div className="pt-2.5 pb-1 space-y-0.5">
        <p className="font-mono text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {album.title}
        </p>
        <p className="font-mono text-xs text-muted-foreground truncate">
          {album.artist}
        </p>
        {album.year && (
          <p className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
            {album.year}
          </p>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="h-px w-0 group-hover:w-full bg-primary transition-all duration-300 ease-out" />
    </button>
  );
}
