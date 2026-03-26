import { db } from "./db";
import { exercises, achievements } from "../shared/schema";
import { eq, and, isNull } from "drizzle-orm";
import { sql } from "drizzle-orm";

const seedExercises = [
  // ── GYM: Chest ──
  { name: "Bench Press", category: "chest", type: "gym", muscleGroups: ["pectorals", "triceps", "front deltoid"], xpReward: 15 },
  { name: "Incline Bench Press", category: "chest", type: "gym", muscleGroups: ["upper pectorals", "triceps"], xpReward: 15 },
  { name: "Dumbbell Fly", category: "chest", type: "gym", muscleGroups: ["pectorals"], xpReward: 12 },
  { name: "Cable Crossover", category: "chest", type: "gym", muscleGroups: ["pectorals"], xpReward: 12 },
  { name: "Pec Deck", category: "chest", type: "gym", muscleGroups: ["pectorals"], xpReward: 10 },
  // ── GYM: Back ──
  { name: "Barbell Row", category: "back", type: "gym", muscleGroups: ["lats", "rhomboids", "biceps"], xpReward: 15 },
  { name: "Lat Pulldown", category: "back", type: "gym", muscleGroups: ["lats", "biceps"], xpReward: 12 },
  { name: "Seated Cable Row", category: "back", type: "gym", muscleGroups: ["rhomboids", "lats"], xpReward: 12 },
  { name: "Deadlift", category: "back", type: "gym", muscleGroups: ["lower back", "glutes", "hamstrings", "lats"], xpReward: 20 },
  { name: "T-Bar Row", category: "back", type: "gym", muscleGroups: ["lats", "rhomboids"], xpReward: 14 },
  // ── GYM: Legs ──
  { name: "Squat", category: "legs", type: "gym", muscleGroups: ["quadriceps", "glutes", "hamstrings"], xpReward: 20 },
  { name: "Romanian Deadlift", category: "legs", type: "gym", muscleGroups: ["hamstrings", "glutes"], xpReward: 15 },
  { name: "Leg Press", category: "legs", type: "gym", muscleGroups: ["quadriceps", "glutes"], xpReward: 15 },
  { name: "Leg Curl", category: "legs", type: "gym", muscleGroups: ["hamstrings"], xpReward: 10 },
  { name: "Leg Extension", category: "legs", type: "gym", muscleGroups: ["quadriceps"], xpReward: 10 },
  { name: "Calf Raise", category: "legs", type: "gym", muscleGroups: ["calves"], xpReward: 8 },
  { name: "Hip Thrust", category: "legs", type: "gym", muscleGroups: ["glutes", "hamstrings"], xpReward: 14 },
  // ── GYM: Shoulders ──
  { name: "Overhead Press", category: "shoulders", type: "gym", muscleGroups: ["deltoids", "triceps"], xpReward: 15 },
  { name: "Lateral Raise", category: "shoulders", type: "gym", muscleGroups: ["lateral deltoid"], xpReward: 10 },
  { name: "Face Pull", category: "shoulders", type: "gym", muscleGroups: ["rear deltoid", "rotator cuff"], xpReward: 10 },
  { name: "Arnold Press", category: "shoulders", type: "gym", muscleGroups: ["deltoids", "triceps"], xpReward: 12 },
  { name: "Rear Delt Fly", category: "shoulders", type: "gym", muscleGroups: ["rear deltoid"], xpReward: 10 },
  // ── GYM: Arms ──
  { name: "Barbell Curl", category: "arms", type: "gym", muscleGroups: ["biceps"], xpReward: 10 },
  { name: "Hammer Curl", category: "arms", type: "gym", muscleGroups: ["biceps", "brachialis"], xpReward: 10 },
  { name: "Tricep Pushdown", category: "arms", type: "gym", muscleGroups: ["triceps"], xpReward: 10 },
  { name: "Skull Crusher", category: "arms", type: "gym", muscleGroups: ["triceps"], xpReward: 12 },
  { name: "Preacher Curl", category: "arms", type: "gym", muscleGroups: ["biceps"], xpReward: 10 },
  { name: "Cable Curl", category: "arms", type: "gym", muscleGroups: ["biceps"], xpReward: 10 },
  // ── GYM: Core ──
  { name: "Cable Crunch", category: "core", type: "gym", muscleGroups: ["abs"], xpReward: 10 },
  { name: "Ab Wheel Rollout", category: "core", type: "gym", muscleGroups: ["abs", "core"], xpReward: 14 },
  // ── GYM: Cardio ──
  { name: "Treadmill Run", category: "cardio", type: "gym", muscleGroups: ["cardiovascular", "legs"], xpReward: 12 },
  { name: "Cycling", category: "cardio", type: "gym", muscleGroups: ["cardiovascular", "legs"], xpReward: 10 },
  { name: "Rowing Machine", category: "cardio", type: "gym", muscleGroups: ["cardiovascular", "back", "arms"], xpReward: 12 },
  { name: "Stairmaster", category: "cardio", type: "gym", muscleGroups: ["cardiovascular", "legs", "glutes"], xpReward: 12 },
  { name: "Elliptical", category: "cardio", type: "gym", muscleGroups: ["cardiovascular", "full body"], xpReward: 10 },

  // ── CALISTHENICS: Chest ──
  { name: "Push-Up", category: "chest", type: "calisthenics", muscleGroups: ["pectorals", "triceps", "core"], xpReward: 8 },
  { name: "Wide Push-Up", category: "chest", type: "calisthenics", muscleGroups: ["pectorals"], xpReward: 8 },
  { name: "Diamond Push-Up", category: "chest", type: "calisthenics", muscleGroups: ["triceps", "inner pectorals"], xpReward: 10 },
  { name: "Archer Push-Up", category: "chest", type: "calisthenics", muscleGroups: ["pectorals", "triceps"], xpReward: 14 },
  { name: "Pike Push-Up", category: "chest", type: "calisthenics", muscleGroups: ["shoulders", "triceps"], xpReward: 10 },
  { name: "Pseudo Planche Push-Up", category: "chest", type: "calisthenics", muscleGroups: ["pectorals", "shoulders", "core"], xpReward: 16 },
  { name: "Ring Push-Up", category: "chest", type: "calisthenics", muscleGroups: ["pectorals", "stabilizers"], xpReward: 12 },
  // ── CALISTHENICS: Back ──
  { name: "Pull-Up", category: "back", type: "calisthenics", muscleGroups: ["lats", "biceps", "rhomboids"], xpReward: 15 },
  { name: "Chin-Up", category: "back", type: "calisthenics", muscleGroups: ["biceps", "lats"], xpReward: 14 },
  { name: "Neutral Grip Pull-Up", category: "back", type: "calisthenics", muscleGroups: ["lats", "biceps"], xpReward: 14 },
  { name: "Inverted Row", category: "back", type: "calisthenics", muscleGroups: ["rhomboids", "lats", "biceps"], xpReward: 12 },
  { name: "Australian Pull-Up", category: "back", type: "calisthenics", muscleGroups: ["lats", "rhomboids"], xpReward: 10 },
  { name: "Muscle-Up", category: "back", type: "calisthenics", muscleGroups: ["lats", "triceps", "chest"], xpReward: 25 },
  { name: "Front Lever Row", category: "back", type: "calisthenics", muscleGroups: ["lats", "core"], xpReward: 22 },
  { name: "Typewriter Pull-Up", category: "back", type: "calisthenics", muscleGroups: ["lats", "biceps"], xpReward: 18 },
  // ── CALISTHENICS: Legs ──
  { name: "Bodyweight Squat", category: "legs", type: "calisthenics", muscleGroups: ["quadriceps", "glutes"], xpReward: 8 },
  { name: "Jump Squat", category: "legs", type: "calisthenics", muscleGroups: ["quadriceps", "glutes", "calves"], xpReward: 12 },
  { name: "Pistol Squat", category: "legs", type: "calisthenics", muscleGroups: ["quadriceps", "glutes", "balance"], xpReward: 20 },
  { name: "Lunges", category: "legs", type: "calisthenics", muscleGroups: ["quadriceps", "glutes", "hamstrings"], xpReward: 10 },
  { name: "Bulgarian Split Squat", category: "legs", type: "calisthenics", muscleGroups: ["quadriceps", "glutes"], xpReward: 14 },
  { name: "Nordic Curl", category: "legs", type: "calisthenics", muscleGroups: ["hamstrings"], xpReward: 18 },
  { name: "Glute Bridge", category: "legs", type: "calisthenics", muscleGroups: ["glutes", "hamstrings"], xpReward: 8 },
  { name: "Single Leg Calf Raise", category: "legs", type: "calisthenics", muscleGroups: ["calves"], xpReward: 8 },
  { name: "Step-Up", category: "legs", type: "calisthenics", muscleGroups: ["quadriceps", "glutes"], xpReward: 10 },
  // ── CALISTHENICS: Shoulders ──
  { name: "Handstand Push-Up", category: "shoulders", type: "calisthenics", muscleGroups: ["deltoids", "triceps"], xpReward: 22 },
  { name: "Wall Handstand", category: "shoulders", type: "calisthenics", muscleGroups: ["deltoids", "core"], xpReward: 15 },
  { name: "Decline Push-Up", category: "shoulders", type: "calisthenics", muscleGroups: ["upper chest", "shoulders"], xpReward: 10 },
  { name: "Pike Hold", category: "shoulders", type: "calisthenics", muscleGroups: ["shoulders", "core"], xpReward: 10 },
  // ── CALISTHENICS: Arms ──
  { name: "Chin-Up Curl", category: "arms", type: "calisthenics", muscleGroups: ["biceps"], xpReward: 12 },
  { name: "Ring Curl", category: "arms", type: "calisthenics", muscleGroups: ["biceps"], xpReward: 12 },
  { name: "Tricep Dip", category: "arms", type: "calisthenics", muscleGroups: ["triceps", "chest"], xpReward: 12 },
  { name: "Ring Dip", category: "arms", type: "calisthenics", muscleGroups: ["triceps", "chest", "stabilizers"], xpReward: 16 },
  { name: "Close Grip Push-Up", category: "arms", type: "calisthenics", muscleGroups: ["triceps"], xpReward: 10 },
  // ── CALISTHENICS: Core ──
  { name: "Plank", category: "core", type: "calisthenics", muscleGroups: ["core", "lower back"], xpReward: 8 },
  { name: "Side Plank", category: "core", type: "calisthenics", muscleGroups: ["obliques", "core"], xpReward: 8 },
  { name: "Hollow Body Hold", category: "core", type: "calisthenics", muscleGroups: ["abs", "core"], xpReward: 12 },
  { name: "L-Sit", category: "core", type: "calisthenics", muscleGroups: ["abs", "hip flexors", "triceps"], xpReward: 18 },
  { name: "Dragon Flag", category: "core", type: "calisthenics", muscleGroups: ["abs", "core"], xpReward: 22 },
  { name: "Hanging Leg Raise", category: "core", type: "calisthenics", muscleGroups: ["lower abs", "hip flexors"], xpReward: 14 },
  { name: "Toes to Bar", category: "core", type: "calisthenics", muscleGroups: ["abs", "hip flexors", "lats"], xpReward: 16 },
  { name: "Crunch", category: "core", type: "calisthenics", muscleGroups: ["abs"], xpReward: 6 },
  { name: "Russian Twist", category: "core", type: "calisthenics", muscleGroups: ["obliques", "abs"], xpReward: 8 },
  { name: "Mountain Climber", category: "core", type: "calisthenics", muscleGroups: ["core", "cardio"], xpReward: 10 },
  { name: "V-Up", category: "core", type: "calisthenics", muscleGroups: ["abs", "hip flexors"], xpReward: 10 },
  // ── CALISTHENICS: Cardio ──
  { name: "Burpee", category: "cardio", type: "calisthenics", muscleGroups: ["full body", "cardiovascular"], xpReward: 14 },
  { name: "Jump Rope", category: "cardio", type: "calisthenics", muscleGroups: ["cardiovascular", "calves"], xpReward: 10 },
  { name: "Box Jump", category: "cardio", type: "calisthenics", muscleGroups: ["legs", "cardiovascular"], xpReward: 12 },
  { name: "High Knees", category: "cardio", type: "calisthenics", muscleGroups: ["cardiovascular", "legs"], xpReward: 8 },
  { name: "Running", category: "cardio", type: "calisthenics", muscleGroups: ["cardiovascular", "legs"], xpReward: 12 },
  { name: "Bear Crawl", category: "cardio", type: "calisthenics", muscleGroups: ["full body", "core"], xpReward: 12 },
  // ── CALISTHENICS: Skills ──
  { name: "Handstand", category: "core", type: "calisthenics", muscleGroups: ["shoulders", "core", "balance"], xpReward: 20 },
  { name: "Front Lever", category: "back", type: "calisthenics", muscleGroups: ["lats", "core", "rhomboids"], xpReward: 28 },
  { name: "Back Lever", category: "back", type: "calisthenics", muscleGroups: ["biceps", "chest", "core"], xpReward: 26 },
  { name: "Planche", category: "chest", type: "calisthenics", muscleGroups: ["pectorals", "shoulders", "core"], xpReward: 30 },
  { name: "Human Flag", category: "core", type: "calisthenics", muscleGroups: ["obliques", "lats", "core"], xpReward: 30 },
];

