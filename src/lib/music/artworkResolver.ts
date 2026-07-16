// ─── Artwork Resolver ─────────────────────────────────────────────────────────
// Resolves artwork URLs for Apple XML tracks/albums using:
//   1. Spotify Search API (Client Credentials — no user auth)
//   2. MusicBrainz + Cover Art Archive (fallback)
//
// Results are cached to public/music/artwork-cache.json for persistence.

import fs from "fs";
import path from "path";

// ─── Cache file location ──────────────────────────────────────────────────────

const CACHE_PATH = path.join(process.cwd(), "public", "music", "artwork-cache.json");

interface ArtworkCacheEntry {
  url: string;
  artistUrl?: string;
  resolvedAt: string;
}

type ArtworkCache = Record<string, ArtworkCacheEntry>;

function loadCache(): ArtworkCache {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    }
  } catch {
    // ignore corrupt cache
  }
  return {};
}

function saveCache(cache: ArtworkCache): void {
  try {
    const dir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.error("[ArtworkResolver] Failed to save cache:", e);
  }
}

// ─── iTunes / Apple Music Catalog Search (Free, No Keys Required) ────────────

function cleanQueryString(str: string): string {
  return str
    .replace(/\[.*?\]/g, "")           // remove [Remastered], [Bonus Tracks]
    .replace(/\(.*?(remaster|deluxe|anniversary|bonus|single|version|feat|ft|expanded|special).*?\)/gi, "") // remove (Deluxe Edition), (2011 Remastered)
    .replace(/\s+/g, " ")
    .trim();
}

function getPrimaryArtist(str: string): string {
  return str.split(/\s*(\/|&|feat\.|ft\.|and)\s*/i)[0].trim();
}

async function resolveViaITunesSearch(
  album: string,
  artist: string
): Promise<{ artworkUrl?: string; artistImageUrl?: string }> {
  try {
    const cleanAlbum = cleanQueryString(album);
    const cleanArtist = getPrimaryArtist(artist);

    // Try exact or primary artist + cleaned album first
    let q = encodeURIComponent(`${cleanArtist} ${cleanAlbum}`);
    let res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=album&limit=3`);
    if (!res.ok) return {};
    let data = await res.json();
    let first = data?.results?.[0];

    // If 0 results, try searching just the cleaned album title and matching artist name
    if (!first?.artworkUrl100 && cleanAlbum.length > 3) {
      q = encodeURIComponent(cleanAlbum);
      res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=album&limit=5`);
      if (res.ok) {
        data = await res.json();
        first = data?.results?.find((r: any) =>
          r.artistName?.toLowerCase().includes(cleanArtist.toLowerCase()) ||
          cleanArtist.toLowerCase().includes(r.artistName?.toLowerCase() ?? "---")
        ) ?? data?.results?.[0];
      }
    }

    if (!first?.artworkUrl100) return {};

    // iTunes returns artworkUrl100 (100x100). Replace string with 600x600bb.jpg for crisp high-res cover
    const highResUrl = first.artworkUrl100.replace(/100x100bb\.jpg$/i, "600x600bb.jpg");
    return { artworkUrl: highResUrl };
  } catch {
    return {};
  }
}

// ─── Deezer Search Fallback (Free, Huge Catalog, No API Keys) ─────────────────

async function resolveViaDeezerSearch(
  album: string,
  artist: string
): Promise<string | undefined> {
  try {
    const cleanAlbum = cleanQueryString(album);
    const cleanArtist = getPrimaryArtist(artist);
    let q = encodeURIComponent(`artist:"${cleanArtist}" album:"${cleanAlbum}"`);
    let res = await fetch(`https://api.deezer.com/search?q=${q}&limit=3`);
    if (!res.ok) return undefined;
    let data = await res.json();
    let match = data?.data?.[0];

    if (!match?.album?.cover_xl && cleanAlbum.length > 3) {
      q = encodeURIComponent(`${cleanArtist} ${cleanAlbum}`);
      res = await fetch(`https://api.deezer.com/search?q=${q}&limit=5`);
      if (res.ok) {
        data = await res.json();
        match = data?.data?.find((r: any) =>
          r.artist?.name?.toLowerCase().includes(cleanArtist.toLowerCase()) ||
          cleanArtist.toLowerCase().includes(r.artist?.name?.toLowerCase() ?? "---")
        ) ?? data?.data?.[0];
      }
    }

    if (match?.album?.cover_xl) return match.album.cover_xl;
    if (match?.album?.cover_big) return match.album.cover_big;
  } catch {
    // Deezer fallback best-effort
  }
  return undefined;
}

