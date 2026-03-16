import { useState } from "react";
import type { ExerciseSet } from "@/types";

export function summarizeSets(sets: ExerciseSet[]): string {
  const count = sets.length;
  const allSameReps = sets.every((s) => s.reps === sets[0].reps);
  const allSameWeight = sets.every((s) => s.weight_kg === sets[0].weight_kg);

  const repsLabel = allSameReps
    ? String(sets[0].reps)
    : sets.map((s) => (s.reps === "fallo" ? "f" : String(s.reps))).join("/");

  if (allSameWeight) {
    const weight = sets[0].weight_kg;
    return weight != null ? `${count} × ${repsLabel} · ${weight}kg` : `${count} × ${repsLabel}`;
  }

  const weights = sets.map((s) => s.weight_kg).filter((w): w is number => w != null);
  if (weights.length === 0) return `${count} × ${repsLabel}`;

  if (weights.length === sets.length) {
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const isDescending = weights[0] > weights[weights.length - 1];
    return `${count} × ${repsLabel} · ${isDescending ? `${max}→${min}` : `${min}→${max}`}kg`;
  }

  return `${count} × ${repsLabel}`;
}

export function usePlanExercise(initialSets: ExerciseSet[]) {
  const [sets, setSets] = useState<ExerciseSet[]>(initialSets);
  const [expanded, setExpanded] = useState(false);

  const handleChange = (i: number, field: "reps" | "weight_kg", value: string) => {
    setSets(prev => prev.map((s, idx) => {
      if (idx !== i) return s;
      if (field === "reps")
        return { ...s, reps: value === "f" || value === "fallo" ? "fallo" : parseInt(value) || s.reps };
      return { ...s, weight_kg: value === "" ? undefined : parseFloat(value) };
    }));
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    setSets(prev => [...prev, { reps: last?.reps ?? 10, weight_kg: last?.weight_kg }]);
  };

  const removeLastSet = () => setSets(prev => prev.slice(0, -1));

  const toggleExpanded = () => setExpanded(v => !v);

  return { sets, expanded, toggleExpanded, handleChange, addSet, removeLastSet };
}
