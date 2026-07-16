// ─── Apple XML Provider ───────────────────────────────────────────────────────
// Reads the Apple Music library.xml export and normalizes it to shared types.
// Enriches artwork using Spotify Search (client credentials) + MusicBrainz.
//
// Data source: public/music/library.xml (or APPLE_XML_PATH env override)
// Parsed/enriched cache: public/music/library-parsed.json

import fs from "fs";
import path from "path";
import type { MusicProvider } from "./provider";
import type { ProviderResult, NormalizedTrack, NormalizedAlbum } from "../types";
import { parseAppleLibraryXml, type RawAppleTrack } from "../xmlParser";
import { resolveArtwork } from "../artworkResolver";

// ─── Paths ────────────────────────────────────────────────────────────────────

function getXmlPath(): string {
  return (
    process.env.APPLE_XML_PATH ??
    path.join(process.cwd(), "public", "music", "library.xml")
  );
}

function getParsedCachePath(): string {
  return path.join(process.cwd(), "public", "music", "library-parsed.json");
}

// ─── Parsed cache ─────────────────────────────────────────────────────────────

interface ParsedLibraryCache {
  parsedAt: string;
  xmlModifiedAt: string;
  tracks: NormalizedTrack[];
  albums: NormalizedAlbum[];
}

function loadParsedCache(): ParsedLibraryCache | null {
  try {
    const cachePath = getParsedCachePath();
    if (!fs.existsSync(cachePath)) return null;
    const raw = JSON.parse(fs.readFileSync(cachePath, "utf-8")) as ParsedLibraryCache;
    // Hydrate string dates back to Date objects
    for (const t of raw.tracks) {
      if (t.lastPlayed) t.lastPlayed = new Date(t.lastPlayed);
      if (t.playedAt) t.playedAt = new Date(t.playedAt);
      if (t.dateAdded) t.dateAdded = new Date(t.dateAdded);
    }
    for (const a of raw.albums) {
      if (a.dateAdded) a.dateAdded = new Date(a.dateAdded);
    }
    return raw;
  } catch {
    return null;
  }
}

function saveParsedCache(data: ParsedLibraryCache): void {
  try {
    const cachePath = getParsedCachePath();
    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("[AppleXml] Failed to save parsed cache:", e);
  }
}

// ─── Normalization ────────────────────────────────────────────────────────────

function makeTrackKey(artist: string, album: string): string {
  return `${artist.toLowerCase().trim()}:::${album.toLowerCase().trim()}`;
}

function normalizeRating(raw: number | undefined): number | undefined {
  if (raw === undefined) return undefined;
  // Apple stores rating as 0–100 in increments of 20; we already convert in parseTrack
  // but it comes in as 0–5 here
  return Math.min(5, Math.max(0, raw));
}

function buildNormalizedTracks(
  rawTracks: RawAppleTrack[],
  artworkMap: Map<string, { artworkUrl: string; artistImageUrl?: string }>
): NormalizedTrack[] {
  return rawTracks
    .filter((t) => !t.hasVideo && t.name) // skip videos/podcasts
    .map((t): NormalizedTrack => {
      const artist = t.artist ?? t.albumArtist ?? "Unknown Artist";
      const album = t.album ?? "Unknown Album";
      const key = makeTrackKey(artist, album);
      const artwork = artworkMap.get(key)?.artworkUrl ?? "/music/placeholder.png";

      return {
        source: "appleXml",
        id: `apple-${t.trackId}`,
        title: t.name,
        artist,
        albumArtist: t.albumArtist,
        album,
        artwork,
        duration: t.duration,
        playCount: t.playCount,
        lastPlayed: t.playDate,
        dateAdded: t.dateAdded,
        rating: normalizeRating(t.rating),
        loved: t.loved ?? false,
        genre: t.genre,
        bpm: t.bpm,
        year: t.year,
        composer: t.composer,
        skipCount: t.skipCount,
        explicit: t.explicit,
        compilation: t.compilation,
      };
    });
}