// ─── MusicBrainz + Cover Art Archive fallback ─────────────────────────────────

async function resolveViaMusicBrainz(
  album: string,
  artist: string
): Promise<string | undefined> {
  try {
    const cleanAlbum = cleanQueryString(album);
    const cleanArtist = getPrimaryArtist(artist);
    const q = encodeURIComponent(`release:"${cleanAlbum}" AND artist:"${cleanArtist}"`);
    const mbRes = await fetch(
      `https://musicbrainz.org/ws/2/release/?query=${q}&limit=1&fmt=json`,
      {
        headers: {
          "User-Agent": "intro-website/1.0 (adityasharma.variable@gmail.com)",
          Accept: "application/json",
        },
      }
    );
    if (!mbRes.ok) return undefined;
    const mbData = await mbRes.json();
    const releaseId = mbData?.releases?.[0]?.id;
    if (!releaseId) return undefined;

    const caaRes = await fetch(
      `https://coverartarchive.org/release/${releaseId}/front-250`,
      { redirect: "follow" }
    );
    if (caaRes.ok) return caaRes.url;
  } catch {
    // MusicBrainz is best-effort
  }
  return undefined;
}

// ─── Sleep helper for rate limiting ───────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Main resolver ─────────────────────────────────────────────────────────────

export interface ArtworkResult {
  artworkUrl: string;
  artistImageUrl?: string;
}

const PLACEHOLDER = "/music/placeholder.png";

/**
 * Resolves artwork for a list of album/artist pairs.
 * Uses cached results first, then fetches missing ones via iTunes Catalog + MusicBrainz.
 * Saves updated cache to disk after processing.
 */
export async function resolveArtwork(
  items: Array<{ album: string; artist: string; key: string }>
): Promise<Map<string, ArtworkResult>> {
  const cache = loadCache();
  const results = new Map<string, ArtworkResult>();
  const missing: typeof items = [];

  // Check cache
  for (const item of items) {
    if (cache[item.key]) {
      results.set(item.key, {
        artworkUrl: cache[item.key].url,
        artistImageUrl: cache[item.key].artistUrl,
      });
    } else {
      missing.push(item);
    }
  }

  if (missing.length === 0) return results;

  let cacheUpdated = false;
  const toResolve = missing.slice(0, 150); // Up to 150 items with parallel chunks and race

  // Process in parallel batches of 6 with a strict 3.5s global timeout wrapper
  const resolveBatches = async () => {
    for (let i = 0; i < toResolve.length; i += 6) {
      const batch = toResolve.slice(i, i + 6);
      await Promise.all(
        batch.map(async ({ album, artist, key }) => {
          let artworkUrl: string = PLACEHOLDER;
          let artistImageUrl: string | undefined;

          try {
            const itunesResult = await resolveViaITunesSearch(album, artist);
            if (itunesResult.artworkUrl) {
              artworkUrl = itunesResult.artworkUrl;
              artistImageUrl = itunesResult.artistImageUrl;
            }

            if (artworkUrl === PLACEHOLDER) {
              const deezerUrl = await resolveViaDeezerSearch(album, artist);
              if (deezerUrl) {
                artworkUrl = deezerUrl;
              } else {
                const mbUrl = await resolveViaMusicBrainz(album, artist);
                if (mbUrl) artworkUrl = mbUrl;
              }
            }
          } catch (e) {
            console.warn(`[ArtworkResolver] Failed for "${album}" by "${artist}":`, e);
          }

          results.set(key, { artworkUrl, artistImageUrl });
          cache[key] = { url: artworkUrl, artistUrl: artistImageUrl, resolvedAt: new Date().toISOString() };
          cacheUpdated = true;
        })
      );
    }
  };

  await Promise.race([
    resolveBatches(),
    new Promise((resolve) => setTimeout(resolve, 3500)),
  ]);

  if (cacheUpdated) saveCache(cache);
  return results;
}

/**
 * Convenience: resolve a single album's artwork.
 */
export async function resolveSingleArtwork(
  album: string,
  artist: string
): Promise<ArtworkResult> {
  const key = `${artist}:::${album}`.toLowerCase();
  const map = await resolveArtwork([{ album, artist, key }]);
  return map.get(key) ?? { artworkUrl: PLACEHOLDER };
}
