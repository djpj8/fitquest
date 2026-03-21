import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface NavItem { id: string; icon: string; label: string; }

const NAV: NavItem[] = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "log-workout", icon: "⚔️", label: "Log Workout" },
  { id: "routines", icon: "📋", label: "Routines" },
  { id: "programs", icon: "📖", label: "Programs" },
  { id: "history", icon: "📜", label: "History" },
  { id: "achievements", icon: "🏆", label: "Achievements" },
  { id: "profile", icon: "⚙️", label: "Profilo" },
];

const CLASS_ICONS: Record<string, string> = { warrior: "⚔️", mage: "🔮", ranger: "🏹" };

interface SidebarProps { currentPage: string; onNavigate: (page: string) => void; }

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const xpPercent = Math.min(100, (user.currentXp / user.xpToNextLevel) * 100);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: "1.25rem", borderBottom: "1px solid hsl(var(--sidebar-border))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⚔️</span>
          <span style={{ fontSize: "1.25rem", fontFamily: "var(--font-serif)", fontWeight: "bold", background: "linear-gradient(90deg, hsl(43 85% 45%), hsl(43 95% 65%), hsl(43 85% 45%))", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            FitQuest
          </span>
        </div>
        {/* Close button on mobile */}
        <button onClick={() => setMobileOpen(false)}
          style={{ display: "none", background: "none", border: "none", color: "hsl(var(--muted-foreground))", fontSize: "1.25rem", cursor: "pointer", padding: "0.25rem" }}
          className="mobile-close-btn">
          ✕
        </button>
      </div>

      {/* Player card */}
      <div style={{ padding: "1rem", borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{
            width: "3rem", height: "3rem", borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.25rem", flexShrink: 0,
            background: "linear-gradient(135deg, hsl(43 85% 35%), hsl(43 85% 55%))",
            boxShadow: "0 0 15px hsl(43 85% 40% / 0.5)",
          }}>
            {CLASS_ICONS[user.avatarClass] || "⚔️"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.displayName || user.username}
            </div>
            <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", textTransform: "capitalize" }}>
              Level {user.level} {user.avatarClass}
            </div>
          </div>
        </div>
        <div style={{ fontSize: "0.7rem", display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "hsl(160 60% 50%)" }}>XP</span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>{user.currentXp} / {user.xpToNextLevel}</span>
        </div>
        <div style={{ background: "hsl(220 20% 14%)", border: "1px solid hsl(220 15% 22%)", borderRadius: "999px", overflow: "hidden", height: "0.5rem" }}>
          <div style={{
            width: `${xpPercent}%`, height: "100%", borderRadius: "999px",
            background: "linear-gradient(90deg, hsl(160 60% 35%), hsl(160 70% 50%))",
            transition: "width 1s ease",
          }} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }}>
        {NAV.map(item => (
          <button key={item.id} onClick={() => handleNav(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.625rem 0.75rem", borderRadius: "0.5rem",
              border: "none", cursor: "pointer", textAlign: "left", width: "100%",
              background: currentPage === item.id ? "hsl(43 85% 55% / 0.15)" : "transparent",
              color: currentPage === item.id ? "hsl(var(--primary))" : "hsl(var(--sidebar-foreground))",
              borderLeft: currentPage === item.id ? "2px solid hsl(var(--primary))" : "2px solid transparent",
              fontFamily: currentPage === item.id ? "var(--font-serif)" : "inherit",
              fontSize: "0.9rem",
            }}>
            <span style={{ fontSize: "1rem" }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "0.75rem", borderTop: "1px solid hsl(var(--sidebar-border))" }}>
        <button onClick={() => logout()}
          style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.625rem 0.75rem", borderRadius: "0.5rem",
            border: "none", cursor: "pointer", width: "100%",
            background: "transparent", color: "hsl(var(--muted-foreground))",
            fontSize: "0.9rem",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "hsl(var(--destructive))"}
          onMouseLeave={e => e.currentTarget.style.color = "hsl(var(--muted-foreground))"}>
          <span>🚪</span><span>Leave Realm</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{
        display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "hsl(var(--sidebar))", borderBottom: "1px solid hsl(var(--sidebar-border))",
        padding: "0.75rem 1rem", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}>⚔️</span>
          <span style={{ fontFamily: "var(--font-serif)", fontWeight: "bold", color: "hsl(var(--primary))" }}>FitQuest</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "hsl(160 60% 50%)" }}>
            Lv.{user.level}
          </span>
          <button onClick={() => setMobileOpen(true)}
            style={{ background: "none", border: "none", color: "hsl(var(--foreground))", fontSize: "1.5rem", cursor: "pointer", padding: "0.25rem", lineHeight: 1 }}>
            ☰
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="desktop-sidebar" style={{
        width: "16rem", flexShrink: 0, display: "flex", flexDirection: "column",
        height: "100vh", position: "sticky", top: 0,
        background: "hsl(var(--sidebar))", borderRight: "1px solid hsl(var(--sidebar-border))",
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          {/* Backdrop */}
          <div onClick={() => setMobileOpen(false)}
            style={{ position: "absolute", inset: 0, background: "hsl(220 20% 6% / 0.8)" }} />
          {/* Drawer */}
          <div style={{
            position: "relative", zIndex: 101, width: "16rem", height: "100%",
            display: "flex", flexDirection: "column",
            background: "hsl(var(--sidebar))", borderRight: "1px solid hsl(var(--sidebar-border))",
          }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* CSS for responsive */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </>
  );
}
