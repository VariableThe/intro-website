"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import type { NormalizedArtist, NormalizedTrack } from "@/lib/music/types";
import { CoverImage } from "./CoverImage";
import { X, Headphones, Music2, Disc3 } from "lucide-react";

interface ArtistModalProps {
  artist: NormalizedArtist | null;
  onClose: () => void;
  allTracks: NormalizedTrack[];
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function ArtistModal({ artist, onClose, allTracks }: ArtistModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!artist) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [artist, onClose]);

  // Lock scroll
  useEffect(() => {
    if (artist) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [artist]);

  // Compute artist-specific stats from allTracks
  const artistTracks = artist
    ? allTracks.filter(
        (t) =>
          t.artist.toLowerCase() === artist.name.toLowerCase() ||
          (t.albumArtist && t.albumArtist.toLowerCase() === artist.name.toLowerCase())
      )
    : [];

  const totalPlayCount = artistTracks.reduce((sum, t) => sum + (t.playCount ?? 0), 0);

  const topTracks = [...artistTracks]
    .sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
    .slice(0, 10);

  const displayTrackCount = artist?.trackCount ?? artistTracks.length;
  const displayPlayCount = artist?.totalPlayCount ?? totalPlayCount;

  return (
    <AnimatePresence>
      {artist && (
        <motion.div
          ref={overlayRef}
          key="artist-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{ backdropFilter: "blur(16px)", background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <motion.div
            key="artist-modal-panel"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            style={{ background: "oklch(0.17 0 0)", border: "1px solid var(--border)" }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.536_0.207_25.437)]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" style={{ color: "var(--foreground)" }} />
            </button>

            {/* ── Header: Photo + Name ── */}
            <div
              className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-8 pb-6 flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.536 0.207 25.437 / 0.12) 0%, transparent 60%)",
              }}
            >
              {/* Artist photo (circle) */}
              <div
                className="relative flex-shrink-0 overflow-hidden"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  border: "3px solid oklch(0.536 0.207 25.437 / 0.4)",
                }}
              >
                <CoverImage
                  src={artist.image}
                  alt={artist.name}
                  sizes="120px"
                  priority
                  artist={artist.name}
                  type="artist"
                />
              </div>

              {/* Artist info */}
              <div className="text-center sm:text-left pb-1 min-w-0">
                <p
                  className="text-[10px] font-mono uppercase tracking-widest mb-2"
                  style={{ color: "oklch(0.536 0.207 25.437)" }}
                >
                  Artist
                </p>
                <h2
                  className="text-2xl sm:text-3xl font-bold font-mono leading-tight pr-10 truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {artist.name}
                </h2>

                {/* Genre pills */}
                {artist.genres && artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 justify-center sm:justify-start">
                    {artist.genres.slice(0, 5).map((g) => (
                      <span
                        key={g}
                        className="text-[10px] font-mono px-2 py-0.5 uppercase tracking-wide"
                        style={{
                          background: "oklch(0.536 0.207 25.437 / 0.12)",
                          color: "oklch(0.536 0.207 25.437)",
                          border: "1px solid oklch(0.536 0.207 25.437 / 0.25)",
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Stats bar ── */}
            <div className="grid grid-cols-3 divide-x divide-border flex-shrink-0 border-y border-border">
              {[
                {
                  icon: <Music2 className="w-4 h-4" />,
                  label: "Tracks",
                  value: displayTrackCount.toLocaleString(),
                },
                {
                  icon: <Headphones className="w-4 h-4" />,
                  label: "Total Plays",
                  value: displayPlayCount.toLocaleString(),
                },
                {
                  icon: <Disc3 className="w-4 h-4" />,
                  label: "Albums",
                  value: (artist.albums?.length ?? 0).toLocaleString(),
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex flex-col items-center py-4 gap-1.5">
                  <span style={{ color: "oklch(0.536 0.207 25.437)" }}>{icon}</span>
                  <span
                    className="text-lg font-bold font-mono tabular-nums"
                    style={{ color: "var(--foreground)" }}
                  >
                    {value}
                  </span>
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Top Tracks ── */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4">
                <p
                  className="text-[10px] font-mono uppercase tracking-widest mb-3"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Top Tracks by Play Count
                </p>

                {topTracks.length === 0 ? (
                  <p
                    className="text-sm font-mono py-8 text-center"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No track data available
                  </p>
                ) : (
                  <ul>
                    {topTracks.map((track, idx) => {
                      const maxPlays = topTracks[0]?.playCount ?? 1;
                      const ratio = (track.playCount ?? 0) / (maxPlays || 1);
                      return (
                        <li
                          key={track.id}
                          className="flex items-center gap-3 py-2.5"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          {/* Rank */}
                          <span
                            className="w-5 text-right text-xs font-mono flex-shrink-0 tabular-nums"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {idx + 1}
                          </span>

                          {/* Bar + Title */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-sm font-mono truncate"
                                style={{ color: "var(--foreground)" }}
                              >
                                {track.title}
                              </span>
                            </div>
                            <div
                              className="h-0.5 rounded-full"
                              style={{ background: "var(--border)", width: "100%" }}
                            >
                              <motion.div
                                className="h-0.5"
                                initial={{ width: 0 }}
                                animate={{ width: `${ratio * 100}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.04, ease: "easeOut" }}
                                style={{ background: "oklch(0.536 0.207 25.437)" }}
                              />
                            </div>
                          </div>

                          {/* Plays */}
                          {typeof track.playCount === "number" && (
                            <span
                              className="text-xs font-mono flex-shrink-0 tabular-nums"
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
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
