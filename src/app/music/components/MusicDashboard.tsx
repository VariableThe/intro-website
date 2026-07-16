"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { MusicApiResponse, NormalizedAlbum, NormalizedArtist } from "@/lib/music/types";

// ─── Lazy-import all dashboard components ─────────────────────────────────────
// This keeps the initial bundle small and lets each section load independently.

import { NowPlaying } from "./NowPlaying";
import { TodaysPick } from "./TodaysPick";
import { MusicStats } from "./MusicStats";
import { RecentlyPlayed } from "./RecentlyPlayed";
import { TopTracks } from "./TopTracks";
import { TopArtists } from "./TopArtists";
import { OnRepeat } from "./OnRepeat";
import { LovedTracks } from "./LovedTracks";
import { HighestRatedAlbums } from "./HighestRatedAlbums";
import { MostLovedAlbums } from "./MostLovedAlbums";
import { RecentlyAdded } from "./RecentlyAdded";
import { AlbumWall } from "./AlbumWall";
import { HiddenGems } from "./HiddenGems";
import { MostSkipped } from "./MostSkipped";
import { OldestNewest } from "./OldestNewest";
import { GenreMap } from "./GenreMap";
import { ListeningTimeline } from "./ListeningTimeline";
import { AlbumModal } from "./AlbumModal";
import { ArtistModal } from "./ArtistModal";

interface Props {
  response: MusicApiResponse | null;
}

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`mb-16 md:mb-24 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function MusicDashboard({ response }: Props) {
  const [selectedAlbum, setSelectedAlbum] = useState<NormalizedAlbum | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<NormalizedArtist | null>(null);

  // ── Empty / Error state ──
  if (!response || !response.data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground/30 font-mono text-sm pt-16">
        <div className="text-center">
          <p className="text-4xl mb-4">♪</p>
          <p>No music data available.</p>
          <p className="text-xs mt-2 text-foreground/20">
            Add your Apple Music library.xml and set Spotify env vars to get started.
          </p>
        </div>
      </div>
    );
  }

  const { data, providers } = response;

  const hasSpotify = providers.includes("spotify");
  const hasApple = providers.includes("appleXml");

  return (
    <>
      {/* ── Page header ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-3">
            Music
          </h1>
          <p className="text-foreground/40 text-base font-mono">
            What I&apos;ve been listening to, loving, and repeating.
            {!hasSpotify && !hasApple && (
              <span className="ml-2 text-primary">No data sources configured.</span>
            )}
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">

        {/* ── Stats bar ── */}
        <Section>
          <MusicStats stats={data.stats} providers={providers} />
        </Section>

        {/* ── Today's Pick (hero) ── */}
        {data.todaysPick && (
          <Section>
            <TodaysPick album={data.todaysPick} onAlbumClick={setSelectedAlbum} />
          </Section>
        )}

        {/* ── Now Playing ── */}
        {hasSpotify && (
          <Section>
            <NowPlaying data={data.nowPlaying} />
          </Section>
        )}

        {/* ── Recently Played ── */}
        {hasSpotify && data.recentlyPlayed.length > 0 && (
          <Section>
            <RecentlyPlayed tracks={data.recentlyPlayed} />
          </Section>
        )}

        {/* ── Top Tracks + Top Artists (two col on desktop) ── */}
        {hasSpotify && (
          <Section className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <TopTracks topTracks={data.topTracks} />
            <TopArtists topArtists={data.topArtists} onArtistClick={setSelectedArtist} />
          </Section>
        )}

        {/* ── On Repeat ── */}
        {hasApple && data.onRepeat.length > 0 && (
          <Section>
            <OnRepeat tracks={data.onRepeat} />
          </Section>
        )}

        {/* ── Loved Tracks + Highest Rated (two col) ── */}
        {hasApple && (
          <Section className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {data.lovedTracks.length > 0 && <LovedTracks tracks={data.lovedTracks} />}
            {data.highestRatedAlbums.length > 0 && (
              <HighestRatedAlbums albums={data.highestRatedAlbums} onAlbumClick={setSelectedAlbum} />
            )}
          </Section>
        )}

        {/* ── Most Loved Albums ── */}
        {hasApple && data.mostLovedAlbums.length > 0 && (
          <Section>
            <MostLovedAlbums albums={data.mostLovedAlbums} onAlbumClick={setSelectedAlbum} />
          </Section>
        )}

        {/* ── Hidden Gems ── */}
        {hasApple && data.hiddenGems.length > 0 && (
          <Section>
            <HiddenGems albums={data.hiddenGems} onAlbumClick={setSelectedAlbum} />
          </Section>
        )}

        {/* ── Recently Added ── */}
        {hasApple && data.recentlyAdded.length > 0 && (
          <Section>
            <RecentlyAdded albums={data.recentlyAdded} onAlbumClick={setSelectedAlbum} />
          </Section>
        )}

        {/* ── Oldest / Newest ── */}
        {hasApple && (data.oldestAlbum || data.newestAlbum) && (
          <Section>
            <OldestNewest
              oldest={data.oldestAlbum}
              newest={data.newestAlbum}
              onAlbumClick={setSelectedAlbum}
            />
          </Section>
        )}

        {/* ── Genre Map + Listening Timeline (two col) ── */}
        {hasApple && (
          <Section className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {data.genreDistribution.length > 0 && (
              <GenreMap distribution={data.genreDistribution} />
            )}
            {data.listeningHeatmap.length > 0 && (
              <ListeningTimeline heatmap={data.listeningHeatmap} />
            )}
          </Section>
        )}

        {/* ── Most Skipped ── */}
        {hasApple && data.mostSkipped.length > 0 && (
          <Section>
            <MostSkipped tracks={data.mostSkipped} />
          </Section>
        )}

        {/* ── Album Wall ── */}
        {hasApple && data.allAlbums.length > 0 && (
          <Section>
            <AlbumWall albums={data.allAlbums} onAlbumClick={setSelectedAlbum} />
          </Section>
        )}

        {/* ── Footer ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-foreground/20 font-mono text-xs pt-8 border-t border-border"
        >
          Data from{" "}
          {providers.map((p, i) => (
            <span key={p}>
              {p === "spotify" ? "Spotify" : "Apple Music Library"}
              {i < providers.length - 1 ? " + " : ""}
            </span>
          ))}
          {" · "}
          Cached every 20 minutes
        </motion.p>
      </div>

      {/* ── Modals ── */}
      <AlbumModal
        album={selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
      />
      <ArtistModal
        artist={selectedArtist}
        allTracks={data.allAlbums.flatMap((a) => a.tracks ?? [])}
        onClose={() => setSelectedArtist(null)}
      />
    </>
  );
}