function buildNormalizedAlbums(
  rawTracks: RawAppleTrack[],
  normalizedTracks: NormalizedTrack[],
  artworkMap: Map<string, { artworkUrl: string; artistImageUrl?: string }>
): NormalizedAlbum[] {
  // Group tracks by artist+album
  const albumMap = new Map<string, RawAppleTrack[]>();
  for (const t of rawTracks) {
    if (t.hasVideo || !t.album) continue;
    const artist = t.albumArtist ?? t.artist ?? "Unknown";
    const key = makeTrackKey(artist, t.album);
    if (!albumMap.has(key)) albumMap.set(key, []);
    albumMap.get(key)!.push(t);
  }

  const albums: NormalizedAlbum[] = [];
  for (const [key, tracks] of albumMap.entries()) {
    const first = tracks[0];
    const artist = first.albumArtist ?? first.artist ?? "Unknown Artist";
    const albumName = first.album!;
    const artwork = artworkMap.get(key)?.artworkUrl ?? "/music/placeholder.png";

    // Album rating: prefer explicit album rating, else max of track ratings
    const explicitAlbumRating = first.albumRating;
    const trackRatings = tracks.map((t) => t.rating ?? 0).filter((r) => r > 0);
    const derivedRating =
      trackRatings.length > 0
        ? Math.round(trackRatings.reduce((a, b) => a + b, 0) / trackRatings.length)
        : undefined;

    const albumRating = normalizeRating(explicitAlbumRating ?? derivedRating);
    const albumLoved = first.albumLoved ?? tracks.some((t) => t.loved);
    const totalPlayCount = tracks.reduce((sum, t) => sum + (t.playCount ?? 0), 0);

    const albumTrackIds = new Set(tracks.map((t) => `apple-${t.trackId}`));
    const albumTracks = normalizedTracks.filter((t) => albumTrackIds.has(t.id));

    albums.push({
      source: "appleXml",
      id: `apple-album-${key}`,
      title: albumName,
      artist,
      artwork,
      year: first.year,
      genre: first.genre,
      trackCount: tracks.length,
      rating: albumRating,
      loved: albumLoved,
      dateAdded: first.dateAdded,
      totalPlayCount,
      tracks: albumTracks,
    });
  }

  return albums;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class AppleXmlProvider implements MusicProvider {
  readonly name = "appleXml" as const;

  isAvailable(): boolean {
    return fs.existsSync(getXmlPath());
  }

  async fetchData(): Promise<ProviderResult> {
    const xmlPath = getXmlPath();
    if (!fs.existsSync(xmlPath)) {
      console.warn("[AppleXml] library.xml not found at:", xmlPath);
      return {};
    }

    // Check if the parsed cache is still fresh (based on xml file mtime)
    const xmlStat = fs.statSync(xmlPath);
    const xmlModifiedAt = xmlStat.mtime.toISOString();
    const cached = loadParsedCache();

    if (cached && cached.xmlModifiedAt === xmlModifiedAt) {
      // Re-hydrate dates (JSON stringify loses Date objects)
      const tracks = hydrateTracks(cached.tracks);
      const albums = hydrateAlbums(cached.albums);
      return buildResult(tracks, albums, xmlModifiedAt);
    }

    // Parse fresh
    console.info("[AppleXml] Parsing library.xml...");
    const xmlContent = fs.readFileSync(xmlPath, "utf-8");
    const library = parseAppleLibraryXml(xmlContent);
    const rawTracks = library.tracks;

    console.info(`[AppleXml] Found ${rawTracks.length} tracks. Resolving artwork...`);

    // Build unique artist+album pairs and score them by importance so we only resolve top albums
    const artworkItems = new Map<string, { album: string; artist: string; key: string; score: number }>();
    for (const t of rawTracks) {
      if (t.hasVideo || !t.album) continue;
      const artist = t.albumArtist ?? t.artist ?? "Unknown";
      const key = makeTrackKey(artist, t.album);
      const trackScore = (t.playCount ?? 0) * 10 + (t.loved ? 500 : 0) + (t.rating ?? 0) * 50 + (t.skipCount ?? 0) * 5;
      const existing = artworkItems.get(key);
      if (!existing) {
        artworkItems.set(key, { album: t.album, artist, key, score: trackScore });
      } else {
        existing.score += trackScore;
      }
    }

    // Sort by importance and resolve top ~150 albums synchronously with fast race
    const prioritizedItems = Array.from(artworkItems.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 150);

    const artworkMap = await resolveArtwork(prioritizedItems);
    const normalizedTracks = buildNormalizedTracks(rawTracks, artworkMap);
    const normalizedAlbums = buildNormalizedAlbums(rawTracks, normalizedTracks, artworkMap);

    // Save enriched cache
    saveParsedCache({
      parsedAt: new Date().toISOString(),
      xmlModifiedAt,
      tracks: normalizedTracks,
      albums: normalizedAlbums,
    });

    return buildResult(normalizedTracks, normalizedAlbums, xmlModifiedAt);
  }
}

// ─── Build ProviderResult from normalized data ────────────────────────────────

function buildResult(tracks: NormalizedTrack[], albums: NormalizedAlbum[], lastUpdated?: string): ProviderResult {
  // Stats
  const artists = new Set(tracks.map((t) => t.artist));
  const genres = new Set(tracks.map((t) => t.genre).filter(Boolean));
  const bpmValues = tracks.map((t) => t.bpm).filter((b): b is number => !!b);
  const totalPlayCount = tracks.reduce((sum, t) => sum + (t.playCount ?? 0), 0);
  const years = tracks.map((t) => t.year).filter((y): y is number => !!y);

  return {
    allTracks: tracks,
    allAlbums: albums,
    stats: {
      totalTracks: tracks.length,
      totalArtists: artists.size,
      totalAlbums: albums.length,
      totalGenres: genres.size,
      avgBpm: bpmValues.length > 0 ? Math.round(bpmValues.reduce((a, b) => a + b) / bpmValues.length) : undefined,
      totalPlayCount,
      totalLovedTracks: tracks.filter((t) => t.loved).length,
      totalRatedAlbums: albums.filter((a) => a.rating && a.rating > 0).length,
      oldestYear: years.length > 0 ? Math.min(...years) : undefined,
      newestYear: years.length > 0 ? Math.max(...years) : undefined,
      lastUpdated,
    },
  };
}

// ─── Date hydration (JSON parse loses Date instances) ─────────────────────────

function hydrateTracks(tracks: NormalizedTrack[]): NormalizedTrack[] {
  return tracks.map((t) => ({
    ...t,
    playedAt: t.playedAt ? new Date(t.playedAt) : undefined,
    lastPlayed: t.lastPlayed ? new Date(t.lastPlayed) : undefined,
    dateAdded: t.dateAdded ? new Date(t.dateAdded) : undefined,
  }));
}

function hydrateAlbums(albums: NormalizedAlbum[]): NormalizedAlbum[] {
  return albums.map((a) => ({
    ...a,
    dateAdded: a.dateAdded ? new Date(a.dateAdded) : undefined,
    tracks: a.tracks ? hydrateTracks(a.tracks) : undefined,
  }));
}
