"use client";

import { Star } from "lucide-react";
import { CoverImage } from "./CoverImage";
import type { NormalizedAlbum } from "@/lib/music/types";

interface Props {
  albums: NormalizedAlbum[];
  onAlbumClick: (album: NormalizedAlbum) => void;
}

export function HighestRatedAlbums({ albums, onAlbumClick }: Props) {
  if (!albums || albums.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 text-primary">
          <Star size={20} className="fill-primary" />
        </div>
        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-foreground/50">
            Highest Rated
          </h2>
          <p className="text-foreground/40 text-sm font-mono">
            Albums with 4 and 5 star ratings in my personal library
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
        {albums.slice(0, 12).map((album, i) => {
          const rating = album.rating ?? 0;

          return (
            <div
              key={album.id}
              onClick={() => onAlbumClick(album)}
              className="group cursor-pointer flex flex-col bg-card/40 border border-border/80 hover:border-primary/60 transition-all overflow-hidden"
            >
              {/* Artwork Container */}
              <div className="relative aspect-square w-full overflow-hidden rounded bg-foreground/5">
                <CoverImage
                  src={album.artwork}
                  alt={album.title}
                  className="group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 33vw"
                  album={album.title}
                  artist={album.artist}
                  type="album"
                />

                {/* Rating Overlay badge */}
                <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-background/90 backdrop-blur-md px-2 py-1 border border-border/60 z-10">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      className={
                        s < rating
                          ? "fill-[#FFD700] text-[#FFD700]"
                          : "text-foreground/20"
                      }
                    />
                  ))}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-opacity duration-300" />
              </div>

              {/* Title & Info */}
              <div className="p-3 md:p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-sm md:text-base truncate group-hover:text-primary transition-colors">
                    {album.title}
                  </h3>
                  <p className="text-foreground/50 text-xs md:text-sm truncate mt-0.5">
                    {album.artist}
                  </p>
                </div>
                {album.year && (
                  <div className="mt-2 text-right">
                    <span className="font-mono text-[10px] text-foreground/30 border border-border/40 px-1.5 py-0.5">
                      {album.year}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
