import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../lib/utils";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "hsl(160 60% 50%)",
  intermediate: "hsl(43 85% 55%)",
  advanced: "hsl(0 70% 55%)",
};
const DIFFICULTY_ICONS: Record<string, string> = {
  beginner: "🌱", intermediate: "⚔️", advanced: "🔥",
};

export default function Programs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: myPrograms = [] } = useQuery<any[]>({ queryKey: ["programs"], queryFn: () => api.get("/programs") });
  const { data: publicPrograms = [] } = useQuery<any[]>({ queryKey: ["programs-public"], queryFn: () => api.get("/programs/public") });

  const [tab, setTab] = useState<"my" | "explore">("my");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", daysPerWeek: 3, difficulty: "beginner", isPublic: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => editingId
      ? api.put(`/programs/${editingId}`, data)
      : api.post("/programs", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      qc.invalidateQueries({ queryKey: ["programs-public"] });
      setCreating(false);
      setEditingId(null);
      setForm({ name: "", description: "", daysPerWeek: 3, difficulty: "beginner", isPublic: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.del(`/programs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      qc.invalidateQueries({ queryKey: ["programs-public"] });
    },
  });

  const startEdit = (p: any) => {
    setForm({ name: p.name, description: p.description || "", daysPerWeek: p.daysPerWeek, difficulty: p.difficulty, isPublic: p.isPublic });
    setEditingId(p.id);
    setCreating(true);
  };

  if (creating) {
    return (
      <div className="p-6 fade-in max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setCreating(false); setEditingId(null); }} style={{ color: "hsl(var(--muted-foreground))" }}>← Back</button>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
            {editingId ? "✏️ Edit Program" : "📖 Create Program"}
          </h1>
        </div>

        <div className="rpg-card p-6 space-y-5">
          <div>
            <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>PROGRAM NAME</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. 12-Week Strength Builder"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              onFocus={e => e.target.style.borderColor = "hsl(var(--primary))"}
              onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
            />
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>DESCRIPTION</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Describe your program goals and structure..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              onFocus={e => e.target.style.borderColor = "hsl(var(--primary))"}
              onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-2" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>DAYS PER WEEK</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map(d => (
                  <button key={d} onClick={() => setForm(p => ({ ...p, daysPerWeek: d }))}
                    className="w-9 h-9 rounded-lg text-sm font-bold transition-all"
                    style={{
                      background: form.daysPerWeek === d ? "hsl(var(--primary))" : "hsl(var(--muted))",
                      color: form.daysPerWeek === d ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                      border: `1px solid ${form.daysPerWeek === d ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs mb-2" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>DIFFICULTY</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setForm(p => ({ ...p, difficulty: d }))}
                    className="flex-1 py-1.5 rounded-lg text-xs capitalize transition-all"
                    style={{
                      background: form.difficulty === d ? `${DIFFICULTY_COLORS[d]}22` : "hsl(var(--muted))",
                      color: form.difficulty === d ? DIFFICULTY_COLORS[d] : "hsl(var(--muted-foreground))",
                      border: `1px solid ${form.difficulty === d ? DIFFICULTY_COLORS[d] : "hsl(var(--border))"}`,
                    }}>
                    {DIFFICULTY_ICONS[d]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
            <button onClick={() => setForm(p => ({ ...p, isPublic: !p.isPublic }))}
              className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ background: form.isPublic ? "hsl(var(--primary))" : "hsl(var(--border))" }}>
              <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: form.isPublic ? "calc(100% - 18px)" : "2px" }} />
            </button>
            <div>
              <div className="text-sm font-medium">Share with the community</div>
              <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {form.isPublic ? "🌍 Visible to all warriors" : "🔒 Only visible to you"}
              </div>
            </div>
          </div>

          <button onClick={() => createMutation.mutate(form)}
            disabled={!form.name || createMutation.isPending}
            className="w-full py-3 rounded-lg font-bold transition-all"
            style={{
              fontFamily: "var(--font-serif)",
              background: !form.name ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))",
              color: !form.name ? "hsl(var(--muted-foreground))" : "hsl(220 20% 6%)",
            }}>
            {createMutation.isPending ? "⏳ Saving..." : "💾 Save Program"}
          </button>
        </div>
      </div>
    );
  }

  const ProgramCard = ({ p, isOwn }: { p: any; isOwn: boolean }) => (
    <div className="rpg-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))" }}>
            📖 {p.name}
          </h3>
          {!isOwn && p.author && (
            <div className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>by {p.author}</div>
          )}
        </div>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
          style={{
            background: `${DIFFICULTY_COLORS[p.difficulty]}22`,
            color: DIFFICULTY_COLORS[p.difficulty],
            border: `1px solid ${DIFFICULTY_COLORS[p.difficulty]}44`,
          }}>
          {DIFFICULTY_ICONS[p.difficulty]} {p.difficulty}
        </span>
      </div>

      {p.description && (
        <p className="text-sm mb-3 line-clamp-2" style={{ color: "hsl(var(--muted-foreground))" }}>{p.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs mb-4" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
        <span>📅 {p.daysPerWeek}x/week</span>
        {p.isPublic && <span>🌍 Public</span>}
        <span>{formatDate(p.createdAt)}</span>
      </div>

      {isOwn && (
        <div className="flex gap-2">
          <button onClick={() => startEdit(p)}
            className="flex-1 py-1.5 rounded-lg text-xs transition-all"
            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "hsl(var(--primary))"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "hsl(var(--border))"}>
            ✏️ Edit
          </button>
          <button onClick={() => deleteMutation.mutate(p.id)}
            className="py-1.5 px-3 rounded-lg text-xs"
            style={{ border: "1px solid hsl(var(--destructive-border))", color: "hsl(var(--destructive))" }}>
            🗑️
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-serif)" }}>📖 Programs</h1>
          <p style={{ color: "hsl(var(--muted-foreground))" }}>Training programs & campaigns</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-lg font-bold text-sm"
          style={{ fontFamily: "var(--font-serif)", background: "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))", color: "hsl(220 20% 6%)" }}>
          📖 New Program
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ background: "hsl(var(--muted))" }}>
        {(["my", "explore"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              background: tab === t ? "hsl(var(--card))" : "transparent",
              color: tab === t ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              fontFamily: tab === t ? "var(--font-serif)" : "inherit",
            }}>
            {t === "my" ? "⚔️ My Programs" : "🌍 Explore"}
          </button>
        ))}
      </div>

      {tab === "my" ? (
        myPrograms.length === 0 ? (
          <div className="rpg-card p-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
            <div className="text-5xl mb-3">📖</div>
            <p className="text-lg mb-4">No programs yet</p>
            <button onClick={() => setCreating(true)} className="font-bold" style={{ color: "hsl(var(--primary))" }}>
              Create your first program →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPrograms.map(p => <ProgramCard key={p.id} p={p} isOwn={true} />)}
          </div>
        )
      ) : (
        publicPrograms.filter(p => p.userId !== user?.id).length === 0 ? (
          <div className="rpg-card p-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
            <div className="text-5xl mb-3">🌍</div>
            <p className="text-lg">No public programs yet</p>
            <p className="text-sm mt-2">Be the first to share one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicPrograms.filter(p => p.userId !== user?.id).map(p => <ProgramCard key={p.id} p={p} isOwn={false} />)}
          </div>
        )
      )}
    </div>
  );
}
