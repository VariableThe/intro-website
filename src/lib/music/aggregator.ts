// ─── Music Data Aggregator ─────────────────────────────────────────────────────
// Calls all registered providers in parallel, merges results into a single
// MusicData object. The aggregator is the only place that knows about providers —
// all consumers (API route, components) work with MusicData only.

import type { MusicData, MusicStats, NormalizedTrack, NormalizedAlbum, MusicSource } from "./types";
import type { MusicProvider } from "./providers/provider";
import { AppleXmlProvider } from "./providers/appleXml";

// ─── Registered providers ─────────────────────────────────────────────────────
// Add new providers here — no other changes needed.

const PROVIDERS: MusicProvider[] = [
  new AppleXmlProvider(),
];

// ─── Deduplication helpers ────────────────────────────────────────────────────

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toEpoch(val: Date | string | undefined): number {
  if (!val) return 0;
  if (val instanceof Date) return val.getTime();
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

function trackKey(t: NormalizedTrack): string {
  return `${normalizeKey(t.title)}::${normalizeKey(t.artist)}`;
}

function albumKey(a: NormalizedAlbum): string {
  return `${normalizeKey(a.title)}::${normalizeKey(a.artist)}`;
}

/** Merge two tracks, preferring the one with more metadata */
function mergeTrack(a: NormalizedTrack, b: NormalizedTrack): NormalizedTrack {
  return {
    ...a,
    // Prefer Apple XML's richer metadata
    playCount: a.playCount ?? b.playCount,
    loved: a.loved ?? b.loved,
    rating: a.rating ?? b.rating,
    genre: a.genre ?? b.genre,
    bpm: a.bpm ?? b.bpm,
    year: a.year ?? b.year,
    composer: a.composer ?? b.composer,
    skipCount: a.skipCount ?? b.skipCount,
    dateAdded: a.dateAdded ?? b.dateAdded,
    lastPlayed: a.lastPlayed ?? b.lastPlayed,
    // Prefer the source with better artwork
    artwork: a.artwork !== "/music/placeholder.png" ? a.artwork : b.artwork,
  };
}

// ─── "Hidden Gems" computation ─────────────────────────────────────────────────
// Albums with high play count relative to library average, inferred to be
// under-appreciated by looking at genre diversity and Spotify popularity (if available).

function computeHiddenGems(albums: NormalizedAlbum[], allTracks: NormalizedTrack[]): NormalizedAlbum[] {
  if (albums.length === 0) return [];

  // Build play count map per album
  const avgPlayCount =
    albums.reduce((sum, a) => sum + (a.totalPlayCount ?? 0), 0) / albums.length;

  // "Hidden gem" heuristic:
  // 1. Play count > 2x library average
  // 2. Not a compilation
  // 3. Not already in "loved" (we want hidden — below the radar)
  // 4. Genre variety: pick across different genres
  
  const trackMap = new Map(allTracks.map((t) => [t.id, t]));
  void trackMap;
  
  const candidates = albums
    .filter((a) => {
      const plays = a.totalPlayCount ?? 0;
      return plays >= avgPlayCount * 1.5 && !a.loved;
    })
    .sort((a, b) => (b.totalPlayCount ?? 0) - (a.totalPlayCount ?? 0));

  // Diversify by genre
  const seenGenres = new Set<string>();
  const gems: NormalizedAlbum[] = [];
  for (const album of candidates) {
    const genre = album.genre ?? "Unknown";
    if (!seenGenres.has(genre) || gems.length < 5) {
      gems.push(album);
      seenGenres.add(genre);
    }
    if (gems.length >= 10) break;
  }

  return gems;
}

// ─── Today's Pick (seeded by date so it's stable for 24h) ────────────────────

function getTodaysPick(albums: NormalizedAlbum[]): NormalizedAlbum | null {
  const loved = albums.filter((a) => a.loved || (a.rating ?? 0) >= 4);
  if (loved.length === 0) {
    const rated = albums.filter((a) => (a.rating ?? 0) >= 3);
    if (rated.length === 0) return null;
    const seed = Math.floor(Date.now() / 86_400_000); // day-stable
    return rated[seed % rated.length];
  }
  const seed = Math.floor(Date.now() / 86_400_000);
  return loved[seed % loved.length];
}

// ─── Genre distribution ───────────────────────────────────────────────────────

function computeGenreDistribution(tracks: NormalizedTrack[]): { genre: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const t of tracks) {
    const genre = t.genre ?? "Other";
    counts.set(genre, (counts.get(genre) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

// ─── Listening heatmap ────────────────────────────────────────────────────────

function computeHeatmap(tracks: NormalizedTrack[]): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const t of tracks) {
    const date = t.lastPlayed ?? t.playedAt;
    if (!date) continue;
    const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Merge stats ──────────────────────────────────────────────────────────────

function mergeStats(partials: Array<Partial<MusicStats>>): MusicStats {
  const merged: MusicStats = {
    totalTracks: 0,
    totalArtists: 0,
    totalAlbums: 0,
    totalGenres: 0,
  };
  for (const p of partials) {
    merged.totalTracks = Math.max(merged.totalTracks, p.totalTracks ?? 0);
    merged.totalArtists = Math.max(merged.totalArtists, p.totalArtists ?? 0);
    merged.totalAlbums = Math.max(merged.totalAlbums, p.totalAlbums ?? 0);
    merged.totalGenres = Math.max(merged.totalGenres, p.totalGenres ?? 0);
    merged.avgBpm ??= p.avgBpm;
    merged.totalPlayCount = (merged.totalPlayCount ?? 0) + (p.totalPlayCount ?? 0);
    merged.totalLovedTracks ??= p.totalLovedTracks;
    merged.totalRatedAlbums ??= p.totalRatedAlbums;
    merged.librarySizeBytes = (merged.librarySizeBytes ?? 0) + (p.librarySizeBytes ?? 0);
    if (p.oldestYear) merged.oldestYear = Math.min(merged.oldestYear ?? 9999, p.oldestYear);
    if (p.newestYear) merged.newestYear = Math.max(merged.newestYear ?? 0, p.newestYear);
    if (p.lastUpdated) {
      if (!merged.lastUpdated || new Date(p.lastUpdated) > new Date(merged.lastUpdated)) {
        merged.lastUpdated = p.lastUpdated;
      }
    }
  }
  return merged;
}

// ─── Main aggregate function ──────────────────────────────────────────────────

export async function aggregateMusicData(): Promise<{
  data: MusicData;
  providers: MusicSource[];
}> {
  // Run all providers in parallel; failures are isolated
  const results = await Promise.allSettled(
    PROVIDERS.filter((p) => !p.isAvailable || p.isAvailable()).map((p) =>
      p.fetchData().then((r) => ({ name: p.name, result: r }))
    )
  );

  const succeededProviders: MusicSource[] = [];
  const providerResults = results
    .filter((r): r is PromiseFulfilledResult<{ name: MusicSource; result: ReturnType<typeof PROVIDERS[0]["fetchData"]> extends Promise<infer T> ? T : never }> => {
      if (r.status === "rejected") {
        console.error("[Aggregator] Provider failed:", r.reason);
        return false;
      }
      return true;
    })
    .map((r) => {
      succeededProviders.push(r.value.name);
      return r.value.result;
    });

  // ── Collect all tracks and albums from all providers ──
  const allRawTracks = providerResults.flatMap((r) => r.allTracks ?? []);
  const allRawAlbums = providerResults.flatMap((r) => r.allAlbums ?? []);

  // ── Deduplicate tracks ──
  const deduplicatedTrackMap = new Map<string, NormalizedTrack>();
  for (const track of allRawTracks) {
    const key = trackKey(track);
    if (deduplicatedTrackMap.has(key)) {
      const existing = deduplicatedTrackMap.get(key)!;
      deduplicatedTrackMap.set(key, mergeTrack(existing, track));
    } else {
      deduplicatedTrackMap.set(key, track);
    }
  }
  const allTracks = Array.from(deduplicatedTrackMap.values());

  // ── Deduplicate albums ──
  const deduplicatedAlbumMap = new Map<string, NormalizedAlbum>();
  for (const album of allRawAlbums) {
    const key = albumKey(album);
    if (!deduplicatedAlbumMap.has(key)) {
      deduplicatedAlbumMap.set(key, album);
    }
  }
  const allAlbums = Array.from(deduplicatedAlbumMap.values());

  // ── Apple XML derived sections ──
  const onRepeat = [...allTracks]
    .filter((t) => (t.playCount ?? 0) > 0)
    .sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
    .slice(0, 30);

  const recentlyPlayed = [...allTracks]
    .filter((t) => t.lastPlayed || t.playedAt || (t.playCount ?? 0) > 0)
    .sort((a, b) => {
      const timeA = toEpoch(a.lastPlayed ?? a.playedAt);
      const timeB = toEpoch(b.lastPlayed ?? b.playedAt);
      if (timeB !== timeA) return timeB - timeA;
      return (b.playCount ?? 0) - (a.playCount ?? 0);
    })
    .slice(0, 20);

  const topTracksList = onRepeat.slice(0, 20);
  const topTracks = { short: topTracksList, medium: topTracksList, long: topTracksList };

  // Compute top artists directly from library tracks
  const artistCounts = new Map<string, { artist: string; playCount: number; genres: Set<string>; artwork?: string }>();
  for (const t of allTracks) {
    if (!t.artist || t.artist === "Unknown Artist") continue;
    const existing = artistCounts.get(t.artist) ?? { artist: t.artist, playCount: 0, genres: new Set<string>() };
    existing.playCount += (t.playCount ?? 1);
    if (t.genre) existing.genres.add(t.genre);
    if (!existing.artwork && t.artwork && t.artwork !== "/music/placeholder.png") {
      existing.artwork = t.artwork;
    }
    artistCounts.set(t.artist, existing);
  }

  const maxPlays = Math.max(1, Array.from(artistCounts.values()).sort((a, b) => b.playCount - a.playCount)[0]?.playCount ?? 1);
  const topArtistsList = Array.from(artistCounts.values())
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 20)
    .map((a, idx) => ({
      source: "appleXml" as const,
      id: `artist-${idx}`,
      name: a.artist,
      images: a.artwork ? [{ url: a.artwork, width: 300, height: 300 }] : [],
      genres: Array.from(a.genres).slice(0, 3),
      popularity: Math.min(100, Math.round((a.playCount / maxPlays) * 100)),
      url: `https://music.apple.com/us/search?term=${encodeURIComponent(a.artist)}`,
    }));

  const topArtists = { short: topArtistsList, medium: topArtistsList, long: topArtistsList };
  const nowPlaying = null;

  const lovedTracks = allTracks
    .filter((t) => t.loved)
    .sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
    .slice(0, 30);

  const highestRatedAlbums = [...allAlbums]
    .filter((a) => a.rating && a.rating >= 3)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.totalPlayCount ?? 0) - (a.totalPlayCount ?? 0))
    .slice(0, 20);

  const mostLovedAlbums = allAlbums
    .filter((a) => a.loved)
    .sort((a, b) => (b.totalPlayCount ?? 0) - (a.totalPlayCount ?? 0))
    .slice(0, 20);

  const recentlyAdded = [...allAlbums]
    .filter((a) => a.dateAdded)
    .sort((a, b) => toEpoch(b.dateAdded) - toEpoch(a.dateAdded))
    .slice(0, 20);

  const mostSkipped = [...allTracks]
    .filter((t) => (t.skipCount ?? 0) > 0)
    .sort((a, b) => (b.skipCount ?? 0) - (a.skipCount ?? 0))
    .slice(0, 15);

  const years = allAlbums.filter((a) => a.year).map((a) => a.year!);
  const oldestYear = years.length > 0 ? Math.min(...years) : undefined;
  const newestYear = years.length > 0 ? Math.max(...years) : undefined;

  const oldestAlbum = oldestYear
    ? allAlbums.filter((a) => a.year === oldestYear).sort((a, b) => (b.totalPlayCount ?? 0) - (a.totalPlayCount ?? 0))[0] ?? null
    : null;

  const newestAlbum = newestYear
    ? allAlbums.filter((a) => a.year === newestYear).sort((a, b) => (b.totalPlayCount ?? 0) - (a.totalPlayCount ?? 0))[0] ?? null
    : null;

  const hiddenGems = computeHiddenGems(allAlbums, allTracks);
  const todaysPick = getTodaysPick(allAlbums);

  // ── Computed cross-cutting data ──
  const genreDistribution = computeGenreDistribution(allTracks);
  const listeningHeatmap = computeHeatmap(allTracks);

  // ── Merge stats ──
  const statsPartials = providerResults.map((r) => r.stats ?? {});
  const stats = mergeStats(statsPartials);
  // Correct totals using deduplicated counts
  stats.totalTracks = allTracks.length;
  stats.totalAlbums = allAlbums.length;
  stats.totalArtists = new Set(allTracks.map((t) => normalizeKey(t.artist))).size;
  stats.totalGenres = genreDistribution.length;

  const data: MusicData = {
    nowPlaying,
    recentlyPlayed,
    topTracks,
    topArtists,
    onRepeat,
    lovedTracks,
    highestRatedAlbums,
    mostLovedAlbums,
    recentlyAdded,
    allAlbums,
    hiddenGems,
    mostSkipped,
    oldestAlbum,
    newestAlbum,
    todaysPick,
    genreDistribution,
    listeningHeatmap,
    stats,
  };

  return { data, providers: succeededProviders };
}
