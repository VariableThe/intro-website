// ─── Provider Interface ────────────────────────────────────────────────────────
// Every music data provider implements this interface.
// Adding a new provider (Tidal, YouTube Music, Apple API) only requires
// implementing this interface — the aggregator needs zero changes.

import type { ProviderResult, MusicSource } from "../types";

export interface MusicProvider {
  /** Stable identifier for this provider */
  readonly name: MusicSource;

  /**
   * Fetch all data this provider can supply.
   * Should never throw — return partial results on error.
   */
  fetchData(): Promise<ProviderResult>;

  /**
   * Optional health check — returns false if the provider is misconfigured
   * (e.g. missing env vars) so the aggregator can skip it gracefully.
   */
  isAvailable?(): boolean;
}
