"use client";

import { Clock, Sparkles } from "lucide-react";
import { CoverImage } from "./CoverImage";
import type { NormalizedAlbum } from "@/lib/music/types";

interface Props {
  albums: NormalizedAlbum[];
  onAlbumClick: (album: NormalizedAlbum) => void;
}

function toDate(dateInput?: Date | string): Date | null {
  if (!dateInput) return null;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
}

function formatRelativeDate(dateInput?: Date | string): string {
  const date = toDate(dateInput);
  if (!date) return "Recently";
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? "week" : "weeks"} ago`;
  if (diffDays < 365) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function isNew(dateInput?: Date | string): boolean {
  const date = toDate(dateInput);
  if (!date) return false;
  const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7 && diffDays >= 0;
}

export function RecentlyAdded({ albums, onAlbumClick }: Props) {
  if (!albums || albums.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 text-primary">
          <Clock size={20} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Recently Added
          </h2>
          <p className="text-foreground/40 text-sm font-mono">
            Newest arrivals to my digital music library
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {albums.slice(0, 10).map((album, i) => {
          const isRecentlyAdded = isNew(album.dateAdded);

          return (
            <div
              key={album.id}
              onClick={() => onAlbumClick(album)}
              className="group cursor-pointer flex items-center gap-4 p-3 md:p-4 bg-card/40 border border-border/80 hover:border-primary/60 hover:bg-foreground/[0.02] transition-all overflow-hidden relative"
            >
              {/* Artwork */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 overflow-hidden rounded bg-foreground/5 border border-border/40">
                <CoverImage
                  src={album.artwork}
                  alt={album.title}
                  className="group-hover:scale-105 transition-transform duration-300"
                  sizes="80px"
                  album={album.title}
                  artist={album.artist}
                  type="album"
                />
              </div>

              {/* Title and details */}
              <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base md:text-lg truncate group-hover:text-primary transition-colors">
                      {album.title}
                    </h3>
                    {isRecentlyAdded && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-primary text-background font-bold px-1.5 py-0.5 uppercase tracking-wider shrink-0">
                        <Sparkles size={10} />
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-foreground/50 text-sm truncate mt-0.5">
                    {album.artist}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-xs font-mono text-foreground/40">
                  <span>{album.genre || "Music"}</span>
                  <span className="text-foreground/60">
                    {formatRelativeDate(album.dateAdded)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
