import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { formatDate, formatDuration, CATEGORY_COLORS, CATEGORY_ICONS } from "../lib/utils";
import { useState } from "react";

export default function History() {
  const { data: logs = [] } = useQuery<any[]>({ queryKey: ["workouts"], queryFn: () => api.get("/workouts") });
  const [expanded, setExpanded] = useState<number | null>(null);

  const totalXp = logs.reduce((s: number, l: any) => s + l.xpEarned, 0);
  const totalTime = logs.reduce((s: number, l: any) => s + (l.durationMinutes || 0), 0);

  return (
    <div className="p-6 fade-in">
      <div className="mb-6">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-serif)" }}>📜 Quest History</h1>
        <p style={{ color: "hsl(var(--muted-foreground))" }}>Your battle chronicles</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Quests", value: logs.length, icon: "⚔️", color: "hsl(43 85% 55%)" },
          { label: "Total XP Earned", value: totalXp.toLocaleString(), icon: "⚡", color: "hsl(160 60% 50%)" },
          { label: "Time in Battle", value: formatDuration(totalTime), icon: "⏱️", color: "hsl(280 60% 60%)" },
        ].map(s => (
          <div key={s.label} className="rpg-card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)", color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {logs.length === 0 ? (
        <div className="rpg-card p-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
          <div className="text-5xl mb-3">📜</div>
          <p className="text-lg">No quests recorded yet</p>
          <p className="text-sm mt-2">Complete your first workout to begin your chronicle</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log: any) => (
            <div key={log.id} className="rpg-card overflow-hidden">
              <button
                className="w-full flex items-center gap-4 p-4 text-left transition-all"
                onClick={() => setExpanded(expanded === log.id ? null : log.id)}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: "hsl(43 85% 20% / 0.4)", border: "1px solid hsl(43 85% 35%)" }}>
                  ⚔️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--foreground))" }}>
                    {log.name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {formatDate(log.completedAt)}
                    {log.durationMinutes ? ` · ${formatDuration(log.durationMinutes)}` : ""}
                    · {(log.exercises || []).length} exercises
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold" style={{ fontFamily: "var(--font-mono)", color: "hsl(160 60% 50%)" }}>
                    +{log.xpEarned} XP
                  </div>
                  <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {expanded === log.id ? "▲" : "▼"}
                  </div>
                </div>
              </button>

              {expanded === log.id && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
                  {log.notes && (
                    <p className="text-sm py-3 italic" style={{ color: "hsl(var(--muted-foreground))" }}>
                      "{log.notes}"
                    </p>
                  )}
                  <div className="mt-3 space-y-2">
                    {(log.exercises || []).map((ex: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                        style={{ background: "hsl(var(--muted))" }}>
                        <span className="text-lg">{CATEGORY_ICONS[ex.category] || "💪"}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{ex.name}</div>
                          {(ex.sets || []).length > 0 && (
                            <div className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                              {ex.sets.map((s: any, j: number) => (
                                <span key={j}>{j > 0 ? " · " : ""}{s.reps}×{s.weight}kg</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
