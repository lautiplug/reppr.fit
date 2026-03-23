import { MUSCLE_LABELS } from "@/lib/constants";
import type {
  DaySchedule,
  Equipment,
  MuscleGroup,
  RoutineSetupAnswers,
  TrainingGoal,
  TrainingLevel,
  VolumeParams,
  WeekDay,
  WeekSchedule,
} from "@/types";

// ─── 1. SPLITS ───────────────────────────────────────────────────────────────
// Canonical training splits indexed by (goal, daysPerWeek).
// Each entry is an ordered list of workout days; rest days fill the gaps.

type WorkoutDay = { workoutName: string; muscleGroups: MuscleGroup[] };
type SplitKey = `${TrainingGoal}_${number}`;

const SPLITS: Record<SplitKey, WorkoutDay[]> = {
  // ── muscle ──────────────────────────────────────────────────────────────
  muscle_2: [
    { workoutName: "Tren superior",  muscleGroups: ["chest", "back", "shoulders", "biceps", "triceps"] },
    { workoutName: "Tren inferior",  muscleGroups: ["legs", "glutes", "calves"] },
  ],
  muscle_3: [
    { workoutName: "Empuje",   muscleGroups: ["chest", "shoulders", "triceps"] },
    { workoutName: "Tracción", muscleGroups: ["back", "biceps"] },
    { workoutName: "Piernas",  muscleGroups: ["legs", "glutes", "calves"] },
  ],
  muscle_4: [
    { workoutName: "Tren superior A", muscleGroups: ["chest", "triceps"] },
    { workoutName: "Tren inferior A", muscleGroups: ["legs", "glutes"] },
    { workoutName: "Tren superior B", muscleGroups: ["back", "biceps", "shoulders"] },
    { workoutName: "Tren inferior B", muscleGroups: ["legs", "calves", "core"] },
  ],
  muscle_5: [
    { workoutName: "Empuje",   muscleGroups: ["chest", "shoulders", "triceps"] },
    { workoutName: "Tracción", muscleGroups: ["back", "biceps"] },
    { workoutName: "Piernas",  muscleGroups: ["legs", "glutes", "calves"] },
    { workoutName: "Tren superior", muscleGroups: ["chest", "back", "shoulders"] },
    { workoutName: "Core + Brazos", muscleGroups: ["core", "biceps", "triceps", "forearms"] },
  ],
  muscle_6: [
    { workoutName: "Empuje A",   muscleGroups: ["chest", "shoulders", "triceps"] },
    { workoutName: "Tracción A", muscleGroups: ["back", "biceps"] },
    { workoutName: "Piernas A",  muscleGroups: ["legs", "glutes"] },
    { workoutName: "Empuje B",   muscleGroups: ["chest", "triceps", "shoulders"] },
    { workoutName: "Tracción B", muscleGroups: ["back", "biceps", "forearms"] },
    { workoutName: "Piernas B",  muscleGroups: ["legs", "calves", "core"] },
  ],

  // ── fat_loss ─────────────────────────────────────────────────────────────
  fat_loss_2: [
    { workoutName: "Full Body A", muscleGroups: ["chest", "back", "legs", "core"] },
    { workoutName: "Full Body B", muscleGroups: ["shoulders", "biceps", "triceps", "glutes"] },
  ],
  fat_loss_3: [
    { workoutName: "Full Body A", muscleGroups: ["chest", "back", "legs"] },
    { workoutName: "Full Body B", muscleGroups: ["shoulders", "biceps", "triceps", "core"] },
    { workoutName: "Full Body C", muscleGroups: ["glutes", "legs", "back", "core"] },
  ],
  fat_loss_4: [
    { workoutName: "Tren superior A", muscleGroups: ["chest", "back", "shoulders"] },
    { workoutName: "Tren inferior A", muscleGroups: ["legs", "glutes", "core"] },
    { workoutName: "Tren superior B", muscleGroups: ["biceps", "triceps", "shoulders", "back"] },
    { workoutName: "Tren inferior B", muscleGroups: ["legs", "calves", "glutes", "core"] },
  ],
  fat_loss_5: [
    { workoutName: "Full Body A",     muscleGroups: ["chest", "back", "legs"] },
    { workoutName: "Tren superior",   muscleGroups: ["shoulders", "biceps", "triceps"] },
    { workoutName: "Tren inferior",   muscleGroups: ["legs", "glutes", "calves"] },
    { workoutName: "Full Body B",     muscleGroups: ["back", "chest", "core"] },
    { workoutName: "Core + Brazos",   muscleGroups: ["core", "biceps", "triceps", "forearms"] },
  ],
  fat_loss_6: [
    { workoutName: "Full Body A",     muscleGroups: ["chest", "back", "legs"] },
    { workoutName: "Tren superior A", muscleGroups: ["shoulders", "biceps", "triceps"] },
    { workoutName: "Tren inferior A", muscleGroups: ["legs", "glutes", "calves"] },
    { workoutName: "Full Body B",     muscleGroups: ["back", "chest", "core"] },
    { workoutName: "Tren superior B", muscleGroups: ["chest", "shoulders", "triceps"] },
    { workoutName: "Core + Piernas",  muscleGroups: ["core", "legs", "glutes"] },
  ],

  // ── maintain ─────────────────────────────────────────────────────────────
  maintain_2: [
    { workoutName: "Full Body A", muscleGroups: ["chest", "back", "legs", "core"] },
    { workoutName: "Full Body B", muscleGroups: ["shoulders", "biceps", "triceps", "glutes"] },
  ],
  maintain_3: [
    { workoutName: "Full Body A", muscleGroups: ["chest", "back", "legs"] },
    { workoutName: "Full Body B", muscleGroups: ["shoulders", "biceps", "triceps", "core"] },
    { workoutName: "Full Body C", muscleGroups: ["glutes", "calves", "back", "core"] },
  ],
  maintain_4: [
    { workoutName: "Tren superior A", muscleGroups: ["chest", "back", "shoulders"] },
    { workoutName: "Tren inferior A", muscleGroups: ["legs", "glutes"] },
    { workoutName: "Tren superior B", muscleGroups: ["biceps", "triceps", "shoulders"] },
    { workoutName: "Tren inferior B", muscleGroups: ["legs", "calves", "core"] },
  ],
  maintain_5: [
    { workoutName: "Empuje",      muscleGroups: ["chest", "shoulders", "triceps"] },
    { workoutName: "Tracción",    muscleGroups: ["back", "biceps"] },
    { workoutName: "Piernas",     muscleGroups: ["legs", "glutes", "calves"] },
    { workoutName: "Full Body A", muscleGroups: ["chest", "back", "core"] },
    { workoutName: "Full Body B", muscleGroups: ["shoulders", "biceps", "triceps"] },
  ],
  maintain_6: [
    { workoutName: "Empuje A",   muscleGroups: ["chest", "shoulders", "triceps"] },
    { workoutName: "Tracción A", muscleGroups: ["back", "biceps"] },
    { workoutName: "Piernas A",  muscleGroups: ["legs", "glutes"] },
    { workoutName: "Empuje B",   muscleGroups: ["chest", "triceps"] },
    { workoutName: "Tracción B", muscleGroups: ["back", "shoulders", "forearms"] },
    { workoutName: "Piernas B",  muscleGroups: ["legs", "calves", "core"] },
  ],

  // ── performance ──────────────────────────────────────────────────────────
  performance_2: [
    { workoutName: "Fuerza A", muscleGroups: ["chest", "back", "legs"] },
    { workoutName: "Fuerza B", muscleGroups: ["shoulders", "biceps", "triceps", "core"] },
  ],
  performance_3: [
    { workoutName: "Empuje — Fuerza",   muscleGroups: ["chest", "shoulders", "triceps"] },
    { workoutName: "Tracción — Fuerza", muscleGroups: ["back", "biceps"] },
    { workoutName: "Piernas — Fuerza",  muscleGroups: ["legs", "glutes", "core"] },
  ],
  performance_4: [
    { workoutName: "Fuerza inferior A", muscleGroups: ["legs", "glutes"] },
    { workoutName: "Fuerza superior A", muscleGroups: ["chest", "back", "shoulders"] },
    { workoutName: "Fuerza inferior B", muscleGroups: ["legs", "calves", "core"] },
    { workoutName: "Fuerza superior B", muscleGroups: ["biceps", "triceps", "shoulders", "back"] },
  ],
  performance_5: [
    { workoutName: "Fuerza inferior A", muscleGroups: ["legs", "glutes"] },
    { workoutName: "Fuerza superior A", muscleGroups: ["chest", "back"] },
    { workoutName: "Fuerza inferior B", muscleGroups: ["legs", "calves", "core"] },
    { workoutName: "Fuerza superior B", muscleGroups: ["shoulders", "biceps", "triceps"] },
    { workoutName: "Full Body — Potencia", muscleGroups: ["chest", "back", "legs", "core"] },
  ],
  performance_6: [
    { workoutName: "Empuje — Fuerza A",   muscleGroups: ["chest", "shoulders", "triceps"] },
    { workoutName: "Tracción — Fuerza A", muscleGroups: ["back", "biceps"] },
    { workoutName: "Piernas — Fuerza A",  muscleGroups: ["legs", "glutes"] },
    { workoutName: "Empuje — Fuerza B",   muscleGroups: ["chest", "triceps", "shoulders"] },
    { workoutName: "Tracción — Fuerza B", muscleGroups: ["back", "biceps", "forearms"] },
    { workoutName: "Piernas — Potencia",  muscleGroups: ["legs", "calves", "core"] },
  ],
};

