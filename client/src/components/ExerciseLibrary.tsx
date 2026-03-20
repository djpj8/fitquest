import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../lib/utils";

interface Exercise {
  id: number; name: string; category: string; type: string;
  xpReward: number; userId?: number | null; muscleGroups?: string[];
}

interface Props {
  onSelect?: (ex: Exercise) => void;
  selectedIds?: number[];
  showSelectButton?: boolean;
}

const CATEGORIES = ["all", "chest", "back", "legs", "shoulders", "arms", "core", "cardio"];

export default function ExerciseLibrary({ onSelect, selectedIds = [], showSelectButton = true }: Props) {
  const qc = useQueryClient();
  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["exercises"], queryFn: () => api.get("/exercises"),
  });
  const { data: favorites = [] } = useQuery<Exercise[]>({
    queryKey: ["favorites"], queryFn: () => api.get("/exercises/favorites"),
  });

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "gym" | "calisthenics" | "favorites" | "custom">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEx, setNewEx] = useState({ name: "", category: "chest", type: "gym", muscleGroups: "" });

  const favIds = new Set(favorites.map(f => f.id));

  const favMutation = useMutation({
    mutationFn: (id: number) => api.post(`/exercises/${id}/favorite`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["exercises"] });
    },
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post("/exercises", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exercises"] });
      setShowAddForm(false);
      setNewEx({ name: "", category: "chest", type: "gym", muscleGroups: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.del(`/exercises/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercises"] }),
  });

  const filtered = exercises.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || e.category === filterCat;
    const matchType =
      filterType === "all" ? true :
      filterType === "favorites" ? favIds.has(e.id) :
      filterType === "custom" ? !!e.userId :
      e.type === filterType;
    return matchSearch && matchCat && matchType;
  });

  const inputStyle = {
    background: "hsl(var(--input))", border: "1px solid hsl(var(--border))",
    color: "hsl(var(--foreground))", borderRadius: "0.5rem",
  };

  return (
    <div className="rpg-card p-4" style={{ position: "relative", zIndex: 1 }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg" style={{ fontFamily: "var(--font-serif)" }}>📚 Exercise Library</h2>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: showAddForm ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))",
            color: showAddForm ? "hsl(var(--muted-foreground))" : "hsl(220 20% 6%)",
            fontFamily: "var(--font-serif)",
          }}>
          {showAddForm ? "✕ Cancel" : "➕ Custom"}
        </button>
      </div>

      {/* Add custom exercise form */}
      {showAddForm && (
        <div className="mb-4 p-4 rounded-lg space-y-3" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
          <div className="text-xs font-bold mb-2" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
            NEW CUSTOM EXERCISE
          </div>
          <input
            value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))}
            placeholder="Exercise name"
            className="w-full px-3 py-2 text-sm outline-none"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "hsl(var(--primary))"}
            onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
          />
          <div className="grid grid-cols-2 gap-2">
            <select value={newEx.category} onChange={e => setNewEx(p => ({ ...p, category: e.target.value }))}
              className="w-full px-3 py-2 text-sm outline-none capitalize"
              style={inputStyle}>
              {CATEGORIES.filter(c => c !== "all").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={newEx.type} onChange={e => setNewEx(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2 text-sm outline-none"
              style={inputStyle}>
              <option value="gym">🏋️ Gym</option>
              <option value="calisthenics">🤸 Calisthenics</option>
            </select>
          </div>
          <input
            value={newEx.muscleGroups} onChange={e => setNewEx(p => ({ ...p, muscleGroups: e.target.value }))}
            placeholder="Muscle groups (e.g. chest, triceps)"
            className="w-full px-3 py-2 text-sm outline-none"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "hsl(var(--primary))"}
            onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
          />
          <button
            onClick={() => addMutation.mutate({
              ...newEx,
              muscleGroups: newEx.muscleGroups.split(",").map(s => s.trim()).filter(Boolean),
            })}
            disabled={!newEx.name || addMutation.isPending}
            className="w-full py-2 rounded-lg text-sm font-bold"
            style={{
              fontFamily: "var(--font-serif)",
              background: !newEx.name ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))",
              color: !newEx.name ? "hsl(var(--muted-foreground))" : "hsl(220 20% 6%)",
            }}>
            {addMutation.isPending ? "⏳ Saving..." : "💾 Add Exercise"}
          </button>
        </div>
      )}

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..."
        className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-3"
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = "hsl(var(--primary))"}
        onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
      />

      {/* Type filter */}
      <div className="flex gap-1 mb-2 flex-wrap">
        {([
          { id: "all", label: "All", icon: "📋" },
          { id: "gym", label: "Gym", icon: "🏋️" },
          { id: "calisthenics", label: "Calisthenics", icon: "🤸" },
          { id: "favorites", label: "Favorites", icon: "⭐" },
          { id: "custom", label: "Custom", icon: "✏️" },
        ] as const).map(f => (
          <button key={f.id} onClick={() => setFilterType(f.id)}
            className="px-2 py-1 rounded-full text-xs transition-all"
            style={{
              background: filterType === f.id ? "hsl(var(--primary))" : "hsl(var(--muted))",
              color: filterType === f.id ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
            }}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className="px-2 py-1 rounded-full text-xs capitalize transition-all"
            style={{
              background: filterCat === cat ? "hsl(43 85% 20%)" : "transparent",
              color: filterCat === cat ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              border: `1px solid ${filterCat === cat ? "hsl(43 85% 35%)" : "transparent"}`,
            }}>
            {cat === "all" ? "All" : `${CATEGORY_ICONS[cat] || ""} ${cat}`}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <div className="text-center py-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            No exercises found
          </div>
        )}
        {filtered.map(ex => {
          const isSelected = selectedIds.includes(ex.id);
          const isFav = favIds.has(ex.id);
          return (
            <div key={ex.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
              style={{
                background: isSelected ? "hsl(43 85% 20% / 0.3)" : "hsl(var(--muted))",
                border: `1px solid ${isSelected ? "hsl(43 85% 35%)" : "transparent"}`,
                position: "relative",
                zIndex: 1,
                cursor: isSelected ? "default" : "pointer",
              }}
              onClick={() => !isSelected && onSelect && onSelect(ex)}>
              <span className="text-base flex-shrink-0">{CATEGORY_ICONS[ex.category] || "💪"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-sm font-medium truncate">{ex.name}</span>
                  {ex.type === "calisthenics" && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "hsl(160 60% 20%)", color: "hsl(160 60% 60%)" }}>
                      🤸
                    </span>
                  )}
                  {ex.userId && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: "hsl(280 60% 20%)", color: "hsl(280 60% 70%)" }}>
                      ✏️
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {ex.category} · +{ex.xpReward} XP
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Favorite button */}
                <button onClick={() => favMutation.mutate(ex.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
                  title={isFav ? "Remove from favorites" : "Add to favorites"}
                  style={{
                    background: isFav ? "hsl(43 85% 20%)" : "transparent",
                    color: isFav ? "hsl(43 95% 65%)" : "hsl(var(--muted-foreground))",
                  }}>
                  {isFav ? "⭐" : "☆"}
                </button>

                {/* Delete custom */}
                {ex.userId && (
                  <button onClick={() => deleteMutation.mutate(ex.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all"
                    style={{ color: "hsl(var(--destructive))" }}>
                    🗑️
                  </button>
                )}

                {/* Select button */}
                {showSelectButton && onSelect && (
                  <button onClick={() => !isSelected && onSelect(ex)}
                    disabled={isSelected}
                    className="px-2 py-1 rounded-lg text-xs transition-all"
                    style={{
                      background: isSelected ? "hsl(43 85% 20%)" : "hsl(var(--secondary))",
                      color: isSelected ? "hsl(43 95% 65%)" : "hsl(var(--foreground))",
                      opacity: isSelected ? 0.7 : 1,
                      cursor: isSelected ? "default" : "pointer",
                    }}>
                    {isSelected ? "✓" : "+"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-xs text-right" style={{ color: "hsl(var(--muted-foreground))" }}>
        {filtered.length} exercises
      </div>
    </div>
  );
}
