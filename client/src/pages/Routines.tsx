import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../lib/utils";
import ExerciseLibrary from "../components/ExerciseLibrary";

interface Exercise { id: number; name: string; category: string; type: string; xpReward: number; userId?: number | null; muscleGroups?: string[]; }
interface RoutineExercise { exerciseId: number; sets: number; reps: number; weight: number; restSeconds: number; }

export default function Routines({ onNavigate }: { onNavigate?: (page: string, routineId?: number) => void }) {
  const qc = useQueryClient();
  const { data: routines = [] } = useQuery<any[]>({ queryKey: ["routines"], queryFn: () => api.get("/routines") });
  const { data: exercises = [] } = useQuery<Exercise[]>({ queryKey: ["exercises"], queryFn: () => api.get("/exercises") });

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", exercises: [] as RoutineExercise[] });
  const [search, setSearch] = useState("");

  const exMap = new Map(exercises.map(e => [e.id, e]));

  const createMutation = useMutation({
    mutationFn: (data: any) => editingId
      ? api.put(`/routines/${editingId}`, data)
      : api.post("/routines", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      setCreating(false);
      setEditingId(null);
      setForm({ name: "", exercises: [] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.del(`/routines/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routines"] }),
  });

  const addExToRoutine = (ex: Exercise) => {
    if (form.exercises.find(e => e.exerciseId === ex.id)) return;
    setForm(p => ({ ...p, exercises: [...p.exercises, { exerciseId: ex.id, sets: 3, reps: 10, weight: 0, restSeconds: 60 }] }));
  };

  const updateRoutineEx = (idx: number, field: string, value: any) => {
    setForm(p => ({ ...p, exercises: p.exercises.map((e, i) => i === idx ? { ...e, [field]: value } : e) }));
  };

  const startEdit = (routine: any) => {
    setForm({ name: routine.name, exercises: routine.exercises || [] });
    setEditingId(routine.id);
    setCreating(true);
  };

  const filteredEx = exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  if (creating) {
    return (
      <div className="p-6 fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setCreating(false); setEditingId(null); setForm({ name: "", exercises: [] }); }}
            style={{ color: "hsl(var(--muted-foreground))" }}>← Back</button>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
            {editingId ? "Edit Routine" : "⚒️ Create Routine"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rpg-card p-4">
              <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
                ROUTINE NAME
              </label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Push Day, Leg Day..."
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              />
            </div>

            {form.exercises.length === 0 ? (
              <div className="rpg-card p-8 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                <p className="text-3xl mb-2">📋</p>
                <p>Add exercises from the list</p>
              </div>
            ) : (
              form.exercises.map((re, idx) => {
                const ex = exMap.get(re.exerciseId);
                if (!ex) return null;
                return (
                  <div key={idx} className="rpg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold" style={{ color: "hsl(var(--primary))", fontFamily: "var(--font-serif)" }}>
                        {CATEGORY_ICONS[ex.category]} {ex.name}
                      </span>
                      <button onClick={() => setForm(p => ({ ...p, exercises: p.exercises.filter((_, i) => i !== idx) }))}
                        style={{ color: "hsl(var(--muted-foreground))" }}>✕</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[["sets", "Sets"], ["reps", "Reps"], ["weight", "KG"], ["restSeconds", "Rest(s)"]].map(([field, label]) => (
                        <div key={field}>
                          <div className="text-xs mb-1 text-center" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{label}</div>
                          <input type="number" min="0" value={(re as any)[field]}
                            onChange={e => updateRoutineEx(idx, field, +e.target.value)}
                            className="w-full px-2 py-1 rounded text-sm text-center outline-none"
                            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.name || form.exercises.length === 0 || createMutation.isPending}
              className="w-full py-3 rounded-lg font-bold transition-all"
              style={{
                fontFamily: "var(--font-serif)",
                background: (!form.name || form.exercises.length === 0) ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))",
                color: (!form.name || form.exercises.length === 0) ? "hsl(var(--muted-foreground))" : "hsl(220 20% 6%)",
              }}>
              {createMutation.isPending ? "⏳ Saving..." : "💾 Save Routine"}
            </button>
          </div>


          <ExerciseLibrary
            onSelect={addExToRoutine}
            selectedIds={form.exercises.map(e => e.exerciseId)}
            showSelectButton={true}
          />

        </div>
      </div>
    );
  }

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-serif)" }}>📋 Routines</h1>
          <p style={{ color: "hsl(var(--muted-foreground))" }}>Your battle plans</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-lg font-bold text-sm"
          style={{ fontFamily: "var(--font-serif)", background: "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))", color: "hsl(220 20% 6%)" }}>
          ⚒️ New Routine
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="rpg-card p-12 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
          <div className="text-5xl mb-3">📋</div>
          <p className="text-lg mb-4">No routines yet</p>
          <button onClick={() => setCreating(true)} className="font-bold" style={{ color: "hsl(var(--primary))" }}>
            Create your first routine →
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((r: any) => (
            <div key={r.id} className="rpg-card p-4">
              <h3 className="font-bold mb-2" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))" }}>
                📋 {r.name}
              </h3>
              <p className="text-sm mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                {(r.exercises || []).length} exercises
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {(r.exercises || []).slice(0, 4).map((re: any, i: number) => {
                  const ex = exMap.get(re.exerciseId);
                  return ex ? (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${CATEGORY_COLORS[ex.category]}22`, color: CATEGORY_COLORS[ex.category], border: `1px solid ${CATEGORY_COLORS[ex.category]}44` }}>
                      {ex.name}
                    </span>
                  ) : null;
                })}
                {(r.exercises || []).length > 4 && (
                  <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>+{r.exercises.length - 4} more</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onNavigate && onNavigate("log-workout", r.id)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))",
                    color: "hsl(220 20% 6%)", border: "none",
                    fontFamily: "var(--font-serif)", cursor: "pointer",
                  }}>
                  ⚔️ Inizia
                </button>
                <button onClick={() => startEdit(r)}
                  className="py-1.5 px-3 rounded-lg text-xs transition-all"
                  style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", cursor: "pointer", background: "none" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "hsl(var(--primary))"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "hsl(var(--border))"}>
                  ✏️
                </button>
                <button onClick={() => deleteMutation.mutate(r.id)}
                  className="py-1.5 px-3 rounded-lg text-xs transition-all"
                  style={{ border: "1px solid hsl(var(--destructive-border))", color: "hsl(var(--destructive))", cursor: "pointer", background: "none" }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