// ─── 2. VOLUME PARAMS ────────────────────────────────────────────────────────

const VOLUME_PARAMS: Record<TrainingLevel, VolumeParams> = {
  beginner:     { sets: 3, repsRange: "10–12", restSeconds: 90 },
  intermediate: { sets: 4, repsRange: "8–10",  restSeconds: 75 },
  advanced:     { sets: 5, repsRange: "5–8",   restSeconds: 60 },
};

// ─── 3. EQUIPMENT FILTER ─────────────────────────────────────────────────────
// Muscle groups available per equipment type.
// home_weights excludes calves (no calf raise machine), forearms (limited).
// bodyweight excludes glutes (hard to isolate), calves, forearms.

const EQUIPMENT_AVAILABLE: Record<Equipment, Set<MuscleGroup>> = {
  full_gym:     new Set(["chest", "back", "shoulders", "biceps", "triceps", "legs", "glutes", "core", "calves", "forearms"]),
  home_weights: new Set(["chest", "back", "shoulders", "biceps", "triceps", "legs", "glutes", "core"]),
  bodyweight:   new Set(["chest", "back", "shoulders", "biceps", "triceps", "legs", "core"]),
};

// Fallback muscle group when the original isn't available with given equipment
const EQUIPMENT_FALLBACK: Partial<Record<MuscleGroup, MuscleGroup>> = {
  calves:    "legs",
  forearms:  "biceps",
  glutes:    "legs",
};

