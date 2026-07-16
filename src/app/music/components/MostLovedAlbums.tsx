"use client";

import { motion } from "framer-motion";
import { Heart, Disc3 } from "lucide-react";
import { CoverImage } from "./CoverImage";
import type { NormalizedAlbum } from "@/lib/music/types";

interface Props {
  albums: NormalizedAlbum[];
  onAlbumClick: (album: NormalizedAlbum) => void;
}

export function MostLovedAlbums({ albums, onAlbumClick }: Props) {
  if (!albums || albums.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 text-primary">
          <Heart size={20} className="fill-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Most Loved Albums
          </h2>
          <p className="text-foreground/40 text-sm font-mono">
            Records marked with love and heavily played over the years
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
        {albums.slice(0, 12).map((album, i) => {
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

                {/* Loved heart badge top right */}
                <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-md p-1.5 border border-border/60 z-10 text-primary">
                  <Heart size={14} className="fill-primary" />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                  <Disc3 size={32} className="text-primary mb-2 animate-spin-slow" />
                  <span className="font-mono text-xs uppercase tracking-wider text-foreground/80">
                    Explore Album
                  </span>
                </div>
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
                {album.totalPlayCount !== undefined && album.totalPlayCount > 0 && (
                  <div className="mt-2 text-right">
                    <span className="font-mono text-[11px] text-foreground/40">
                      {album.totalPlayCount.toLocaleString()} plays
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
