import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../lib/utils";
import ExerciseLibrary, { type Exercise } from "../components/ExerciseLibrary";

const STATIC_EXERCISES = new Set([
  // Plank variations
  "plank", "side plank",
  // Hold exercises
  "hollow body hold", "l-sit", "pike hold", "dead hang",
  // Handstand holds
  "wall handstand", "handstand",
  // Advanced statics
  "front lever", "back lever", "planche", "human flag",
]);
const isStatic = (name: string) => STATIC_EXERCISES.has(name.toLowerCase());

interface SetEntry { reps: number; seconds: number; weight: number; completed: boolean; }
interface WorkoutExercise { exercise: Exercise; sets: SetEntry[]; }

interface XPResult { log: any; user: any; xpEarned: number; newAchievements: string[]; }

export default function LogWorkout({ onNavigate, initialRoutineId }: { onNavigate: (p: string) => void; initialRoutineId?: number }) {
  const qc = useQueryClient();
  const { data: exercises = [] } = useQuery<Exercise[]>({ queryKey: ["exercises"], queryFn: () => api.get("/exercises") });
  const { data: routines = [] } = useQuery<any[]>({ queryKey: ["routines"], queryFn: () => api.get("/routines") });

  const getDefaultName = () => `Quest — ${new Date().toLocaleDateString("en", { month: "short", day: "numeric" })}`;
  const [workoutName, setWorkoutName] = useState(getDefaultName());
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<XPResult | null>(null);
  const [notes, setNotes] = useState("");
  const [routineLoaded, setRoutineLoaded] = useState(false);

  const addExercise = (ex: Exercise) => {
    if (workoutExercises.find(w => w.exercise.id === ex.id)) return;
    setWorkoutExercises(p => [...p, { exercise: ex, sets: [{ reps: 10, seconds: 30, weight: 0, completed: false }] }]);
  };

  const addSet = (exIdx: number) => {
    setWorkoutExercises(p => p.map((w, i) => i === exIdx
      ? { ...w, sets: [...w.sets, { ...w.sets[w.sets.length - 1], completed: false }] }
      : w
    ));
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof SetEntry, value: any) => {
    setWorkoutExercises(p => p.map((w, i) => i === exIdx
      ? { ...w, sets: w.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s) }
      : w
    ));
  };

  const removeExercise = (exIdx: number) => {
    setWorkoutExercises(p => p.filter((_, i) => i !== exIdx));
  };

  const logMutation = useMutation({
    mutationFn: () => {
      const durationMinutes = Math.floor((Date.now() - startTime) / 60000);
      return api.post<XPResult>("/workouts", {
        name: workoutName,
        exercises: workoutExercises.map(w => ({
          exerciseId: w.exercise.id,
          name: w.exercise.name,
          sets: w.sets.filter(s => s.completed),
        })),
        durationMinutes: Math.max(1, durationMinutes),
        notes,
      });
    },
    onSuccess: (data) => {
      setResult(data);
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const loadRoutine = (routine: any) => {
    const exMap = new Map(exercises.map(e => [e.id, e]));
    const loaded: WorkoutExercise[] = (routine.exercises || []).map((re: any) => {
      const ex = exMap.get(re.exerciseId);
      if (!ex) return null;
      const staticEx = isStatic(ex.name);
      return {
        exercise: ex,
        sets: Array.from({ length: re.sets || 3 }, () => ({
          reps: staticEx ? 1 : (re.reps || 10),
          seconds: staticEx ? 30 : 0,
          weight: re.weight || 0,
          completed: false,
        }))
      };
    }).filter(Boolean);
    setWorkoutExercises(loaded as WorkoutExercise[]);
    setWorkoutName(routine.name);
    setRoutineLoaded(true);
  };

  // Auto-load routine when exercises/routines are ready
  if (initialRoutineId && !routineLoaded && exercises.length > 0 && routines.length > 0) {
    const routine = (routines as any[]).find(r => r.id === initialRoutineId);
    if (routine) loadRoutine(routine);
  }

  if (result) {
    return (
      <div className="p-6 fade-in max-w-lg mx-auto">
        <div className="rpg-card p-8 text-center" style={{ borderColor: "hsl(43 85% 40%)", boxShadow: "0 0 40px hsl(43 85% 20% / 0.3)" }}>
          <div className="text-6xl mb-4 achievement-unlock">🏆</div>
          <h2 className="text-3xl mb-2 gold-shimmer" style={{ fontFamily: "var(--font-serif)" }}>Quest Complete!</h2>
          <p className="mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Your power grows stronger...</p>

          <div className="text-5xl font-bold mb-2" style={{ fontFamily: "var(--font-serif)", color: "hsl(160 60% 50%)" }}>
            +{result.xpEarned} XP
          </div>
          <div className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Experience Gained</div>

          {result.newAchievements.length > 0 && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: "hsl(43 85% 20% / 0.3)", border: "1px solid hsl(43 85% 40%)" }}>
              <div className="text-sm font-bold mb-2" style={{ color: "hsl(var(--primary))" }}>🎉 New Achievements Unlocked!</div>
              {result.newAchievements.map(a => (
                <div key={a} className="text-sm" style={{ color: "hsl(var(--foreground))" }}>✨ {a.replace(/_/g, " ")}</div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-lg" style={{ background: "hsl(var(--muted))" }}>
              <div className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))" }}>
                Lv. {result.user.level}
              </div>
              <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Current Level</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: "hsl(var(--muted))" }}>
              <div className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)", color: "hsl(160 60% 50%)" }}>
                {result.user.totalXp?.toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Total XP</div>
            </div>
          </div>

          <button onClick={() => onNavigate("dashboard")}
            className="w-full py-3 rounded-lg font-bold"
            style={{ fontFamily: "var(--font-serif)", background: "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))", color: "hsl(220 20% 6%)" }}>
            Return to Base Camp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 fade-in">
      <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-serif)" }}>⚔️ Log Workout</h1>
      <p className="mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Record your quest and earn XP</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: workout builder */}
        <div className="space-y-4">
          <div className="rpg-card p-4">
            <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
              QUEST NAME
            </label>
            <input
              value={workoutName}
              onChange={e => setWorkoutName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            />
          </div>

          {/* Load routine */}
          {routines.length > 0 && (
            <div className="rpg-card p-4">
              <label className="block text-xs mb-3" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
                📋 CARICA ROUTINE
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.5rem" }}>
                {routines.map((r: any) => (
                  <button key={r.id} onClick={() => loadRoutine(r)}
                    style={{
                      padding: "0.625rem 0.75rem",
                      borderRadius: "0.5rem",
                      border: `1px solid ${workoutName === r.name ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                      background: workoutName === r.name ? "hsl(43 85% 20% / 0.4)" : "hsl(var(--muted))",
                      color: workoutName === r.name ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: workoutName === r.name ? "bold" : "normal",
                      fontFamily: workoutName === r.name ? "var(--font-serif)" : "inherit",
                      display: "flex", alignItems: "center", gap: "0.375rem",
                      boxShadow: workoutName === r.name ? "0 0 10px hsl(43 85% 30% / 0.3)" : "none",
                    }}>
                    <span>{workoutName === r.name ? "✓" : "📋"}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  </button>
                ))}
              </div>
              {workoutName !== `Quest — ${new Date().toLocaleDateString("en", { month: "short", day: "numeric" })}` && (
                <button
                  onClick={() => { setWorkoutExercises([]); setWorkoutName(`Quest — ${new Date().toLocaleDateString("en", { month: "short", day: "numeric" })}`); }}
                  style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  ✕ Svuota workout
                </button>
              )}
            </div>
          )}

          {/* Exercises in workout */}
          {workoutExercises.length === 0 ? (
            <div className="rpg-card p-8 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
              <div className="text-4xl mb-3">💪</div>
              <p>Add exercises from the list →</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workoutExercises.map((we, exIdx) => (
                <div key={we.exercise.id} className="rpg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold" style={{ color: "hsl(var(--primary))", fontFamily: "var(--font-serif)" }}>
                        {we.exercise.name}
                      </span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{
                        background: `${CATEGORY_COLORS[we.exercise.category]}22`,
                        color: CATEGORY_COLORS[we.exercise.category],
                        border: `1px solid ${CATEGORY_COLORS[we.exercise.category]}44`,
                      }}>
                        {CATEGORY_ICONS[we.exercise.category]} {we.exercise.category}
                      </span>
                    </div>
                    <button onClick={() => removeExercise(exIdx)} style={{ color: "hsl(var(--muted-foreground))" }}>✕</button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>
                      <span>SET</span>
                      <span>{isStatic(we.exercise.name) ? "SEC" : "REPS"}</span>
                      <span>KG</span>
                      <span>DONE</span>
                    </div>
                    {we.sets.map((set, setIdx) => (
                      <div key={setIdx} className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-sm text-center" style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
                          {setIdx + 1}
                        </span>
                        <input
                          type="number" min="1"
                          value={isStatic(we.exercise.name) ? set.seconds : set.reps}
                          onChange={e => updateSet(exIdx, setIdx, isStatic(we.exercise.name) ? "seconds" : "reps", +e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm text-center outline-none"
                          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        />
                        <input type="number" min="0" step="0.5" value={set.weight}
                          onChange={e => updateSet(exIdx, setIdx, "weight", +e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm text-center outline-none"
                          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        />
                        <div className="flex justify-center">
                          <button onClick={() => updateSet(exIdx, setIdx, "completed", !set.completed)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
                            style={{
                              background: set.completed ? "hsl(160 60% 50%)" : "hsl(var(--muted))",
                              border: `1px solid ${set.completed ? "hsl(160 60% 40%)" : "hsl(var(--border))"}`,
                            }}>
                            {set.completed ? "✓" : ""}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addSet(exIdx)}
                      className="text-xs mt-1 transition-all"
                      style={{ color: "hsl(var(--primary))", background: "none", border: "none", cursor: "pointer" }}>
                      + Add set
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="rpg-card p-4">
            <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
              QUEST NOTES
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="How did it feel? Personal records?"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            />
          </div>

          <button
            onClick={() => logMutation.mutate()}
            disabled={workoutExercises.length === 0 || logMutation.isPending}
            className="w-full py-3 rounded-lg font-bold transition-all"
            style={{
              fontFamily: "var(--font-serif)",
              letterSpacing: "0.05em",
              background: workoutExercises.length === 0 ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))",
              color: workoutExercises.length === 0 ? "hsl(var(--muted-foreground))" : "hsl(220 20% 6%)",
              cursor: workoutExercises.length === 0 ? "not-allowed" : "pointer",
            }}>
            {logMutation.isPending ? "⏳ Saving..." : "🏆 Complete Quest"}
          </button>
        </div>

        {/* Right: exercise browser */}
        <ExerciseLibrary
          onSelect={addExercise}
          selectedIds={workoutExercises.map(w => w.exercise.id)}
          showSelectButton={true}
        />
      </div>
    </div>
  );
}
