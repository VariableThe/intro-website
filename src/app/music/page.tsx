import { aggregateMusicData } from "@/lib/music/aggregator";
import type { MusicApiResponse } from "@/lib/music/types";
import { MusicDashboard } from "./components/MusicDashboard";

export const revalidate = 1200; // 20 minutes ISR

async function getMusicData(): Promise<MusicApiResponse | null> {
  try {
    const { data, providers } = await aggregateMusicData();
    return JSON.parse(JSON.stringify({
      data,
      cachedAt: new Date().toISOString(),
      providers,
    }));
  } catch (e) {
    console.error("[music/page] Failed to aggregate music data:", e);
    return null;
  }
}

export default async function MusicPage() {
  const response = await getMusicData();
  return <MusicDashboard response={response} />;
}
