export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'calves'
  | 'forearms'

export interface Exercise {
  id: string
  name: string
  name_es?: string
  muscle_group: MuscleGroup
  secondary_muscles?: MuscleGroup[]
  description?: string
  gif_url?: string
  created_at: string
}

export interface RoutineExercise {
  id: string
  routine_id: string
  exercise_id: string
  exercise?: Exercise
  sets: number
  reps: number
  rest_seconds: number
  order: number
}

export interface Routine {
  id: string
  user_id: string
  name: string
  description?: string
  exercises?: RoutineExercise[]
  created_at: string
  updated_at: string
}

export interface SetLog {
  id: string
  session_exercise_id: string
  set_number: number
  reps: number
  weight_kg: number
  completed: boolean
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_id: string
  exercise?: Exercise
  sets: SetLog[]
  order: number
}

export interface Session {
  id: string
  user_id: string
  routine_id?: string
  routine?: Routine
  name: string
  started_at: string
  finished_at?: string
  exercises?: SessionExercise[]
}

// --- Session history ---

export interface CompletedSet {
  reps: number | 'fallo'
  weight_kg?: number
}

export interface CompletedExercise {
  name: string
  name_es?: string
  skipped?: boolean
  sets: CompletedSet[]
}

export interface CompletedSession {
  id: string
  workoutName: string
  date: string          // ISO string
  durationMin: number
  exercises: CompletedExercise[]
}

export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  updated_at: string
}

// --- Routines setup ---

export type TrainingGoal = 'muscle' | 'fat_loss' | 'maintain' | 'performance'
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced'
export type Equipment = 'full_gym' | 'home_weights' | 'bodyweight'

export interface RoutineSetupAnswers {
  goal: TrainingGoal
  level: TrainingLevel
  daysPerWeek: number        // 2–6
  equipment: Equipment
}

// Maps setup answers to a week schedule
export type WeekSchedule = Partial<Record<WeekDay, DaySchedule>>

// --- Sessions view ---

export type WeekTemplate = {
  id: string
  name: string
  description: string
  popular?: boolean
  days: Partial<Record<WeekDay, string>> // e.g. { lun: 'P', mie: 'Tr', vie: 'Pi' }
}

export type WeekDay = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom'

export interface ExerciseSet {
  reps: number | 'fallo'
  weight_kg?: number
}

export interface VolumeParams {
  sets: number
  repsRange: string
  restSeconds: number
}

export type DaySchedule =
  | { type: 'training'; workoutName: string; muscleGroups: string[]; exercises: DayExercise[]; volume?: VolumeParams }
  | { type: 'rest' }

export interface DayExercise {
  order: number
  name: string
  name_es?: string
  sets: ExerciseSet[]
  muscle_group?: MuscleGroup
  gif_url?: string
}
