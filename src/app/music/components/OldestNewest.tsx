"use client";

import { motion } from "framer-motion";
import { CoverImage } from "./CoverImage";
import { History, Sparkles, Music2 } from "lucide-react";
import type { NormalizedAlbum } from "@/lib/music/types";

interface OldestNewestProps {
  oldest: NormalizedAlbum | null;
  newest: NormalizedAlbum | null;
  onAlbumClick: (album: NormalizedAlbum) => void;
}

export function OldestNewest({ oldest, newest, onAlbumClick }: OldestNewestProps) {
  if (!oldest && !newest) return null;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-none bg-primary/10 border border-primary/30">
            <History className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="font-mono text-xl font-semibold tracking-tight text-foreground">
            Oldest vs. Newest
          </h2>
        </div>
        <p className="font-mono text-xs text-muted-foreground pl-12">
          The time span across my entire physical and digital collection
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {oldest && (
          <AlbumCard
            album={oldest}
            label="Oldest in Library"
            sublabel={oldest.year ? `Released in ${oldest.year}` : "Earliest release"}
            icon={<History className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            badgeColor="bg-amber-500/10 text-amber-500 border-amber-500/30"
            accentClass="group-hover:border-amber-500/50"
            delay={0}
            onClick={onAlbumClick}
          />
        )}
        {newest && (
          <AlbumCard
            album={newest}
            label="Newest in Library"
            sublabel={newest.year ? `Released in ${newest.year}` : "Latest release"}
            icon={<Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />}
            badgeColor="bg-primary/10 text-primary border-primary/30"
            accentClass="group-hover:border-primary/50"
            delay={0.1}
            onClick={onAlbumClick}
          />
        )}
      </div>
    </section>
  );
}

interface AlbumCardProps {
  album: NormalizedAlbum;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  badgeColor: string;
  accentClass: string;
  delay: number;
  onClick: (album: NormalizedAlbum) => void;
}

function AlbumCard({
  album,
  label,
  sublabel,
  icon,
  badgeColor,
  accentClass,
  delay,
  onClick,
}: AlbumCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(album)}
      className={`group relative flex flex-col text-left w-full overflow-hidden bg-card border ${accentClass} transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
    >
      {/* Large artwork */}
      <div className="relative w-full aspect-square overflow-hidden rounded bg-muted">
        <CoverImage
          src={album.artwork}
          alt={`${album.title} by ${album.artist}`}
          className="transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          album={album.title}
          artist={album.artist}
          type="album"
        />

        {/* Gradient overlay for bottom text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Label badge */}
        <div className="absolute top-3 left-3">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest uppercase border ${badgeColor}`}
          >
            {icon}
            {label}
          </div>
        </div>

        {/* Year — large, bold, bottom right */}
        {album.year && (
          <div className="absolute bottom-3 right-3">
            <span className="font-mono text-4xl font-black text-white/90 tabular-nums leading-none drop-shadow-lg">
              {album.year}
            </span>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="px-4 py-4 space-y-0.5 border-t border-border/50">
        <p className="font-mono text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
          {album.title}
        </p>
        <p className="font-mono text-sm text-muted-foreground truncate">
          {album.artist}
        </p>
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground/50 pt-0.5">
          <span className="truncate">{sublabel}</span>
          {album.genre && <span className="truncate pl-2">{album.genre}</span>}
        </div>
      </div>
    </motion.button>
  );
}
