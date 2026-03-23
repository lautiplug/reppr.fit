import type { MuscleGroup, WeekDay } from "@/types";

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  legs: 'Piernas',
  glutes: 'Glúteos',
  core: 'Core',
  calves: 'Pantorrillas',
  forearms: 'Antebrazos',
}

export const WEEK_KEYS: WeekDay[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export const DAY_LABELS: Record<WeekDay, string> = {
  L: 'Lunes',
  M: 'Martes',
  X: 'Miércoles',
  J: 'Jueves',
  V: 'Viernes',
  S: 'Sábado',
  D: 'Domingo',
}
