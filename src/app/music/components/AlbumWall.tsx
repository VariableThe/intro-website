"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import type { NormalizedAlbum } from "@/lib/music/types";
import { CoverImage } from "./CoverImage";
import { Search, Heart, Star, Disc, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface AlbumWallProps {
  albums: NormalizedAlbum[];
  onAlbumClick: (album: NormalizedAlbum) => void;
}

function AlbumCell({
  album,
  onClick,
  index,
}: {
  album: NormalizedAlbum;
  onClick: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: Math.min((index % 24) * 0.015, 0.3) }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative aspect-square overflow-hidden rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.536_0.207_25.437)] group cursor-pointer border border-border/40 shadow-sm bg-card/60"
      aria-label={`${album.title} by ${album.artist}`}
    >
      {/* Artwork */}
      <CoverImage
        src={album.artwork}
        alt={album.title}
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
        className="transition-transform duration-500 group-hover:scale-110"
        album={album.title}
        artist={album.artist}
        type="album"
      />

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex flex-col justify-end p-2.5 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
            }}
          >
            <p className="text-white text-xs font-bold font-mono leading-tight line-clamp-2 text-left">
              {album.title}
            </p>
            <p
              className="text-[11px] font-mono leading-tight truncate text-left mt-0.5"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {album.artist}
            </p>
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-white/10 text-[9px] font-mono text-white/60">
              {album.year && <span>{album.year}</span>}
              {album.loved && (
                <span className="text-red-400 flex items-center gap-0.5 font-bold">
                  <Heart className="w-2.5 h-2.5 fill-red-400 inline" /> Loved
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

type FilterTab = "all" | "loved" | "rated" | "artwork";

export function AlbumWall({ albums, onAlbumClick }: AlbumWallProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24; // 24 albums per page (clean 6x4 or 4x6 grid)

  // Reset to page 1 whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTab]);

  // Filtered albums based on tab and search
  const filteredAlbums = useMemo(() => {
    return albums.filter((a) => {
      // Tab filtering
      if (filterTab === "loved" && !a.loved) return false;
      if (filterTab === "rated" && (a.rating ?? 0) < 5) return false;
      if (filterTab === "artwork" && (!a.artwork || a.artwork === "/music/placeholder.png")) {
        return false;
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(q);
        const matchesArtist = a.artist.toLowerCase().includes(q);
        const matchesGenre = a.genre?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesArtist && !matchesGenre) return false;
      }

      return true;
    });
  }, [albums, filterTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAlbums.length / pageSize));
  const pageAlbums = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlbums.slice(start, start + pageSize);
  }, [filteredAlbums, currentPage]);

  const filterCounts = useMemo(() => {
    let loved = 0;
    let rated = 0;
    let artwork = 0;
    for (const a of albums) {
      if (a.loved) loved++;
      if ((a.rating ?? 0) >= 5) rated++;
      if (a.artwork && a.artwork !== "/music/placeholder.png") artwork++;
    }
    return { all: albums.length, loved, rated, artwork };
  }, [albums]);

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2
            className="font-mono text-xs uppercase tracking-widest text-foreground/50 flex items-center gap-2"
          >
            Album Wall
          </h2>
          <p className="text-sm font-mono mt-1" style={{ color: "var(--muted-foreground)" }}>
            Explore all {albums.length.toLocaleString()} albums in your personal library
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search albums or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.536_0.207_25.437)] transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-border/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(
            [
              { id: "all", label: `All (${filterCounts.all})` },
              { id: "artwork", label: `With Cover (${filterCounts.artwork})` },
              { id: "loved", label: `Loved (${filterCounts.loved})`, icon: Heart },
              { id: "rated", label: `5 Stars (${filterCounts.rated})`, icon: Star },
            ] as const
          ).map((tab) => {
            const isActive = filterTab === tab.id;
            const Icon = 'icon' in tab ? tab.icon : undefined;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as FilterTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[oklch(0.536_0.207_25.437)] text-white shadow-sm font-semibold"
                    : "bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border border-border/40"
                }`}
              >
                {Icon && <Icon className={`w-3 h-3 ${isActive ? "fill-white" : ""}`} />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Top Page Counter */}
        <div className="text-xs font-mono text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{filteredAlbums.length}</span> albums
        </div>
      </div>

      {/* Grid */}
      {pageAlbums.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filterTab}-${searchQuery}-${currentPage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
          >
            {pageAlbums.map((album, i) => (
              <AlbumCell
                key={`${album.id}-${currentPage}`}
                album={album}
                onClick={() => onAlbumClick(album)}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-border/60 rounded-lg bg-card/20 my-6">
          <Disc className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-mono text-foreground font-medium">No albums found matching your filter</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Try adjusting your search query or switching tabs.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterTab("all");
            }}
            className="mt-4 px-4 py-1.5 text-xs font-mono bg-card border border-border rounded text-foreground hover:border-[oklch(0.536_0.207_25.437)] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Bottom Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-muted-foreground">
            Page <span className="font-bold text-foreground">{currentPage}</span> of{" "}
            <span className="font-bold text-foreground">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {/* Quick Page Jump Pills */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => {
                  const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <div key={p} className="flex items-center">
                      {showEllipsisBefore && (
                        <span className="px-1 text-xs font-mono text-muted-foreground">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-mono transition-colors cursor-pointer ${
                          currentPage === p
                            ? "bg-[oklch(0.536_0.207_25.437)] text-white font-bold"
                            : "bg-card hover:bg-muted text-muted-foreground border border-border/40"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
