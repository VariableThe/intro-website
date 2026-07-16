"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

interface Props {
  heatmap: { date: string; count: number }[];
}

interface DayCell {
  dateStr: string; // YYYY-MM-DD
  count: number;
  level: number; // 0 to 4
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
}

export function ListeningTimeline({ heatmap }: Props) {
  const [hoveredDay, setHoveredDay] = useState<DayCell | null>(null);

  const { weeks, totalActivity, maxActivity } = useMemo(() => {
    const dataMap = new Map<string, number>();
    for (const item of heatmap) {
      dataMap.set(item.date, item.count);
    }

    // Determine past 52 weeks (364 days) ending today or on the latest date in data
    const latestDateStr =
      heatmap.length > 0 ? heatmap[heatmap.length - 1].date : new Date().toISOString().slice(0, 10);
    const endDate = new Date(latestDateStr);

    // Adjust to end on Saturday so weeks align cleanly
    const daysToSubtract = 364 + endDate.getDay();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const allDays: DayCell[] = [];
    let total = 0;
    let max = 1;

    // First pass: find max activity
    for (let i = 0; i < 371; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      if (d > endDate) break;
      const dateStr = d.toISOString().slice(0, 10);
      const count = dataMap.get(dateStr) ?? 0;
      if (count > max) max = count;
      total += count;
    }

    // Second pass: build cells
    for (let i = 0; i < 371; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      if (d > endDate) break;
      const dateStr = d.toISOString().slice(0, 10);
      const count = dataMap.get(dateStr) ?? 0;

      let level = 0;
      if (count > 0) {
        const ratio = count / max;
        if (ratio > 0.75) level = 4;
        else if (ratio > 0.5) level = 3;
        else if (ratio > 0.2) level = 2;
        else level = 1;
      }

      allDays.push({
        dateStr,
        count,
        level,
        dayOfWeek: d.getDay(),
      });
    }

    // Group by week columns
    const weeksArr: DayCell[][] = [];
    let currentWeek: DayCell[] = [];

    for (const day of allDays) {
      if (day.dayOfWeek === 0 && currentWeek.length > 0) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }
    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek);
    }

    return { weeks: weeksArr, totalActivity: total, maxActivity: max };
  }, [heatmap]);

  if (!heatmap || heatmap.length === 0) return null;

  const getCellColor = (level: number) => {
    switch (level) {
      case 4:
        return "bg-primary shadow-[0_0_6px_rgba(255,51,51,0.5)]";
      case 3:
        return "bg-primary/75";
      case 2:
        return "bg-primary/45";
      case 1:
        return "bg-primary/25";
      default:
        return "bg-foreground/[0.04] hover:bg-foreground/[0.08]";
    }
  };

  return (
    <div className="bg-card/40 border border-border p-6 md:p-8 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                Listening Activity
              </h2>
              <p className="text-foreground/40 text-xs font-mono">
                Daily listening frequency over the past year
              </p>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-sm font-bold text-foreground">
              {totalActivity.toLocaleString()}
            </span>{" "}
            <span className="text-xs text-foreground/40">plays logged</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="inline-flex gap-1.5 min-w-full justify-between items-start">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day) => (
                  <div
                    key={day.dateStr}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-[1px] transition-colors cursor-pointer ${getCellColor(
                      day.level
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Hover info / Tooltip display */}
        <div className="h-6 mt-2 flex items-center justify-between text-xs font-mono">
          {hoveredDay ? (
            <div className="text-foreground flex items-center gap-2">
              <span className="font-bold text-primary">
                {hoveredDay.count} play{hoveredDay.count === 1 ? "" : "s"}
              </span>
              <span className="text-foreground/40">on {hoveredDay.dateStr}</span>
            </div>
          ) : (
            <span className="text-foreground/30">Hover over a square to see activity details</span>
          )}

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[10px] text-foreground/40">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-2.5 h-2.5 ${getCellColor(level)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-border/40 text-xs font-mono text-foreground/30 flex justify-between items-center">
        <span>Daily timestamps from Apple Music & Spotify</span>
        <span>Peak: {maxActivity} plays/day</span>
      </div>
    </div>
  );
}
