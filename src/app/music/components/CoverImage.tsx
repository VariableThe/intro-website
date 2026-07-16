"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Disc, Music } from "lucide-react";

interface CoverImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  type?: "album" | "track" | "artist";
  album?: string;
  artist?: string;
}

// Global memory cache to prevent duplicate client-side requests across components during a session
const clientArtworkCache = new Map<string, string>();
const failedUrls = new Set<string>();

export function CoverImage({
  src,
  alt,
  className = "",
  sizes = "100px",
  priority = false,
  type = "album",
  album,
  artist,
}: CoverImageProps) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null | undefined>(src);

  useEffect(() => {
    if (src && failedUrls.has(src)) {
      setHasError(true);
      setCurrentSrc("/music/placeholder.png");
    } else {
      setCurrentSrc(src);
      setHasError(false);
    }
  }, [src]);

  const isPlaceholder =
    !currentSrc ||
    currentSrc === "/music/placeholder.png" ||
    currentSrc.trim() === "" ||
    failedUrls.has(currentSrc);

  // If currently showing placeholder and we have album/artist info, lazily resolve from our backend API
  useEffect(() => {
    if (isPlaceholder && !hasError && album && artist) {
      const cacheKey = `${artist}:::${album}`.toLowerCase();
      if (clientArtworkCache.has(cacheKey)) {
        const cachedUrl = clientArtworkCache.get(cacheKey);
        if (cachedUrl && cachedUrl !== "/music/placeholder.png" && !failedUrls.has(cachedUrl)) {
          setCurrentSrc(cachedUrl);
          setHasError(false);
        } else {
          setHasError(true);
        }
        return;
      }

      let isMounted = true;
      const timer = setTimeout(() => {
        const params = new URLSearchParams({ album, artist });
        fetch(`/api/music/resolve-artwork?${params.toString()}`)
          .then((res) => res.json())
          .then((data) => {
            if (isMounted && data?.artworkUrl) {
              if (data.artworkUrl !== "/music/placeholder.png" && !failedUrls.has(data.artworkUrl)) {
                clientArtworkCache.set(cacheKey, data.artworkUrl);
                setCurrentSrc(data.artworkUrl);
                setHasError(false);
              } else {
                clientArtworkCache.set(cacheKey, "/music/placeholder.png");
                setHasError(true);
              }
            }
          })
          .catch(() => {
            if (isMounted) setHasError(true);
          });
      }, 350);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [isPlaceholder, hasError, album, artist]);

  if (isPlaceholder || hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-2 text-center select-none overflow-hidden relative border border-border/20 ${className}`}
        style={{
          background:
            "linear-gradient(135deg, oklch(0.19 0.015 260) 0%, oklch(0.13 0.01 260) 100%)",
        }}
      >
        {/* Decorative vinyl rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
          <div className="w-[82%] h-[82%] rounded-full border border-white/60" />
          <div className="w-[58%] h-[58%] rounded-full border border-white/40 absolute" />
          <div className="w-[34%] h-[34%] rounded-full border border-white/30 absolute" />
        </div>

        {type === "artist" ? (
          <Music className="w-2/5 h-2/5 max-w-[40px] max-h-[40px] text-muted-foreground/80 z-10" />
        ) : (
          <Disc className="w-2/5 h-2/5 max-w-[40px] max-h-[40px] text-muted-foreground/80 z-10" />
        )}
      </div>
    );
  }

  return (
    <Image
      src={currentSrc!}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      onError={() => {
        if (currentSrc) {
          failedUrls.add(currentSrc);
          if (album && artist) {
            clientArtworkCache.set(`${artist}:::${album}`.toLowerCase(), "/music/placeholder.png");
          }
        }
        setHasError(true);
      }}
    />
  );
}
