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
  muscle_group: MuscleGroup
  secondary_muscles?: MuscleGroup[]
  description?: string
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

export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  updated_at: string
}
