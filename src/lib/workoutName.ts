import type { MuscleGroup } from '@/types'

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
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

const PUSH_MUSCLES: MuscleGroup[] = ['chest', 'shoulders', 'triceps']
const PULL_MUSCLES: MuscleGroup[] = ['back', 'biceps', 'forearms']
const LOWER_MUSCLES: MuscleGroup[] = ['legs', 'glutes', 'calves']

export function suggestWorkoutName(muscles: MuscleGroup[]): string {
  if (muscles.length === 0) return 'Entreno'

  const total = muscles.length
  const threshold = 0.6

  const counts = muscles.reduce<Partial<Record<MuscleGroup, number>>>((acc, m) => {
    acc[m] = (acc[m] ?? 0) + 1
    return acc
  }, {})

  const pushCount = muscles.filter(m => PUSH_MUSCLES.includes(m)).length
  const pullCount = muscles.filter(m => PULL_MUSCLES.includes(m)).length
  const lowerCount = muscles.filter(m => LOWER_MUSCLES.includes(m)).length

  for (const [muscle, count] of Object.entries(counts) as [MuscleGroup, number][]) {
    if (count / total >= threshold) return MUSCLE_LABELS[muscle]
  }

  if (pushCount / total >= threshold) {
    const hasPush = (m: MuscleGroup) => (counts[m] ?? 0) > 0
    if (hasPush('chest') && hasPush('shoulders') && hasPush('triceps')) return 'Empuje'
    if (hasPush('chest') && hasPush('triceps')) return 'Pecho & Tríceps'
    if (hasPush('shoulders') && hasPush('triceps')) return 'Hombros & Tríceps'
    return 'Empuje'
  }

  if (pullCount / total >= threshold) {
    const hasPull = (m: MuscleGroup) => (counts[m] ?? 0) > 0
    if (hasPull('back') && hasPull('biceps')) return 'Tracción'
    return 'Tracción'
  }

  if (lowerCount / total >= threshold) return 'Piernas'

  if (muscles.every(m => m === 'core')) return 'Core'

  return 'Personalizado'
}
