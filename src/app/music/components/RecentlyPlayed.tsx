"use client";

import { motion } from "framer-motion";
import { CoverImage } from "./CoverImage";
import { useRef, useState, useCallback } from "react";
import type { NormalizedTrack } from "@/lib/music/types";

interface RecentlyPlayedProps {
  tracks: NormalizedTrack[];
}

function SourceBadge({ source }: { source: string }) {
  const label = source === "spotify" ? "Spotify" : "Apple";
  return (
    <span
      className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5"
      style={{
        background: "var(--primary)",
        color: "#fff",
      }}
    >
      {label}
    </span>
  );
}

function timeAgo(dateInput?: Date | string): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "";
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  } catch {
    return "";
  }
}

function TrackCard({
  track,
  index,
}: {
  track: NormalizedTrack;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="group relative flex-shrink-0 cursor-pointer select-none"
      style={{ width: "130px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Artwork */}
      <div className="relative w-full overflow-hidden rounded" style={{ aspectRatio: "1 / 1" }}>
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
        >
          <CoverImage
            src={track.artwork}
            alt={track.title}
            sizes="130px"
            album={track.album}
            artist={track.artist}
            type="track"
          />
        </div>
        {/* Source badge overlay on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-end p-1.5 transition-all duration-200"
          style={{
            opacity: hovered ? 1 : 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
          }}
        >
          <SourceBadge source={track.source} />
        </div>
      </div>

      {/* Track info */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <p
          className="text-sm font-medium leading-tight truncate"
          style={{ color: "var(--foreground)" }}
        >
          {track.title}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: "var(--muted-foreground)" }}
        >
          {track.artist}
        </p>
        {track.playedAt && (
          <p
            className="text-[10px] font-mono mt-0.5"
            style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
          >
            {timeAgo(track.playedAt)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function RecentlyPlayed({ tracks }: RecentlyPlayedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }, []);

  if (tracks.length === 0) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-5">
        <h2
          className="font-mono text-xs uppercase tracking-widest text-foreground/50"
        >
          Recently Played
        </h2>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--muted-foreground)" }}
        >
          {tracks.length} tracks
        </span>
      </div>

      {/* Horizontal scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-1"
        style={{
          cursor: "grab",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <style>{`
          .recently-played-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        {tracks.map((track, i) => (
          <TrackCard key={`${track.id}-${i}`} track={track} index={i} />
        ))}
        {/* Fade-out right edge sentinel */}
        <div className="flex-shrink-0 w-8" />
      </div>
    </div>
  );
}
