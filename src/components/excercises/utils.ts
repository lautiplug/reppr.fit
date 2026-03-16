import type { WeekDay } from "@/types";

const DAY_NAMES: Record<WeekDay, string> = {
  lun: "LUNES", mar: "MARTES", mie: "MIÉRCOLES",
  jue: "JUEVES", vie: "VIERNES", sab: "SÁBADO", dom: "DOMINGO",
};

export function getDayLabel(day: WeekDay): string {
  return DAY_NAMES[day];
}

export function getTodayKey(): WeekDay {
  const map: Record<number, WeekDay> = {
    1: "lun", 2: "mar", 3: "mie", 4: "jue", 5: "vie", 6: "sab", 0: "dom",
  };
  return map[new Date().getDay()];
}
