import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { formatDate, formatDuration } from "../lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Stats {
  totalWorkouts: number;
  totalXpEarned: number;
  totalDuration: number;
  recentWorkouts: number;
  recentLogs: any[];
}

export default function Dashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { user } = useAuth();
  const { data: stats } = useQuery<Stats>({ queryKey: ["stats"], queryFn: () => api.get("/workouts/stats") });
  const { data: logs } = useQuery<any[]>({ queryKey: ["workouts"], queryFn: () => api.get("/workouts") });

  const xpPercent = user ? Math.min(100, (user.currentXp / user.xpToNextLevel) * 100) : 0;

  // Build last 7 days chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en", { weekday: "short" });
    const dayLogs = (stats?.recentLogs || []).filter(l => {
      const ld = new Date(l.completedAt);
      return ld.toDateString() === d.toDateString();
    });
    return { day: label, xp: dayLogs.reduce((s: number, l: any) => s + l.xpEarned, 0), workouts: dayLogs.length };
  });

  const statCards = [
    { icon: "⚔️", label: "Total Quests", value: stats?.totalWorkouts ?? 0, color: "hsl(43 85% 55%)" },
    { icon: "⚡", label: "Total XP", value: (stats?.totalXpEarned ?? 0).toLocaleString(), color: "hsl(160 60% 50%)" },
    { icon: "⏱️", label: "Time Trained", value: formatDuration(stats?.totalDuration), color: "hsl(280 60% 60%)" },
    { icon: "🔥", label: "This Week", value: `${stats?.recentWorkouts ?? 0} quests`, color: "hsl(0 70% 55%)" },
  ];

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
          Welcome back, <span className="gold-shimmer">{user?.displayName || user?.username}</span>
        </h1>
        <p style={{ color: "hsl(var(--muted-foreground))" }}>Your adventure continues...</p>
      </div>

      {/* Level Hero Card */}
      <div className="rpg-card p-6"
        style={{
          background: "linear-gradient(135deg, hsl(220 22% 10%), hsl(220 18% 13%))",
          borderColor: "hsl(43 85% 35%)",
          boxShadow: "0 0 40px hsl(43 85% 20% / 0.2)"
        }}>
        <div className="flex items-center gap-6">
          <div className="level-badge w-20 h-20 text-3xl flex-shrink-0">
            {user?.level}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))" }}>
                Level {user?.level}
              </span>
              <span style={{ color: "hsl(var(--muted-foreground))", fontStyle: "italic", textTransform: "capitalize" }}>
                {user?.avatarClass}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2" style={{ fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "hsl(160 60% 50%)" }}>
                {user?.currentXp?.toLocaleString()} / {user?.xpToNextLevel?.toLocaleString()} XP
              </span>
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                {Math.floor(xpPercent)}% to Level {(user?.level ?? 1) + 1}
              </span>
            </div>
            <div className="xp-bar h-4">
              <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="rpg-card p-4 text-center">
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-serif)", color: card.color }}>
              {card.value}
            </div>
            <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rpg-card p-5">
        <h2 className="text-lg mb-4" style={{ fontFamily: "var(--font-serif)" }}>⚡ XP This Week</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160 60% 50%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(160 60% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
            <XAxis dataKey="day" tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 22%)", borderRadius: 8, color: "hsl(45 30% 88%)" }}
              formatter={(v: any) => [`${v} XP`, "Experience"]}
            />
            <Area type="monotone" dataKey="xp" stroke="hsl(160 60% 50%)" strokeWidth={2} fill="url(#xpGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent workouts */}
      <div className="rpg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg" style={{ fontFamily: "var(--font-serif)" }}>📜 Recent Quests</h2>
          <button onClick={() => onNavigate("history")} className="text-sm" style={{ color: "hsl(var(--primary))" }}>
            View all →
          </button>
        </div>
        {(logs ?? []).length === 0 ? (
          <div className="text-center py-8" style={{ color: "hsl(var(--muted-foreground))" }}>
            <p className="text-4xl mb-2">⚔️</p>
            <p>No quests completed yet.</p>
            <button onClick={() => onNavigate("log-workout")}
              className="mt-3 text-sm font-bold"
              style={{ color: "hsl(var(--primary))" }}>
              Begin your first quest →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {(logs ?? []).slice(0, 5).map((log: any) => (
              <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                <div className="text-2xl">⚔️</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{log.name}</div>
                  <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {formatDate(log.completedAt)} · {formatDuration(log.durationMinutes)}
                  </div>
                </div>
                <div className="text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: "hsl(160 60% 50%)" }}>
                  +{log.xpEarned} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
