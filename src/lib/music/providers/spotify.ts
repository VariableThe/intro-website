import fs from "fs";
import path from "path";
import type { MusicProvider } from "./provider";
import type { ProviderResult, NormalizedTrack, NormalizedAlbum, MusicStats } from "../types";

interface SpotifyStream {
  endTime: string;
  artistName: string;
  trackName: string;
  msPlayed: number;
}

interface SpotifyLibraryTrack {
  artist: string;
  album: string;
  track: string;
  uri: string;
}

interface SpotifyLibraryAlbum {
  artist: string;
  album: string;
  uri: string;
}

interface SpotifyPlaylistItem {
  track: {
    trackName: string;
    artistName: string;
    albumName: string;
    trackUri: string;
  };
  addedDate: string;
}

interface SpotifyPlaylist {
  name: string;
  items: SpotifyPlaylistItem[];
}

interface SpotifyCache {
  cachedAt: string;
  mtimes: Record<string, string>;
  tracks: NormalizedTrack[];
  albums: NormalizedAlbum[];
  stats: Partial<MusicStats>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function trackKey(artist: string, track: string): string {
  return `${normalizeKey(artist)}::${normalizeKey(track)}`;
}

function albumKey(artist: string, album: string): string {
  return `${normalizeKey(artist)}::${normalizeKey(album)}`;
}

// ─── Paths ─────────────────────────────────────────────────────────────────────

const DATA_DIR = "spotify";

function getDataPath(): string {
  return path.join(process.cwd(), "public", "music", DATA_DIR);
}

function getCachePath(): string {
  return path.join(process.cwd(), "public", "music", "spotify-cache.json");
}

const STREAMING_FILE = "StreamingHistory_music_0.json";

// ─── Provider ──────────────────────────────────────────────────────────────────

export class SpotifyProvider implements MusicProvider {
  readonly name = "spotify" as const;

  isAvailable(): boolean {
    return fs.existsSync(path.join(getDataPath(), STREAMING_FILE));
  }

  async fetchData(): Promise<ProviderResult> {
    const dataPath = getDataPath();
    const streamingPath = path.join(dataPath, STREAMING_FILE);

    const cachePath = getCachePath();
    const currentMtimes = this.collectMtimes(dataPath);
    const cached = this.loadCache(cachePath, currentMtimes);
    if (cached) {
      return this.buildProviderResult(cached);
    }

    return this.parseFresh(dataPath, streamingPath, cachePath, currentMtimes);
  }

  // ── File helpers ────────────────────────────────────────────────────────────

  private readJson<T>(dataPath: string, filename: string): T | null {
    const filePath = path.join(dataPath, filename);
    try {
      if (!fs.existsSync(filePath)) return null;
      return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
    } catch {
      return null;
    }
  }

  private collectMtimes(dataPath: string): Record<string, string> {
    const files = [
      STREAMING_FILE,
      "YourLibrary.json",
      "Playlist1.json",
      "YourSoundCapsule.json",
    ];
    const mtimes: Record<string, string> = {};
    for (const file of files) {
      try {
        const stat = fs.statSync(path.join(dataPath, file));
        mtimes[file] = stat.mtime.toISOString();
      } catch {
        // file is optional
      }
    }
    return mtimes;
  }

  // ── Cache ───────────────────────────────────────────────────────────────────

  private loadCache(
    cachePath: string,
    currentMtimes: Record<string, string>
  ): SpotifyCache | null {
    try {
      if (!fs.existsSync(cachePath)) return null;
      const raw = JSON.parse(fs.readFileSync(cachePath, "utf-8")) as SpotifyCache;

      for (const [file, mtime] of Object.entries(currentMtimes)) {
        if (raw.mtimes[file] !== mtime) return null;
      }

      this.hydrateTrackDates(raw.tracks);
      this.hydrateAlbumDates(raw.albums);

      return raw;
    } catch {
      return null;
    }
  }

