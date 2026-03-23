import type { WeekDay } from "@/types";

const DAY_NAMES: Record<WeekDay, string> = {
  L: "LUNES", M: "MARTES", X: "MIÉRCOLES",
  J: "JUEVES", V: "VIERNES", S: "SÁBADO", D: "DOMINGO",
};

export function getDayLabel(day: WeekDay): string {
  return DAY_NAMES[day];
}

/** Returns the URL for the second flip frame (1.jpg) given the first (0.jpg) */
export function getFlipImageUrl(gif_url: string): string {
  return gif_url.replace(/\/0\.jpg$/, '/1.jpg');
}

export function getTodayKey(): WeekDay {
  const map: Record<number, WeekDay> = {
    1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S", 0: "D",
  };
  return map[new Date().getDay()];
}
