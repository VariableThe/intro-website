"use client";

import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { CoverImage } from "./CoverImage";
import type { NormalizedAlbum } from "@/lib/music/types";

interface TodaysPickProps {
  album: NormalizedAlbum | null;
  onAlbumClick?: (album: NormalizedAlbum) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4"
          style={{
            color: i < rating ? "var(--primary)" : "var(--muted-foreground)",
            fill: i < rating ? "var(--primary)" : "transparent",
            opacity: i < rating ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

export function TodaysPick({ album, onAlbumClick }: TodaysPickProps) {
  if (!album) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onAlbumClick && onAlbumClick(album)}
      className="relative w-full overflow-hidden cursor-pointer group"
      style={{ minHeight: "380px", border: "1px solid var(--border)" }}
    >
      {/* Full-bleed blurred background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            filter: "blur(48px) saturate(1.3)",
            transform: "scale(1.15)",
            opacity: 0.45,
          }}
        >
          <CoverImage
            src={album.artwork}
            alt=""
            sizes="100vw"
            album={album.title}
            artist={album.artist}
            type="album"
          />
        </div>
        {/* Dark gradient over the blur */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.65) 100%)",
          }}
        />
      </div>

      {/* Content layout */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8 p-8 sm:p-12 h-full">
        {/* Album cover */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex-shrink-0 w-44 h-44 sm:w-56 sm:h-56 shadow-2xl rounded overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        >
          <CoverImage
            src={album.artwork}
            alt={album.title}
            sizes="224px"
            album={album.title}
            artist={album.artist}
            type="album"
          />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-3 min-w-0"
        >
          {/* Label */}
          <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">
            Today&apos;s Pick
          </span>

          {/* Album title */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            {album.title}
          </h1>

          {/* Artist */}
          <p
            className="text-xl sm:text-2xl"
            style={{ color: "var(--muted-foreground)" }}
          >
            {album.artist}
          </p>

          {/* Pills row */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {album.year && (
              <span
                className="text-xs font-mono px-2.5 py-1"
                style={{
                  color: "var(--foreground)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {album.year}
              </span>
            )}
            {album.genre && (
              <span
                className="text-xs font-mono px-2.5 py-1"
                style={{
                  color: "var(--foreground)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {album.genre}
              </span>
            )}
            {album.trackCount && (
              <span
                className="text-xs font-mono px-2.5 py-1"
                style={{
                  color: "var(--muted-foreground)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {album.trackCount} tracks
              </span>
            )}
          </div>

          {/* Rating + love row */}
          <div className="flex items-center gap-4 mt-1">
            {album.rating !== undefined && album.rating > 0 && (
              <StarRating rating={album.rating} />
            )}
            {album.loved && (
              <div className="flex items-center gap-1.5">
                <Heart
                  className="w-4 h-4"
                  style={{ color: "var(--primary)", fill: "var(--primary)" }}
                />
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--primary)" }}
                >
                  Loved
                </span>
              </div>
            )}
          </div>

          {/* Total play count */}
          {album.totalPlayCount !== undefined && album.totalPlayCount > 0 && (
            <p
              className="text-xs font-mono mt-1"
              style={{ color: "var(--muted-foreground)", opacity: 0.6 }}
            >
              {album.totalPlayCount.toLocaleString()} plays
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
