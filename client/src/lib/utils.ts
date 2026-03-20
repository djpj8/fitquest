import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export const CATEGORY_COLORS: Record<string, string> = {
  chest: "hsl(0 70% 55%)",
  back: "hsl(200 70% 55%)",
  legs: "hsl(130 60% 50%)",
  shoulders: "hsl(280 60% 60%)",
  arms: "hsl(30 80% 55%)",
  core: "hsl(43 85% 55%)",
  cardio: "hsl(160 70% 50%)",
};

export const CATEGORY_ICONS: Record<string, string> = {
  chest: "💪", back: "🦅", legs: "🦵", shoulders: "🔱", arms: "💪", core: "🎯", cardio: "🔥",
};
