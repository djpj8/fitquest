import { useAuth } from "../hooks/useAuth";
import { xpForLevel } from "../lib/utils";

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "log-workout", icon: "⚔️", label: "Log Workout" },
  { id: "routines", icon: "📋", label: "Routines" },
  { id: "programs", icon: "📖", label: "Programs" },
  { id: "history", icon: "📜", label: "History" },
  { id: "achievements", icon: "🏆", label: "Achievements" },
];

const CLASS_ICONS: Record<string, string> = {
  warrior: "⚔️", mage: "🔮", ranger: "🏹"
};

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const xpPercent = Math.min(100, (user.currentXp / user.xpToNextLevel) * 100);

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: "hsl(var(--sidebar))", borderRight: "1px solid hsl(var(--sidebar-border))" }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚔️</span>
          <span className="text-xl font-bold gold-shimmer" style={{ fontFamily: "var(--font-serif)" }}>
            FitQuest
          </span>
        </div>
      </div>

      {/* Player card */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="level-badge w-12 h-12 text-lg flex-shrink-0">
            {CLASS_ICONS[user.avatarClass] || "⚔️"}
          </div>
          <div className="min-w-0">
            <div className="font-bold truncate" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))" }}>
              {user.displayName || user.username}
            </div>
            <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              Level {user.level} {user.avatarClass.charAt(0).toUpperCase() + user.avatarClass.slice(1)}
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
            <span style={{ color: "hsl(160 60% 50%)" }}>XP</span>
            <span>{user.currentXp} / {user.xpToNextLevel}</span>
          </div>
          <div className="xp-bar h-2">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
            style={{
              background: currentPage === item.id ? "hsl(43 85% 55% / 0.15)" : "transparent",
              color: currentPage === item.id ? "hsl(var(--primary))" : "hsl(var(--sidebar-foreground))",
              borderLeft: currentPage === item.id ? "2px solid hsl(var(--primary))" : "2px solid transparent",
              fontFamily: currentPage === item.id ? "var(--font-serif)" : "inherit",
            }}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{ color: "hsl(var(--muted-foreground))" }}
          onMouseEnter={e => (e.currentTarget.style.color = "hsl(var(--destructive))")}
          onMouseLeave={e => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
        >
          <span>🚪</span>
          <span>Leave Realm</span>
        </button>
      </div>
    </aside>
  );
}
