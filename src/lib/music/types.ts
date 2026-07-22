// ─── Shared Music Dashboard Types ─────────────────────────────────────────────
// All data flowing through the music dashboard uses these normalized interfaces.
// Every provider (Spotify, Apple XML, future providers) must map to these types.

export type MusicSource = "spotify" | "appleXml";

// ─── Core Entities ─────────────────────────────────────────────────────────────

export interface NormalizedTrack {
  source: MusicSource;
  id: string;
  title: string;
  artist: string;
  albumArtist?: string;
  album?: string;
  artwork: string; // resolved absolute URL
  duration?: number; // milliseconds
  // Spotify
  playedAt?: Date; // recently-played timestamp from Spotify
  popularity?: number; // 0–100 Spotify popularity score
  explicit?: boolean;
  // Apple XML
  playCount?: number;
  lastPlayed?: Date;
  dateAdded?: Date;
  rating?: number; // 1–5 stars (converted from Apple's 0–100)
  loved?: boolean;
  genre?: string;
  bpm?: number;
  year?: number;
  composer?: string;
  skipCount?: number;
  compilation?: boolean;
  // Computed indexes for On Repeat analysis
  frequencyIndex?: number; // 0–100 score relative to max library plays
  recencyIndex?: number;   // 0–100 exponential decay score based on last played timestamp
  repeatScore?: number;    // combined weighted score for active On Repeat mode
}

export interface NormalizedArtist {
  source: MusicSource;
  id: string;
  name: string;
  image?: string; // resolved URL
  genres?: string[];
  popularity?: number; // Spotify
  // computed from library
  trackCount?: number;
  totalPlayCount?: number;
  albums?: string[]; // album names
}

export interface NormalizedAlbum {
  source: MusicSource;
  id: string;
  title: string;
  artist: string;
  artwork: string;
  year?: number;
  genre?: string;
  trackCount?: number;
  // Apple XML
  rating?: number; // 1–5
  loved?: boolean;
  dateAdded?: Date;
  totalPlayCount?: number;
  tracks?: NormalizedTrack[]; // full track list when available
}

// ─── Now Playing ──────────────────────────────────────────────────────────────

export interface NowPlayingTrack {
  isPlaying: boolean;
  track: NormalizedTrack | null;
  progressMs?: number;
  durationMs?: number;
}

// ─── Top Items (Spotify) ───────────────────────────────────────────────────────

export type TimeRange = "short" | "medium" | "long";

export interface TopItems<T> {
  short: T[];  // ~4 weeks
  medium: T[]; // ~6 months
  long: T[];   // all time
}

// ─── Aggregated Music Stats ────────────────────────────────────────────────────

export interface MusicStats {
  totalTracks: number;
  totalArtists: number;
  totalAlbums: number;
  totalGenres: number;
  avgBpm?: number;
  totalPlayCount?: number;
  totalTimeListenedMs?: number; // cumulative listening duration (playCount * duration)
  totalDurationMs?: number;     // sum of track durations across unique library tracks
  totalLovedTracks?: number;
  totalRatedAlbums?: number;
  librarySizeBytes?: number;
  oldestYear?: number;
  newestYear?: number;
  lastUpdated?: string; // ISO date string of latest library update/export
}

// ─── Provider Result ──────────────────────────────────────────────────────────

export interface ProviderResult {
  nowPlaying?: NowPlayingTrack | null;
  recentlyPlayed?: NormalizedTrack[];
  topTracks?: TopItems<NormalizedTrack>;
  topArtists?: TopItems<NormalizedArtist>;
  allTracks?: NormalizedTrack[];
  allAlbums?: NormalizedAlbum[];
  stats?: Partial<MusicStats>;
}

// ─── Aggregated Data (what the API returns) ────────────────────────────────────

export interface MusicData {
  // Live Spotify data
  nowPlaying: NowPlayingTrack | null;
  recentlyPlayed: NormalizedTrack[];
  topTracks: TopItems<NormalizedTrack>;
  topArtists: TopItems<NormalizedArtist>;

  // Apple XML derived
  onRepeat: NormalizedTrack[];        // sorted by playCount desc (default / all time)
  onRepeatAllTime: NormalizedTrack[]; // all-time frequency index sorted
  onRepeatRecent: NormalizedTrack[];  // recent recency & frequency index weighted
  lovedTracks: NormalizedTrack[];     // loved = true
  highestRatedAlbums: NormalizedAlbum[];
  mostLovedAlbums: NormalizedAlbum[];
  recentlyAdded: NormalizedAlbum[];   // by dateAdded desc
  allAlbums: NormalizedAlbum[];       // for Album Wall
  hiddenGems: NormalizedAlbum[];      // high playCount, not mainstream
  mostSkipped: NormalizedTrack[];     // sorted by skipCount desc
  oldestAlbum: NormalizedAlbum | null;
  newestAlbum: NormalizedAlbum | null;
  todaysPick: NormalizedAlbum | null; // random loved/5-star, seeded by date

  // Combined
  genreDistribution: { genre: string; count: number }[];
  listeningHeatmap: { date: string; count: number }[];
  stats: MusicStats;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface MusicApiResponse {
  data: MusicData;
  cachedAt: string; // ISO date
  providers: MusicSource[]; // which providers succeeded
}