// ─── 4. HELPERS ──────────────────────────────────────────────────────────────

const WEEK_ORDER: WeekDay[] = ["L", "M", "X", "J", "V", "S", "D"];

function pickTrainingDays(count: number): WeekDay[] {
  const step = Math.floor(WEEK_ORDER.length / count);
  return Array.from({ length: count }, (_, i) => WEEK_ORDER[(i * step) % WEEK_ORDER.length]);
}

function filterMuscleGroups(
  muscleGroups: MuscleGroup[],
  equipment: Equipment
): MuscleGroup[] {
  const available = EQUIPMENT_AVAILABLE[equipment];
  return muscleGroups.flatMap((mg) => {
    if (available.has(mg)) return [mg];
    const fallback = EQUIPMENT_FALLBACK[mg];
    return fallback && available.has(fallback) ? [fallback] : [];
  });
}

function getSplit(goal: TrainingGoal, days: number): WorkoutDay[] {
  const key: SplitKey = `${goal}_${days}`;
  if (SPLITS[key]) return SPLITS[key];
  // Fallback: nearest defined split for this goal
  for (const d of [3, 4, 2, 5, 6]) {
    const fallbackKey: SplitKey = `${goal}_${d}`;
    if (SPLITS[fallbackKey]) {
      const base = SPLITS[fallbackKey];
      return Array.from({ length: days }, (_, i) => base[i % base.length]);
    }
  }
  return SPLITS["muscle_3"];
}

// ─── 5. MAIN ─────────────────────────────────────────────────────────────────


import { FEATURED_EXERCISES, exercisesPerMuscle } from "./featuredExercises";

function buildSets(count: number, repsRange: string): import("@/types").ExerciseSet[] {
  // Parse repsRange like "8–10" → use the lower bound as default reps
  const match = repsRange.match(/(\d+)/)
  const reps = match ? parseInt(match[1]) : 10
  return Array.from({ length: count }, () => ({ reps }))
}

function buildExercises(
  muscles: MuscleGroup[],
  equipment: Equipment,
  volume: { sets: number; repsRange: string }
): import("@/types").DayExercise[] {
  const perMuscle = exercisesPerMuscle(muscles.length);
  let order = 1;
  return muscles.flatMap((mg) => {
    const list = FEATURED_EXERCISES[mg]?.[equipment] ?? [];
    return list.slice(0, perMuscle).map((ex) => ({
      order: order++,
      name: ex.name,
      name_es: ex.name_es,
      sets: buildSets(volume.sets, volume.repsRange),
      muscle_group: mg,
    }));
  });
}

export function generateSchedule(answers: RoutineSetupAnswers): WeekSchedule {
  const { goal, level, daysPerWeek, equipment } = answers;

  const split = getSplit(goal, daysPerWeek);
  const volume = VOLUME_PARAMS[level];
  const trainingDays = pickTrainingDays(daysPerWeek);

  const schedule: WeekSchedule = {};

  WEEK_ORDER.forEach((day) => {
    const trainingIndex = trainingDays.indexOf(day);
    if (trainingIndex === -1) {
      schedule[day] = { type: "rest" };
      return;
    }

    const workout = split[trainingIndex % split.length];
    const filteredMuscles = filterMuscleGroups(workout.muscleGroups, equipment);
    const exercises = buildExercises(filteredMuscles, equipment, volume);

    const daySchedule: DaySchedule = {
      type: "training",
      workoutName: workout.workoutName,
      muscleGroups: filteredMuscles.map(mg => MUSCLE_LABELS[mg]),
      exercises,
      volume,
    };

    schedule[day] = daySchedule;
  });

  return schedule;
}
