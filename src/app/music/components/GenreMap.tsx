"use client";

import { BarChart3 } from "lucide-react";

interface Props {
  distribution: { genre: string; count: number }[];
}

export function GenreMap({ distribution }: Props) {
  if (!distribution || distribution.length === 0) return null;

  const topGenres = distribution.slice(0, 10);
  const maxCount = Math.max(...topGenres.map((g) => g.count), 1);
  const totalCount = topGenres.reduce((sum, g) => sum + g.count, 0);

  return (
    <div className="bg-card/40 border border-border p-6 md:p-8 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="font-mono text-xs uppercase tracking-widest text-foreground/50">
                Genre Map
              </h2>
              <p className="text-foreground/40 text-xs font-mono">
                Top listening categories
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-foreground/40 border border-border px-2 py-1">
            {distribution.length} total genres
          </span>
        </div>

        <div className="space-y-4">
          {topGenres.map((item, i) => {
            const percentage = (item.count / maxCount) * 100;
            const share = Math.round((item.count / totalCount) * 100);
            const isTop = i === 0;

            return (
              <div key={item.genre} className="space-y-1.5">
                <div className="flex justify-between items-baseline text-sm">
                  <span className={`font-semibold truncate pr-2 ${isTop ? "text-primary font-bold" : "text-foreground/80"}`}>
                    {item.genre}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs flex-shrink-0">
                    <span className="text-foreground/40">{share}%</span>
                    <span className="text-foreground font-semibold w-10 text-right">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-foreground/5 overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full transition-all duration-500 ${isTop ? "bg-primary shadow-[0_0_12px_rgba(255,51,51,0.4)]" : "bg-foreground/25 hover:bg-foreground/40 transition-colors"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-border/40 text-xs font-mono text-foreground/30 flex justify-between items-center">
        <span>Distribution across library tracks</span>
        <span>Top 10 displayed</span>
      </div>
    </div>
  );
}
