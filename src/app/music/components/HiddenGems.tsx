"use client";

import { motion, type Variants } from "framer-motion";
import { CoverImage } from "./CoverImage";
import { Gem } from "lucide-react";
import type { NormalizedAlbum } from "@/lib/music/types";

interface HiddenGemsProps {
  albums: NormalizedAlbum[];
  onAlbumClick: (album: NormalizedAlbum) => void;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HiddenGems({ albums, onAlbumClick }: HiddenGemsProps) {
  if (!albums.length) return null;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-none bg-primary/10 border border-primary/30">
            <Gem className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="font-mono text-xl font-semibold tracking-tight text-foreground">
            Hidden Gems
          </h2>
        </div>
        <p className="font-mono text-xs text-muted-foreground pl-12">
          Albums I clearly love that might surprise you.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {albums.map((album) => (
          <GemCard key={album.id} album={album} onClick={onAlbumClick} />
        ))}
      </div>
    </section>
  );
}

// ── Individual gem card ──────────────────────────────────────────────────────

interface GemCardProps {
  album: NormalizedAlbum;
  onClick: (album: NormalizedAlbum) => void;
}

function GemCard({ album, onClick }: GemCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      onClick={() => onClick(album)}
      className="group relative flex flex-col gap-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Artwork */}
      <div className="relative w-full aspect-square overflow-hidden rounded bg-card border border-border">
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

        {/* Gem badge */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-primary font-mono text-[10px] font-semibold text-white tracking-wider uppercase">
            <Gem className="w-2.5 h-2.5" strokeWidth={2} />
            gem
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-1 px-0 space-y-0.5">
        <p className="font-mono text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {album.title}
        </p>
        <p className="font-mono text-xs text-muted-foreground truncate">
          {album.artist}
        </p>
        {album.year && (
          <p className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">
            {album.year}
          </p>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="h-px w-0 group-hover:w-full bg-primary transition-all duration-300 ease-out" />
    </motion.button>
  );
}
