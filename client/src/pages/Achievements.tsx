import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { formatDate } from "../lib/utils";

interface Achievement {
  id: number; key: string; name: string; description: string;
  icon: string; xpReward: number; rarity: string; unlocked: boolean;
}

const RARITY_ORDER = ["legendary", "epic", "rare", "common"];
const RARITY_LABELS: Record<string, string> = {
  common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary",
};

export default function Achievements() {
  const { data } = useQuery<{ achievements: Achievement[]; userAchievements: any[] }>({
    queryKey: ["achievements"],
    queryFn: () => api.get("/achievements"),
  });

  const achievements = data?.achievements ?? [];
  const userAchs = data?.userAchievements ?? [];

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  const getUnlockDate = (achId: number) => {
    const ua = userAchs.find(u => u.achievementId === achId);
    return ua?.unlockedAt;
  };

  const AchCard = ({ ach }: { ach: Achievement }) => (
    <div className={`rpg-card p-4 transition-all ${!ach.unlocked ? "opacity-50" : ""}`}
      style={{
        borderColor: ach.unlocked ? getRarityBorder(ach.rarity) : "hsl(var(--border))",
        boxShadow: ach.unlocked && ach.rarity === "legendary" ? "0 0 20px hsl(43 85% 30% / 0.4)" : "none",
      }}>
      <div className="flex items-start gap-3">
        <div className="text-4xl flex-shrink-0 relative">
          {ach.icon}
          {!ach.unlocked && (
            <div className="absolute inset-0 flex items-center justify-center text-xl"
              style={{ background: "hsl(220 20% 6% / 0.7)", borderRadius: "4px" }}>
              🔒
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold" style={{ fontFamily: "var(--font-serif)", color: ach.unlocked ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
              {ach.name}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border rarity-${ach.rarity}`}
              style={{ fontFamily: "var(--font-mono)" }}>
              {RARITY_LABELS[ach.rarity]}
            </span>
          </div>
          <p className="text-sm mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{ach.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold" style={{ fontFamily: "var(--font-mono)", color: "hsl(160 60% 50%)" }}>
              +{ach.xpReward} XP
            </span>
            {ach.unlocked && (
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                ✓ {formatDate(getUnlockDate(ach.id))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 fade-in">
      <div className="mb-6">
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-serif)" }}>🏆 Achievements</h1>
        <p style={{ color: "hsl(var(--muted-foreground))" }}>Trophies from your battles</p>
      </div>

      {/* Progress */}
      <div className="rpg-card p-5 mb-6" style={{ borderColor: "hsl(43 85% 35%)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))" }}>
            Trophy Collection
          </span>
          <span style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
            {unlocked.length} / {achievements.length}
          </span>
        </div>
        <div className="xp-bar h-3">
          <div className="xp-bar-fill" style={{
            width: achievements.length > 0 ? `${(unlocked.length / achievements.length) * 100}%` : "0%",
            background: "linear-gradient(90deg, hsl(43 85% 40%), hsl(43 95% 60%))",
          }} />
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg mb-3" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))" }}>
            ✨ Unlocked ({unlocked.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {RARITY_ORDER.flatMap(r => unlocked.filter(a => a.rarity === r)).map(ach => (
              <AchCard key={ach.id} ach={ach} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-lg mb-3" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--muted-foreground))" }}>
            🔒 Locked ({locked.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {RARITY_ORDER.flatMap(r => locked.filter(a => a.rarity === r)).map(ach => (
              <AchCard key={ach.id} ach={ach} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getRarityBorder(rarity: string): string {
  switch (rarity) {
    case "legendary": return "hsl(43 85% 45%)";
    case "epic": return "hsl(280 60% 45%)";
    case "rare": return "hsl(200 70% 40%)";
    default: return "hsl(var(--border))";
  }
}