  private saveCache(cachePath: string, data: SpotifyCache): void {
    try {
      const dir = path.dirname(cachePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.warn("[Spotify] Cache save failed:", e);
    }
  }

  private hydrateTrackDates(tracks: NormalizedTrack[]): void {
    for (const t of tracks) {
      if (t.lastPlayed) t.lastPlayed = new Date(t.lastPlayed);
      if (t.playedAt) t.playedAt = new Date(t.playedAt);
      if (t.dateAdded) t.dateAdded = new Date(t.dateAdded);
    }
  }

  private hydrateAlbumDates(albums: NormalizedAlbum[]): void {
    for (const a of albums) {
      if (a.dateAdded) a.dateAdded = new Date(a.dateAdded);
      if (a.tracks) this.hydrateTrackDates(a.tracks);
    }
  }

  // ── Fresh parse ─────────────────────────────────────────────────────────────

  private async parseFresh(
    dataPath: string,
    streamingPath: string,
    cachePath: string,
    currentMtimes: Record<string, string>
  ): Promise<ProviderResult> {
    console.info("[Spotify] Parsing streaming history...");

    const rawStreams: SpotifyStream[] = JSON.parse(
      fs.readFileSync(streamingPath, "utf-8")
    );

    const yourLibrary = this.readJson<{
      tracks?: SpotifyLibraryTrack[];
      albums?: SpotifyLibraryAlbum[];
    }>(dataPath, "YourLibrary.json");

    const playlists = this.readJson<{ playlists: SpotifyPlaylist[] }>(
      dataPath,
      "Playlist1.json"
    );

    // ── Build lookup maps ─────────────────────────────────────────────────────

    const albumLookup = new Map<string, string>();
    const lovedSet = new Set<string>();
    const savedAlbums = new Map<string, NormalizedAlbum>();

    if (yourLibrary?.tracks) {
      for (const t of yourLibrary.tracks) {
        const key = trackKey(t.artist, t.track);
        albumLookup.set(key, t.album);
        lovedSet.add(key);
      }
    }

    if (yourLibrary?.albums) {
      for (const a of yourLibrary.albums) {
        const key = albumKey(a.artist, a.album);
        savedAlbums.set(key, {
          source: "spotify",
          id: `spotify-album-${key}`,
          title: a.album,
          artist: a.artist,
          artwork: "/music/placeholder.png",
          totalPlayCount: 0,
          trackCount: 0,
        });
      }
    }

    if (playlists?.playlists) {
      for (const pl of playlists.playlists) {
        const isLiked =
          pl.name === "Liked songs from spotify" ||
          pl.name.toLowerCase().includes("liked");
        for (const item of pl.items) {
          if (!item.track) continue;
          const key = trackKey(item.track.artistName, item.track.trackName);
          albumLookup.set(key, item.track.albumName);
          if (isLiked) lovedSet.add(key);
        }
      }
    }

    // ── Group streams and build tracks ────────────────────────────────────────

    const streamGroups = new Map<string, SpotifyStream[]>();
    for (const s of rawStreams) {
      const key = trackKey(s.artistName, s.trackName);
      let group = streamGroups.get(key);
      if (!group) {
        group = [];
        streamGroups.set(key, group);
      }
      group.push(s);
    }

    const trackMap = new Map<string, NormalizedTrack>();

    for (const [key, streams] of streamGroups) {
      const playCount = streams.length;
      const maxMsPlayed = Math.max(...streams.map((s) => s.msPlayed));
      const lastEndTime = streams.reduce((latest, s) =>
        s.endTime > latest ? s.endTime : latest,
        ""
      );

      const track: NormalizedTrack = {
        source: "spotify",
        id: `spotify-${key}`,
        title: streams[0].trackName,
        artist: streams[0].artistName,
        album: albumLookup.get(key) || undefined,
        artwork: "/music/placeholder.png",
        duration: maxMsPlayed,
        playCount,
        lastPlayed: new Date(lastEndTime),
        playedAt: new Date(lastEndTime),
        loved: lovedSet.has(key),
      };

      trackMap.set(key, track);
    }

    const allTracks = Array.from(trackMap.values());

    // ── Build albums from cross-ref data ──────────────────────────────────────

    const albumMap = new Map<string, NormalizedAlbum>();

    // Start with saved library albums
    for (const [key, album] of savedAlbums) {
      albumMap.set(key, { ...album, tracks: [] });
    }

    // Merge in track-derived albums
    for (const [, track] of trackMap) {
      if (!track.album) continue;
      const aKey = albumKey(track.artist, track.album);
      let album = albumMap.get(aKey);
      if (!album) {
        album = {
          source: "spotify",
          id: `spotify-album-${aKey}`,
          title: track.album,
          artist: track.artist,
          artwork: "/music/placeholder.png",
          totalPlayCount: 0,
          trackCount: 0,
          tracks: [],
        };
        albumMap.set(aKey, album);
      }
      album.totalPlayCount = (album.totalPlayCount ?? 0) + (track.playCount ?? 0);
      album.trackCount = (album.trackCount ?? 0) + 1;
      album.tracks!.push(track);
    }

    const allAlbums = Array.from(albumMap.values());

    // ── Stats ─────────────────────────────────────────────────────────────────

    const totalPlayCount = allTracks.reduce(
      (sum, t) => sum + (t.playCount ?? 0),
      0
    );
    const totalTimeListenedMs = rawStreams.reduce(
      (sum, s) => sum + s.msPlayed,
      0
    );
    const totalDurationMs = allTracks.reduce(
      (sum, t) => sum + (t.duration ?? 0),
      0
    );
    const uniqueArtists = new Set(
      allTracks.map((t) => normalizeKey(t.artist))
    );
    const lastEndTime = rawStreams.reduce((latest, s) =>
      s.endTime > latest ? s.endTime : latest,
      ""
    );

    const stats: Partial<MusicStats> = {
      totalTracks: allTracks.length,
      totalArtists: uniqueArtists.size,
      totalAlbums: allAlbums.length,
      totalPlayCount,
      totalTimeListenedMs,
      totalDurationMs,
      lastUpdated: lastEndTime ? new Date(lastEndTime).toISOString() : undefined,
    };

    // ── Build result & cache ──────────────────────────────────────────────────

    const result: ProviderResult = { allTracks, allAlbums, stats };

    this.saveCache(cachePath, {
      cachedAt: new Date().toISOString(),
      mtimes: currentMtimes,
      tracks: allTracks,
      albums: allAlbums,
      stats,
    });

    return result;
  }

  // ── Build from cache ────────────────────────────────────────────────────────

  private buildProviderResult(cache: SpotifyCache): ProviderResult {
    return { allTracks: cache.tracks, allAlbums: cache.albums, stats: cache.stats };
  }
}
