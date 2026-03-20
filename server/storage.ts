import { eq, desc, and, sql, or, isNull } from "drizzle-orm";
import { db } from "./db";
import {
  users, exercises, programs, routines, workoutLogs, achievements, userAchievements, favoriteExercises,
  type User, type Exercise, type Program, type Routine, type WorkoutLog,
  type Achievement, type UserAchievement, type InsertUser, type InsertProgram,
  type InsertRoutine, type InsertWorkoutLog,
} from "../shared/schema";

// XP needed per level (exponential growth)
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromTotalXp(totalXp: number): { level: number; currentXp: number; xpToNext: number } {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (accumulated + needed > totalXp) {
      return { level, currentXp: totalXp - accumulated, xpToNext: needed };
    }
    accumulated += needed;
    level++;
  }
}

export const storage = {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  },
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },
  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },
  async addXpToUser(userId: number, xp: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const newTotalXp = user.totalXp + xp;
    const { level, currentXp } = getLevelFromTotalXp(newTotalXp);
    const [updated] = await db.update(users)
      .set({ totalXp: newTotalXp, xp: currentXp, level })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  },

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return db.select().from(exercises).orderBy(exercises.name);
  },
  async getExercise(id: number): Promise<Exercise | undefined> {
    const [ex] = await db.select().from(exercises).where(eq(exercises.id, id));
    return ex;
  },

  // Programs
  async getPrograms(userId: number): Promise<Program[]> {
    return db.select().from(programs)
      .where(eq(programs.userId, userId))
      .orderBy(desc(programs.createdAt));
  },
  async getPublicPrograms(): Promise<(Program & { author: string })[]> {
    const rows = await db.select({
      ...programs,
      author: users.displayName,
    }).from(programs)
      .leftJoin(users, eq(programs.userId, users.id))
      .where(eq(programs.isPublic, true))
      .orderBy(desc(programs.createdAt));
    return rows.map(r => ({ ...r, author: r.author ?? "Unknown" }));
  },
  async createProgram(data: InsertProgram): Promise<Program> {
    const [program] = await db.insert(programs).values(data).returning();
    return program;
  },
  async updateProgram(id: number, data: Partial<InsertProgram>): Promise<Program> {
    const [program] = await db.update(programs).set(data).where(eq(programs.id, id)).returning();
    return program;
  },
  async deleteProgram(id: number): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  },

  // Routines
  async getRoutines(userId: number): Promise<Routine[]> {
    return db.select().from(routines)
      .where(eq(routines.userId, userId))
      .orderBy(desc(routines.createdAt));
  },
  async getRoutine(id: number): Promise<Routine | undefined> {
    const [routine] = await db.select().from(routines).where(eq(routines.id, id));
    return routine;
  },
  async createRoutine(data: InsertRoutine): Promise<Routine> {
    const [routine] = await db.insert(routines).values(data).returning();
    return routine;
  },
  async updateRoutine(id: number, data: Partial<InsertRoutine>): Promise<Routine> {
    const [routine] = await db.update(routines).set(data).where(eq(routines.id, id)).returning();
    return routine;
  },
  async deleteRoutine(id: number): Promise<void> {
    await db.delete(routines).where(eq(routines.id, id));
  },

  // Workout Logs
  async getWorkoutLogs(userId: number, limit = 20): Promise<WorkoutLog[]> {
    return db.select().from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.completedAt))
      .limit(limit);
  },
  async logWorkout(data: InsertWorkoutLog): Promise<WorkoutLog> {
    const [log] = await db.insert(workoutLogs).values(data).returning();
    return log;
  },
  async getWorkoutStats(userId: number) {
    const logs = await db.select().from(workoutLogs).where(eq(workoutLogs.userId, userId));
    const totalWorkouts = logs.length;
    const totalXpEarned = logs.reduce((sum, l) => sum + l.xpEarned, 0);
    const totalDuration = logs.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = logs.filter(l => l.completedAt && new Date(l.completedAt) >= sevenDaysAgo);

    return { totalWorkouts, totalXpEarned, totalDuration, recentWorkouts: recentLogs.length, recentLogs };
  },

  // Achievements
  async getAllAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements);
  },
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const rows = await db.select({
      ...userAchievements,
      achievement: achievements,
    }).from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
    return rows.filter(r => r.achievement) as any;
  },
  async unlockAchievement(userId: number, achievementKey: string): Promise<void> {
    const [ach] = await db.select().from(achievements).where(eq(achievements.key, achievementKey));
    if (!ach) return;
    const existing = await db.select().from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, ach.id)));
    if (existing.length > 0) return;
    await db.insert(userAchievements).values({ userId, achievementId: ach.id });
    await this.addXpToUser(userId, ach.xpReward);
  },
  async checkAndUnlockAchievements(userId: number): Promise<string[]> {
    const stats = await this.getWorkoutStats(userId);
    const user = await this.getUser(userId);
    if (!user) return [];
    const unlocked: string[] = [];

    const checks = [
      { key: "first_workout", condition: stats.totalWorkouts >= 1 },
      { key: "ten_workouts", condition: stats.totalWorkouts >= 10 },
      { key: "fifty_workouts", condition: stats.totalWorkouts >= 50 },
      { key: "level_5", condition: user.level >= 5 },
      { key: "level_10", condition: user.level >= 10 },
      { key: "level_20", condition: user.level >= 20 },
      { key: "streak_week", condition: stats.recentWorkouts >= 5 },
    ];

    for (const check of checks) {
      if (check.condition) {
        const before = await db.select().from(userAchievements)
          .where(eq(userAchievements.userId, userId));
        await this.unlockAchievement(userId, check.key);
        const after = await db.select().from(userAchievements)
          .where(eq(userAchievements.userId, userId));
        if (after.length > before.length) unlocked.push(check.key);
      }
    }
    return unlocked;
  },
};

