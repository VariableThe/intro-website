"use client";

import { motion, type Variants } from "framer-motion";
import { CoverImage } from "./CoverImage";
import { Heart } from "lucide-react";
import type { NormalizedTrack } from "@/lib/music/types";

interface LovedTracksProps {
  tracks: NormalizedTrack[];
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function LovedTracks({ tracks }: LovedTracksProps) {
  if (tracks.length === 0) {
    return (
      <section className="w-full">
        <SectionHeader />
        <p className="text-sm font-mono text-[var(--muted-foreground)] py-8 text-center">
          No loved tracks found.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full">
      <SectionHeader />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </motion.div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-2xl font-bold font-mono tracking-tight text-[var(--foreground)]">
        Loved Tracks
      </h2>
      <Heart
        size={20}
        className="text-[var(--primary)] fill-[var(--primary)] mt-0.5"
      />
    </div>
  );
}

function TrackCard({ track }: { track: NormalizedTrack }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group flex flex-col gap-2"
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full overflow-hidden rounded bg-[var(--card)]">
        <CoverImage
          src={track.artwork}
          alt={track.title}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="transition-transform duration-300 group-hover:scale-105"
          album={track.album}
          artist={track.artist}
          type="track"
        />

        {/* Heart badge — top right */}
        <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm">
          <Heart size={12} className="text-[var(--primary)] fill-[var(--primary)]" />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
      </div>

      {/* Track info */}
      <div className="min-w-0">
        <p className="text-xs font-semibold font-mono text-[var(--foreground)] truncate leading-snug">
          {track.title}
        </p>
        <p className="text-[10px] font-mono text-[var(--muted-foreground)] truncate mt-0.5">
          {track.artist}
        </p>
      </div>
    </motion.div>
  );
}
