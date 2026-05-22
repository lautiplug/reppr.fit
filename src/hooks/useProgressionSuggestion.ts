import type { ActiveSet } from '@/store/useSessionStore'
import type { CompletedSession, CompletedSet } from '../types'

export interface ProgressionSuggestion {
  lastWeight: number
  lastReps: number | 'fallo'
  lastRIR: number | null
  suggestedWeight: number | null  // null cuando no hay RIR para decidir
  reason: 'increase' | 'maintain' | null
}

export interface IntraSessionSuggestion {
  suggestedWeight: number
  reason: 'reduce' | 'maintain' | 'increase'
  // Contexto para mostrar en el chip
  prevWeight: number
  prevReps: number | 'fallo'
  prevRIR: number | null
  expectedReps: number | null  // reps de referencia (historial)
}

function roundTo2_5(value: number): number {
  return Math.round(value / 2.5) * 2.5
}

function getTopSet(sets: CompletedSet[]): CompletedSet | null {
  const withWeight = sets.filter(s => s.weight_kg != null && s.weight_kg > 0)
  if (withWeight.length === 0) return null
  return withWeight.reduce((best, s) => (s.weight_kg! > best.weight_kg! ? s : best))
}

export function useProgressionSuggestion(
  exerciseName: string,
  history: CompletedSession[],
): ProgressionSuggestion | null {
  // Find most recent session containing this exercise (non-skipped)
  for (const session of history) {
    const ex = session.exercises.find(
      e => e.name === exerciseName && !e.skipped && e.sets.length > 0,
    )
    if (!ex) continue

    const topSet = getTopSet(ex.sets)
    if (!topSet || topSet.weight_kg == null) continue

    const lastWeight = topSet.weight_kg
    const lastReps = topSet.reps
    const lastRIR = topSet.rir ?? null

    // Sin RIR: solo contexto, sin sugerencia de peso
    if (lastRIR === null) {
      return { lastWeight, lastReps, lastRIR: null, suggestedWeight: null, reason: null }
    }

    // Llegó al fallo o RIR 0: mantener
    if (lastReps === 'fallo' || lastRIR === 0) {
      return {
        lastWeight,
        lastReps,
        lastRIR,
        suggestedWeight: lastWeight,
        reason: 'maintain',
      }
    }

    // RIR 1-2: +2.5kg
    if (lastRIR <= 2) {
      return {
        lastWeight,
        lastReps,
        lastRIR,
        suggestedWeight: roundTo2_5(lastWeight + 2.5),
        reason: 'increase',
      }
    }

    // RIR 3+: +5kg
    return {
      lastWeight,
      lastReps,
      lastRIR,
      suggestedWeight: roundTo2_5(lastWeight + 5),
      reason: 'increase',
    }
  }

  return null
}

/**
 * Sugiere el peso para el siguiente set basándose en el rendimiento
 * de los sets ya completados en la sesión actual.
 *
 * expectedReps: las reps que el usuario hizo la última vez con ese peso
 * (viene del historial). Si no hay historial, se usa el promedio de los
 * sets completados como referencia interna.
 */
export function getIntraSessionSuggestion(
  completedSets: ActiveSet[],
  expectedReps: number | null,
): IntraSessionSuggestion | null {
  const done = completedSets.filter(s => s.completed && s.weight_kg != null && s.weight_kg > 0)
  if (done.length === 0) return null

  const prev = done[done.length - 1]   // último set completado
  const first = done[0]                 // primer set: estado fresco, referencia base
  const prevWeight = prev.weight_kg!
  const prevReps = prev.reps
  const prevRIR = prev.rir ?? null
  const firstReps = first.reps

  // Si falló: bajar peso
  if (prevReps === 'fallo') {
    return {
      suggestedWeight: roundTo2_5(prevWeight - 5),
      reason: 'reduce',
      prevWeight,
      prevReps,
      prevRIR,
      expectedReps,
    }
  }

  const reps = prevReps as number

  // Comparar contra la primera serie (estado fresco), no contra la anterior.
  // Si solo hay una serie completada, comparar contra el plan como fallback.
  // Una caída gradual intra-sesión es normal — solo intervenir si es pronunciada (<60%).
  const referenceReps = done.length > 1 && firstReps !== 'fallo' ? (firstReps as number) : expectedReps
  if (referenceReps !== null && reps / referenceReps < 0.6) {
    return {
      suggestedWeight: roundTo2_5(prevWeight - 5),
      reason: 'reduce',
      prevWeight,
      prevReps,
      prevRIR,
      expectedReps,
    }
  }

  // Sin referencia histórica o rendimiento normal: usar RIR si existe
  if (prevRIR !== null) {
    if (prevRIR === 0) {
      return { suggestedWeight: prevWeight, reason: 'maintain', prevWeight, prevReps, prevRIR, expectedReps }
    }
    if (prevRIR >= 3) {
      return { suggestedWeight: roundTo2_5(prevWeight + 2.5), reason: 'increase', prevWeight, prevReps, prevRIR, expectedReps }
    }
  }

  // Mantener el mismo peso por defecto
  return { suggestedWeight: prevWeight, reason: 'maintain', prevWeight, prevReps, prevRIR, expectedReps }
}