// ─── Custom Exercises ──────────────────────────────────────────────────────────
export const exerciseStorage = {
  async getExercises(userId: number): Promise<any[]> {
    return db.select().from(exercises)
      .where(or(isNull(exercises.userId), eq(exercises.userId, userId)))
      .orderBy(exercises.name);
  },
  async createCustomExercise(data: any): Promise<any> {
    const [ex] = await db.insert(exercises).values(data).returning();
    return ex;
  },
  async deleteCustomExercise(id: number, userId: number): Promise<void> {
    await db.delete(exercises)
      .where(and(eq(exercises.id, id), eq(exercises.userId, userId)));
  },

  // ─── Favorites ────────────────────────────────────────────────────────────────
  async getFavorites(userId: number): Promise<any[]> {
    return db.select({ ...exercises })
      .from(favoriteExercises)
      .innerJoin(exercises, eq(favoriteExercises.exerciseId, exercises.id))
      .where(eq(favoriteExercises.userId, userId))
      .orderBy(exercises.name);
  },
  async toggleFavorite(userId: number, exerciseId: number): Promise<boolean> {
    const existing = await db.select().from(favoriteExercises)
      .where(and(eq(favoriteExercises.userId, userId), eq(favoriteExercises.exerciseId, exerciseId)));
    if (existing.length > 0) {
      await db.delete(favoriteExercises)
        .where(and(eq(favoriteExercises.userId, userId), eq(favoriteExercises.exerciseId, exerciseId)));
      return false;
    } else {
      await db.insert(favoriteExercises).values({ userId, exerciseId });
      return true;
    }
  },
  async isFavorite(userId: number, exerciseId: number): Promise<boolean> {
    const res = await db.select().from(favoriteExercises)
      .where(and(eq(favoriteExercises.userId, userId), eq(favoriteExercises.exerciseId, exerciseId)));
    return res.length > 0;
  },
};
