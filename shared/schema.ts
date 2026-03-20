import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0),
  avatarClass: text("avatar_class").notNull().default("warrior"), // warrior, mage, ranger
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // chest, back, legs, shoulders, arms, core, cardio
  muscleGroups: text("muscle_groups").array(),
  description: text("description"),
  xpReward: integer("xp_reward").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  daysPerWeek: integer("days_per_week").notNull().default(3),
  difficulty: text("difficulty").notNull().default("beginner"), // beginner, intermediate, advanced
  isPublic: boolean("is_public").notNull().default(false),
  weeks: jsonb("weeks").notNull().default([]), // array of week objects
  createdAt: timestamp("created_at").defaultNow(),
});

export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  programId: integer("program_id").references(() => programs.id),
  name: text("name").notNull(),
  exercises: jsonb("exercises").notNull().default([]), // [{exerciseId, sets, reps, weight, restSeconds}]
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  routineId: integer("routine_id").references(() => routines.id),
  name: text("name").notNull(),
  exercises: jsonb("exercises").notNull().default([]), // completed sets with actual values
  durationMinutes: integer("duration_minutes"),
  xpEarned: integer("xp_earned").notNull().default(0),
  notes: text("notes"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull().default(50),
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true, createdAt: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true });
export const insertRoutineSchema = createInsertSchema(routines).omit({ id: true, createdAt: true });
export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({ id: true, completedAt: true });

export type User = typeof users.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertRoutine = z.infer<typeof insertRoutineSchema>;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;
