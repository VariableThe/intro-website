"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CoverImage } from "./CoverImage";
import { Eye } from "lucide-react";
import type { TopItems, NormalizedArtist, TimeRange } from "@/lib/music/types";

interface TopArtistsProps {
  topArtists: TopItems<NormalizedArtist>;
  onArtistClick: (artist: NormalizedArtist) => void;
}

const TABS: { label: string; key: TimeRange }[] = [
  { label: "4 Weeks", key: "short" },
  { label: "6 Months", key: "medium" },
  { label: "All Time", key: "long" },
];

export function TopArtists({ topArtists, onArtistClick }: TopArtistsProps) {
  const [activeTab, setActiveTab] = useState<TimeRange>("short");
  const [direction, setDirection] = useState(0);

  const artists = topArtists[activeTab];

  const handleTabChange = (key: TimeRange) => {
    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    const nextIndex = TABS.findIndex((t) => t.key === key);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setActiveTab(key);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-mono tracking-tight text-[var(--foreground)]">
          Top Artists
        </h2>

        {/* Tabs */}
        <div className="relative flex gap-0 border border-[var(--border)]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className="relative px-4 py-2 text-xs font-mono font-medium tracking-wider transition-colors duration-200 cursor-pointer"
              style={{
                color:
                  activeTab === tab.key
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
              }}
            >
              {activeTab === tab.key && (
                <motion.span
                  layoutId="top-artists-tab-bg"
                  className="absolute inset-0 bg-[var(--primary)]"
                  style={{ zIndex: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Artist grid */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {artists.map((artist, index) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              index={index}
              onClick={() => onArtistClick(artist)}
            />
          ))}

          {artists.length === 0 && (
            <p className="col-span-full text-sm text-[var(--muted-foreground)] font-mono py-8 text-center">
              No artists available for this period.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function ArtistCard({
  artist,
  index,
  onClick,
}: {
  artist: NormalizedArtist;
  index: number;
  onClick: () => void;
}) {
  const genres = (artist.genres ?? []).slice(0, 2);

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={onClick}
      className="group flex flex-col items-center gap-3 p-3 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors duration-200 cursor-pointer text-left w-full"
      whileHover={{ y: -4 }}
    >
      {/* Artist photo */}
      <div className="relative w-full aspect-square overflow-hidden rounded-full bg-[var(--muted)]">
        <CoverImage
          src={artist.image}
          alt={artist.name}
          className="transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          artist={artist.name}
          type="artist"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center rounded-full">
          <Eye
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            size={22}
          />
        </div>
      </div>

      {/* Name */}
      <p className="text-sm font-semibold font-mono text-[var(--foreground)] text-center truncate w-full">
        {artist.name}
      </p>

      {/* Genre pills */}
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {genres.map((genre) => (
            <span
              key={genre}
              className="text-[9px] font-mono px-1.5 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] uppercase tracking-wider"
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}
