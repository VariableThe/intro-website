"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { NormalizedAlbum } from "@/lib/music/types";
import { CoverImage } from "./CoverImage";
import { X, Heart, Headphones, Calendar, Music2, Star } from "lucide-react";

interface AlbumModalProps {
  album: NormalizedAlbum | null;
  onClose: () => void;
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4"
          style={{
            fill: i < rating ? "oklch(0.536 0.207 25.437)" : "transparent",
            color: i < rating ? "oklch(0.536 0.207 25.437)" : "var(--muted-foreground)",
          }}
        />
      ))}
    </div>
  );
}

export function AlbumModal({ album, onClose }: AlbumModalProps) {
  const [errorAlbumId, setErrorAlbumId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgError = errorAlbumId === album?.id;

  useEffect(() => {
    if (!album) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [album, onClose]);

  // Lock scroll when open
  useEffect(() => {
    if (album) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [album]);

  return (
    <AnimatePresence>
      {album && (
        <motion.div
          ref={overlayRef}
          key="album-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{ backdropFilter: "blur(16px)", background: "rgba(0,0,0,0.75)" }}
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <motion.div
            key="album-modal-panel"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            style={{ background: "oklch(0.17 0 0)", border: "1px solid var(--border)" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.536_0.207_25.437)]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" style={{ color: "var(--foreground)" }} />
            </button>

            {/* ── Left: Artwork ── */}
            <div className="relative flex-shrink-0 w-full md:w-80 h-64 md:h-auto overflow-hidden">
              <CoverImage
                src={album.artwork}
                alt={album.title}
                sizes="(max-width: 768px) 100vw, 320px"
                priority
                album={album.title}
                artist={album.artist}
                type="album"
              />
              {/* Color bleed */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, transparent 70%, oklch(0.17 0 0) 100%)",
                }}
              />
            </div>

            {/* ── Right: Info + Tracks ── */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Info section */}
              <div className="p-6 md:p-8 pb-4 flex-shrink-0">
                {/* Genre pill */}
                {album.genre && (
                  <span
                    className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 mb-3 tracking-widest"
                    style={{
                      background: "oklch(0.536 0.207 25.437 / 0.15)",
                      color: "oklch(0.536 0.207 25.437)",
                      border: "1px solid oklch(0.536 0.207 25.437 / 0.3)",
                    }}
                  >
                    {album.genre}
                  </span>
                )}

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold font-mono leading-tight pr-10" style={{ color: "var(--foreground)" }}>
                  {album.title}
                </h2>

                {/* Artist */}
                <p className="text-base font-mono mt-1 mb-4" style={{ color: "var(--muted-foreground)" }}>
                  {album.artist}
                  {album.year && (
                    <span className="ml-3" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
                      {album.year}
                    </span>
                  )}
                </p>

                {/* Rating + Loved */}
                <div className="flex items-center gap-4 mb-5">
                  {typeof album.rating === "number" && album.rating > 0 && (
                    <RatingStars rating={album.rating} />
                  )}
                  {album.loved && (
                    <div className="flex items-center gap-1.5">
                      <Heart
                        className="w-4 h-4"
                        style={{ fill: "oklch(0.536 0.207 25.437)", color: "oklch(0.536 0.207 25.437)" }}
                      />
                      <span className="text-xs font-mono" style={{ color: "oklch(0.536 0.207 25.437)" }}>
                        Loved
                      </span>
                    </div>
                  )}
                </div>

                {/* Metadata pills row */}
                <div className="flex flex-wrap gap-4 text-sm font-mono" style={{ color: "var(--muted-foreground)" }}>
                  {album.dateAdded && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formatDate(album.dateAdded)}</span>
                    </div>
                  )}
                  {typeof album.totalPlayCount === "number" && (
                    <div className="flex items-center gap-2">
                      <Headphones className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{album.totalPlayCount.toLocaleString()} plays</span>
                    </div>
                  )}
                  {album.trackCount && (
                    <div className="flex items-center gap-2">
                      <Music2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{album.trackCount} tracks</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", background: "var(--border)", flexShrink: 0 }} />

              {/* Track list */}
              {album.tracks && album.tracks.length > 0 ? (
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 md:px-8 py-3">
                    <p
                      className="text-[10px] font-mono uppercase tracking-widest mb-3"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Tracklist
                    </p>
                    <ul className="space-y-0">
                      {album.tracks.map((track, idx) => (
                        <li
                          key={track.id}
                          className="flex items-center gap-3 py-2.5 group"
                          style={{ borderBottom: "1px solid var(--border)", opacity: 0.9 }}
                        >
                          {/* Track number */}
                          <span
                            className="w-6 text-right text-xs font-mono flex-shrink-0 tabular-nums"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {idx + 1}
                          </span>

                          {/* Title */}
                          <span
                            className="flex-1 text-sm font-mono truncate"
                            style={{ color: "var(--foreground)" }}
                          >
                            {track.title}
                          </span>

                          {/* Play count */}
                          {typeof track.playCount === "number" && (
                            <span
                              className="text-[11px] font-mono flex-shrink-0"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              {track.playCount.toLocaleString()}×
                            </span>
                          )}

                          {/* Duration */}
                          {track.duration && (
                            <span
                              className="text-xs font-mono flex-shrink-0 tabular-nums"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              {formatMs(track.duration)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div
                  className="flex-1 flex items-center justify-center text-sm font-mono"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  No track data available
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
