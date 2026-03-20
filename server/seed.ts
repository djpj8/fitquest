import { db } from "./db";
import { exercises, achievements } from "../shared/schema";

const seedExercises = [
  // Chest
  { name: "Bench Press", category: "chest", muscleGroups: ["pectorals", "triceps", "front deltoid"], xpReward: 15 },
  { name: "Incline Bench Press", category: "chest", muscleGroups: ["upper pectorals", "triceps"], xpReward: 15 },
  { name: "Push-Up", category: "chest", muscleGroups: ["pectorals", "triceps", "core"], xpReward: 8 },
  { name: "Dumbbell Fly", category: "chest", muscleGroups: ["pectorals"], xpReward: 12 },
  { name: "Cable Crossover", category: "chest", muscleGroups: ["pectorals"], xpReward: 12 },
  // Back
  { name: "Pull-Up", category: "back", muscleGroups: ["lats", "biceps", "rhomboids"], xpReward: 15 },
  { name: "Barbell Row", category: "back", muscleGroups: ["lats", "rhomboids", "biceps"], xpReward: 15 },
  { name: "Lat Pulldown", category: "back", muscleGroups: ["lats", "biceps"], xpReward: 12 },
  { name: "Seated Cable Row", category: "back", muscleGroups: ["rhomboids", "lats", "biceps"], xpReward: 12 },
  { name: "Deadlift", category: "back", muscleGroups: ["lower back", "glutes", "hamstrings", "lats"], xpReward: 20 },
  // Legs
  { name: "Squat", category: "legs", muscleGroups: ["quadriceps", "glutes", "hamstrings"], xpReward: 20 },
  { name: "Romanian Deadlift", category: "legs", muscleGroups: ["hamstrings", "glutes"], xpReward: 15 },
  { name: "Leg Press", category: "legs", muscleGroups: ["quadriceps", "glutes"], xpReward: 15 },
  { name: "Lunges", category: "legs", muscleGroups: ["quadriceps", "glutes", "hamstrings"], xpReward: 12 },
  { name: "Leg Curl", category: "legs", muscleGroups: ["hamstrings"], xpReward: 10 },
  { name: "Calf Raise", category: "legs", muscleGroups: ["calves"], xpReward: 8 },
  // Shoulders
  { name: "Overhead Press", category: "shoulders", muscleGroups: ["deltoids", "triceps"], xpReward: 15 },
  { name: "Lateral Raise", category: "shoulders", muscleGroups: ["lateral deltoid"], xpReward: 10 },
  { name: "Face Pull", category: "shoulders", muscleGroups: ["rear deltoid", "rotator cuff"], xpReward: 10 },
  { name: "Arnold Press", category: "shoulders", muscleGroups: ["deltoids", "triceps"], xpReward: 12 },
  // Arms
  { name: "Barbell Curl", category: "arms", muscleGroups: ["biceps"], xpReward: 10 },
  { name: "Hammer Curl", category: "arms", muscleGroups: ["biceps", "brachialis"], xpReward: 10 },
  { name: "Tricep Pushdown", category: "arms", muscleGroups: ["triceps"], xpReward: 10 },
  { name: "Skull Crusher", category: "arms", muscleGroups: ["triceps"], xpReward: 12 },
  { name: "Preacher Curl", category: "arms", muscleGroups: ["biceps"], xpReward: 10 },
  // Core
  { name: "Plank", category: "core", muscleGroups: ["core", "lower back"], xpReward: 8 },
  { name: "Crunch", category: "core", muscleGroups: ["abs"], xpReward: 6 },
  { name: "Leg Raise", category: "core", muscleGroups: ["lower abs", "hip flexors"], xpReward: 8 },
  { name: "Russian Twist", category: "core", muscleGroups: ["obliques", "abs"], xpReward: 8 },
  // Cardio
  { name: "Running", category: "cardio", muscleGroups: ["cardiovascular", "legs"], xpReward: 12 },
  { name: "Cycling", category: "cardio", muscleGroups: ["cardiovascular", "legs"], xpReward: 10 },
  { name: "Jump Rope", category: "cardio", muscleGroups: ["cardiovascular", "calves"], xpReward: 10 },
  { name: "Rowing Machine", category: "cardio", muscleGroups: ["cardiovascular", "back", "arms"], xpReward: 12 },
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
  console.log("Seeding exercises...");
  for (const ex of seedExercises) {
    await db.insert(exercises).values(ex).onConflictDoNothing();
  }
  console.log("Seeding achievements...");
  for (const ach of seedAchievements) {
    await db.insert(achievements).values(ach).onConflictDoNothing();
  }
  console.log("Seed complete!");
}