const seedAchievements = [
  { key: "first_workout", name: "First Blood", description: "Complete your first workout", icon: "⚔️", xpReward: 50, rarity: "common" },
  { key: "ten_workouts", name: "Seasoned Warrior", description: "Complete 10 workouts", icon: "🛡️", xpReward: 150, rarity: "rare" },
  { key: "fifty_workouts", name: "Legendary Champion", description: "Complete 50 workouts", icon: "👑", xpReward: 500, rarity: "legendary" },
  { key: "level_5", name: "Rising Power", description: "Reach Level 5", icon: "⚡", xpReward: 100, rarity: "common" },
  { key: "level_10", name: "Elite Warrior", description: "Reach Level 10", icon: "🔥", xpReward: 300, rarity: "rare" },
  { key: "level_20", name: "Mythic Legend", description: "Reach Level 20", icon: "💎", xpReward: 1000, rarity: "legendary" },
  { key: "streak_week", name: "Iron Will", description: "Work out 5 times in a week", icon: "🏆", xpReward: 200, rarity: "epic" },
];

export async function seed() {
  // Remove duplicates already in DB (keep lowest id per name)
  await db.execute(sql`
    DELETE FROM exercises
    WHERE id NOT IN (
      SELECT MIN(id) FROM exercises
      WHERE user_id IS NULL
      GROUP BY name
    )
    AND user_id IS NULL
  `);

  // Insert only missing exercises
  console.log("Seeding exercises...");
  for (const ex of seedExercises) {
    const existing = await db.select().from(exercises)
      .where(and(eq(exercises.name, ex.name), isNull(exercises.userId)))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(exercises).values(ex);
    }
  }

  // Insert only missing achievements
  console.log("Seeding achievements...");
  for (const ach of seedAchievements) {
    const existing = await db.select().from(achievements)
      .where(eq(achievements.key, ach.key))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(achievements).values(ach);
    }
  }

  console.log("Seed complete!");
}
