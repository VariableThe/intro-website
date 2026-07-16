"use client";

import { motion, useAnimationFrame } from "framer-motion";
import { Music2 } from "lucide-react";
import { CoverImage } from "./CoverImage";
import { useRef, useState } from "react";
import type { NowPlayingTrack } from "@/lib/music/types";

interface NowPlayingProps {
  data: NowPlayingTrack | null;
}

function VinylRecord({
  artwork,
  isPlaying,
}: {
  artwork: string;
  isPlaying: boolean;
}) {
  return (
    <div className="relative flex-shrink-0 w-40 h-40 sm:w-52 sm:h-52">
      {/* Outer vinyl disc */}
      <div
        className="w-full h-full rounded-full"
        style={{
          background:
            "radial-gradient(circle, #1a1a1a 28%, #111 28%, #111 30%, #1a1a1a 30%, #1a1a1a 32%, #111 32%, #111 34%, #1a1a1a 34%, #1a1a1a 48%, #111 48%, #111 49%, #1a1a1a 49%)",
          animation: isPlaying ? "vinylSpin 3s linear infinite" : "none",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.05), 0 8px 40px rgba(0,0,0,0.7)",
        }}
      >
        {/* Album art circle in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative overflow-hidden rounded-full"
            style={{ width: "42%", height: "42%" }}
          >
            <CoverImage
              src={artwork}
              alt="Album art"
              sizes="100px"
              type="track"
            />
          </div>
        </div>
        {/* Center hole */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full"
            style={{
              width: "8%",
              height: "8%",
              background: "#0a0a0a",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
            }}
          />
        </div>
      </div>
      {/* Sheen overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

function ProgressBar({
  progressMs,
  durationMs,
  isPlaying,
}: {
  progressMs: number;
  durationMs: number;
  isPlaying: boolean;
}) {
  const [progress, setProgress] = useState(progressMs);
  const lastTs = useRef<number | null>(null);

  useAnimationFrame((ts) => {
    if (!isPlaying) {
      lastTs.current = null;
      return;
    }
    if (lastTs.current === null) {
      lastTs.current = ts;
      return;
    }
    const delta = ts - lastTs.current;
    lastTs.current = ts;
    setProgress((p) => Math.min(p + delta, durationMs));
  });

  const pct = durationMs > 0 ? (progress / durationMs) * 100 : 0;

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      <div
        className="relative h-0.5 w-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.12)" }}
      >
        <div
          className="absolute left-0 top-0 h-full transition-none"
          style={{ background: "var(--primary)", width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span
          className="text-[10px] font-mono"
          style={{ color: "var(--muted-foreground)" }}
        >
          {fmt(progress)}
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: "var(--muted-foreground)" }}
        >
          {fmt(durationMs)}
        </span>
      </div>
    </div>
  );
}

export function NowPlaying({ data }: NowPlayingProps) {
  const isActive = !!(data?.isPlaying && data.track);
  const track = data?.track ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        minHeight: "220px",
      }}
    >
      {/* Blurred background artwork */}
      {track && (
        <div className="absolute inset-0 pointer-events-none select-none">
          <div
            className="absolute inset-0"
            style={{
              filter: "blur(60px) scale(1.1)",
              opacity: 0.3,
              transform: "scale(1.15)",
            }}
          >
            <CoverImage
              src={track.artwork}
              alt=""
              sizes="100vw"
              type="track"
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 100%)",
            }}
          />
        </div>
      )}

      {/* Content */}
      {isActive && track ? (
        <div className="relative z-10 flex items-center gap-6 sm:gap-8 p-6 sm:p-8">
          <VinylRecord artwork={track.artwork} isPlaying={data!.isPlaying} />

          <div className="flex-1 min-w-0">
            {/* Playing indicator */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background: "#1DB954",
                  boxShadow: "0 0 8px #1DB954",
                  animation: "nowPlayingPulse 1.5s ease-in-out infinite",
                }}
              />
              <span
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: "#1DB954" }}
              >
                Now Playing
              </span>
            </div>

            <h2
              className="text-2xl sm:text-3xl font-bold leading-tight truncate"
              style={{ color: "var(--foreground)" }}
            >
              {track.title}
            </h2>

            <p
              className="text-base sm:text-lg mt-1 truncate"
              style={{ color: "var(--muted-foreground)" }}
            >
              {track.artist}
            </p>

            <p
              className="text-sm mt-0.5 truncate"
              style={{ color: "var(--muted-foreground)", opacity: 0.65 }}
            >
              {track.album}
            </p>

            {data?.progressMs !== undefined && data?.durationMs ? (
              <div className="mt-5">
                <ProgressBar
                  progressMs={data.progressMs}
                  durationMs={data.durationMs}
                  isPlaying={data.isPlaying}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center gap-3 py-14">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full"
            style={{ background: "var(--muted)" }}
          >
            <Music2
              className="w-6 h-6"
              style={{ color: "var(--muted-foreground)" }}
            />
          </div>
          <p
            className="text-sm font-mono"
            style={{ color: "var(--muted-foreground)" }}
          >
            Nothing playing right now
          </p>
        </div>
      )}

      <style>{`
        @keyframes vinylSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes nowPlayingPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>
    </motion.div>
  );
}
