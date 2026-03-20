import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../lib/utils";

export interface Exercise {
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

  const favIds = new Set(favorites.map((f: Exercise) => f.id));

  const favMutation = useMutation({
    mutationFn: (id: number) => api.post(`/exercises/${id}/favorite`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
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

  const filtered = exercises.filter((e: Exercise) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || e.category === filterCat;
    const matchType =
      filterType === "all" ? true :
      filterType === "favorites" ? favIds.has(e.id) :
      filterType === "custom" ? !!e.userId :
      e.type === filterType;
    return matchSearch && matchCat && matchType;
  });

  const inputStyle: React.CSSProperties = {
    background: "hsl(var(--input))",
    border: "1px solid hsl(var(--border))",
    color: "hsl(var(--foreground))",
    borderRadius: "0.5rem",
    outline: "none",
    width: "100%",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
  };

  const handleSelect = (e: React.MouseEvent, ex: Exercise) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect && !selectedIds.includes(ex.id)) {
      onSelect(ex);
    }
  };

  const handleFav = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    favMutation.mutate(id);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  return (
    <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--card-border))", borderRadius: "0.5625rem", padding: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", color: "hsl(var(--primary))", margin: 0 }}>
          📚 Exercise Library
        </h2>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAddForm(!showAddForm); }}
          style={{
            padding: "0.375rem 0.75rem",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: "bold",
            fontFamily: "var(--font-serif)",
            cursor: "pointer",
            border: "none",
            background: showAddForm ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))",
            color: showAddForm ? "hsl(var(--muted-foreground))" : "hsl(220 20% 6%)",
          }}>
          {showAddForm ? "✕ Cancel" : "➕ Custom"}
        </button>
      </div>

      {/* Add custom form */}
      {showAddForm && (
        <div style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "0.5rem", background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
          <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            NEW CUSTOM EXERCISE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <input
              value={newEx.name}
              onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))}
              placeholder="Exercise name"
              style={inputStyle}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <select value={newEx.category} onChange={e => setNewEx(p => ({ ...p, category: e.target.value }))} style={inputStyle}>
                {CATEGORIES.filter(c => c !== "all").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={newEx.type} onChange={e => setNewEx(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                <option value="gym">🏋️ Gym</option>
                <option value="calisthenics">🤸 Calisthenics</option>
              </select>
            </div>
            <input
              value={newEx.muscleGroups}
              onChange={e => setNewEx(p => ({ ...p, muscleGroups: e.target.value }))}
              placeholder="Muscle groups (e.g. chest, triceps)"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addMutation.mutate({
                  ...newEx,
                  muscleGroups: newEx.muscleGroups.split(",").map((s: string) => s.trim()).filter(Boolean),
                });
              }}
              disabled={!newEx.name || addMutation.isPending}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                fontWeight: "bold",
                fontFamily: "var(--font-serif)",
                cursor: newEx.name ? "pointer" : "not-allowed",
                border: "none",
                background: !newEx.name ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))",
                color: !newEx.name ? "hsl(var(--muted-foreground))" : "hsl(220 20% 6%)",
              }}>
              {addMutation.isPending ? "⏳ Saving..." : "💾 Add Exercise"}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search exercises..."
        style={{ ...inputStyle, marginBottom: "0.5rem" }}
      />

      {/* Type filter */}
      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        {([
          { id: "all", label: "All", icon: "📋" },
          { id: "gym", label: "Gym", icon: "🏋️" },
          { id: "calisthenics", label: "Calisthenics", icon: "🤸" },
          { id: "favorites", label: "Favorites", icon: "⭐" },
          { id: "custom", label: "Custom", icon: "✏️" },
        ] as const).map(f => (
          <button key={f.id} type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFilterType(f.id); }}
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              cursor: "pointer",
              border: "none",
              background: filterType === f.id ? "hsl(var(--primary))" : "hsl(var(--muted))",
              color: filterType === f.id ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
            }}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFilterCat(cat); }}
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              cursor: "pointer",
              border: `1px solid ${filterCat === cat ? "hsl(43 85% 35%)" : "transparent"}`,
              background: filterCat === cat ? "hsl(43 85% 20%)" : "transparent",
              color: filterCat === cat ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              textTransform: "capitalize",
            }}>
            {cat === "all" ? "All" : `${CATEGORY_ICONS[cat] || ""} ${cat}`}
          </button>
        ))}
      </div>

      {/* Exercise list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "24rem", overflowY: "auto", paddingRight: "0.25rem" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "hsl(var(--muted-foreground))" }}>
            No exercises found
          </div>
        )}
        {filtered.map((ex: Exercise) => {
          const isSelected = selectedIds.includes(ex.id);
          const isFav = favIds.has(ex.id);
          return (
            <div key={ex.id}
              onClick={(e) => handleSelect(e, ex)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                cursor: isSelected ? "default" : "pointer",
                background: isSelected ? "hsl(43 85% 20% / 0.4)" : "hsl(var(--muted))",
                border: isSelected
                  ? "2px solid hsl(43 85% 55%)"
                  : "2px solid transparent",
                boxShadow: isSelected ? "0 0 10px hsl(43 85% 30% / 0.4)" : "none",
                transition: "all 0.15s ease",
                opacity: isSelected ? 0.8 : 1,
              }}>

              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{CATEGORY_ICONS[ex.category] || "💪"}</span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ex.name}
                  </span>
                  {ex.type === "calisthenics" && (
                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.35rem", borderRadius: "999px", background: "hsl(160 60% 20%)", color: "hsl(160 60% 60%)", flexShrink: 0 }}>
                      🤸
                    </span>
                  )}
                  {ex.userId && (
                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.35rem", borderRadius: "999px", background: "hsl(280 60% 20%)", color: "hsl(280 60% 70%)", flexShrink: 0 }}>
                      ✏️
                    </span>
                  )}
                  {isSelected && (
                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.35rem", borderRadius: "999px", background: "hsl(43 85% 30%)", color: "hsl(43 95% 65%)", flexShrink: 0, fontFamily: "var(--font-serif)" }}>
                      ✓ Added
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.7rem", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                  {ex.category} · +{ex.xpReward} XP
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
                {/* Favorite */}
                <button type="button"
                  onClick={(e) => handleFav(e, ex.id)}
                  title={isFav ? "Remove from favorites" : "Add to favorites"}
                  style={{
                    width: "1.75rem", height: "1.75rem",
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    border: "none",
                    background: isFav ? "hsl(43 85% 20%)" : "transparent",
                    color: isFav ? "hsl(43 95% 65%)" : "hsl(var(--muted-foreground))",
                  }}>
                  {isFav ? "⭐" : "☆"}
                </button>

                {/* Delete custom */}
                {ex.userId && (
                  <button type="button"
                    onClick={(e) => handleDelete(e, ex.id)}
                    style={{
                      width: "1.75rem", height: "1.75rem",
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                      color: "hsl(var(--destructive))",
                    }}>
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", textAlign: "right", color: "hsl(var(--muted-foreground))" }}>
        {filtered.length} exercises
      </div>
    </div>
  );
}
