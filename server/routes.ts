import { Router, type Request, type Response } from "express";
import { storage, getLevelFromTotalXp, xpForLevel } from "./storage";
import { requireAuth, hashPassword } from "./auth";
import { insertUserSchema, insertProgramSchema, insertRoutineSchema, insertWorkoutLogSchema } from "../shared/schema";
import { z } from "zod";

const router = Router();

// ─── Auth ────────────────────────────────────────────────────────────────────

router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password, displayName, avatarClass } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(400).json({ error: "Email already in use" });
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) return res.status(400).json({ error: "Username already taken" });

    const user = await storage.createUser({
      username, email,
      password: hashPassword(password),
      displayName: displayName || username,
      avatarClass: avatarClass || "warrior",
      level: 1, xp: 0, totalXp: 0,
    });

    req.session.userId = user.id;
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    req.session.userId = user.id;
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/auth/logout", (req: Request, res: Response) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/auth/me", requireAuth, async (req: Request, res: Response) => {
  const user = await storage.getUser(req.session.userId!);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { password: _, ...safeUser } = user;
  const levelInfo = getLevelFromTotalXp(user.totalXp);
  res.json({ user: { ...safeUser, ...levelInfo, xpToNextLevel: xpForLevel(user.level) } });
});

// ─── Exercises ───────────────────────────────────────────────────────────────

router.get("/exercises", requireAuth, async (req: Request, res: Response) => {
  const list = await storage.getExercises();
  res.json(list);
});

// ─── Programs ────────────────────────────────────────────────────────────────

router.get("/programs", requireAuth, async (req: Request, res: Response) => {
  const list = await storage.getPrograms(req.session.userId!);
  res.json(list);
});

router.get("/programs/public", requireAuth, async (req: Request, res: Response) => {
  const list = await storage.getPublicPrograms();
  res.json(list);
});

router.post("/programs", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = insertProgramSchema.parse({ ...req.body, userId: req.session.userId });
    const program = await storage.createProgram(data);
    res.json(program);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/programs/:id", requireAuth, async (req: Request, res: Response) => {
  const program = await storage.updateProgram(Number(req.params.id), req.body);
  res.json(program);
});

router.delete("/programs/:id", requireAuth, async (req: Request, res: Response) => {
  await storage.deleteProgram(Number(req.params.id));
  res.json({ ok: true });
});

// ─── Routines ────────────────────────────────────────────────────────────────

router.get("/routines", requireAuth, async (req: Request, res: Response) => {
  const list = await storage.getRoutines(req.session.userId!);
  res.json(list);
});

router.get("/routines/:id", requireAuth, async (req: Request, res: Response) => {
  const routine = await storage.getRoutine(Number(req.params.id));
  if (!routine) return res.status(404).json({ error: "Not found" });
  res.json(routine);
});

router.post("/routines", requireAuth, async (req: Request, res: Response) => {
  try {
    const data = insertRoutineSchema.parse({ ...req.body, userId: req.session.userId });
    const routine = await storage.createRoutine(data);
    res.json(routine);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/routines/:id", requireAuth, async (req: Request, res: Response) => {
  const routine = await storage.updateRoutine(Number(req.params.id), req.body);
  res.json(routine);
});

router.delete("/routines/:id", requireAuth, async (req: Request, res: Response) => {
  await storage.deleteRoutine(Number(req.params.id));
  res.json({ ok: true });
});

// ─── Workout Logs ─────────────────────────────────────────────────────────────

router.get("/workouts", requireAuth, async (req: Request, res: Response) => {
  const logs = await storage.getWorkoutLogs(req.session.userId!);
  res.json(logs);
});

router.post("/workouts", requireAuth, async (req: Request, res: Response) => {
  try {
    const { exercises: exs, durationMinutes, name, routineId, notes } = req.body;

    // Calculate XP: base 20 + per exercise set XP
    let xpEarned = 20 + Math.floor((durationMinutes || 0) * 0.5);
    if (Array.isArray(exs)) {
      xpEarned += exs.reduce((sum: number, ex: any) => {
        return sum + (ex.sets?.length || 0) * 10;
      }, 0);
    }

    const log = await storage.logWorkout({
      userId: req.session.userId!,
      routineId: routineId || null,
      name,
      exercises: exs || [],
      durationMinutes: durationMinutes || null,
      xpEarned,
      notes: notes || null,
    });

    const updatedUser = await storage.addXpToUser(req.session.userId!, xpEarned);
    const newlyUnlocked = await storage.checkAndUnlockAchievements(req.session.userId!);
    const { password: _, ...safeUser } = updatedUser;

    res.json({ log, user: safeUser, xpEarned, newAchievements: newlyUnlocked });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/workouts/stats", requireAuth, async (req: Request, res: Response) => {
  const stats = await storage.getWorkoutStats(req.session.userId!);
  res.json(stats);
});

// ─── Achievements ─────────────────────────────────────────────────────────────

router.get("/achievements", requireAuth, async (req: Request, res: Response) => {
  const [all, userAchs] = await Promise.all([
    storage.getAllAchievements(),
    storage.getUserAchievements(req.session.userId!),
  ]);
  const unlockedIds = new Set(userAchs.map(u => u.achievementId));
  res.json({
    achievements: all.map(a => ({ ...a, unlocked: unlockedIds.has(a.id) })),
    userAchievements: userAchs,
  });
});

export default router;
