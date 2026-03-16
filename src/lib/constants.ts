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

export const WEEK_KEYS: WeekDay[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']

export const DAY_LABELS: Record<WeekDay, string> = {
  lun: 'Lunes',
  mar: 'Martes',
  mie: 'Miércoles',
  jue: 'Jueves',
  vie: 'Viernes',
  sab: 'Sábado',
  dom: 'Domingo',
}
