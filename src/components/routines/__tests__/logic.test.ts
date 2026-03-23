import { describe, it, expect } from 'vitest'
import { generateSchedule } from '../generateSchedule'
import type { RoutineSetupAnswers, CompletedSession } from '@/types'

// ─── generateSchedule ────────────────────────────────────────────────────────

describe('generateSchedule', () => {
  const base: RoutineSetupAnswers = {
    goal: 'muscle',
    level: 'intermediate',
    daysPerWeek: 3,
    equipment: 'full_gym',
  }

  it('genera exactamente 7 días', () => {
    const schedule = generateSchedule(base)
    expect(Object.keys(schedule)).toHaveLength(7)
  })

  it('genera el número correcto de días de entrenamiento', () => {
    const schedule = generateSchedule(base)
    const trainingDays = Object.values(schedule).filter(d => d?.type === 'training')
    expect(trainingDays).toHaveLength(3)
  })

  it('el resto de los días son descanso', () => {
    const schedule = generateSchedule(base)
    const restDays = Object.values(schedule).filter(d => d?.type === 'rest')
    expect(restDays).toHaveLength(4)
  })

  it('cada día de entrenamiento tiene ejercicios', () => {
    const schedule = generateSchedule(base)
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        expect(day.exercises.length).toBeGreaterThan(0)
      }
    })
  })

  it('intermediate genera 4 sets por ejercicio', () => {
    const schedule = generateSchedule(base)
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach(ex => {
          expect(ex.sets).toHaveLength(4)
        })
      }
    })
  })

  it('beginner genera 3 sets por ejercicio', () => {
    const schedule = generateSchedule({ ...base, level: 'beginner' })
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach(ex => {
          expect(ex.sets).toHaveLength(3)
        })
      }
    })
  })

  it('advanced genera 5 sets por ejercicio', () => {
    const schedule = generateSchedule({ ...base, level: 'advanced' })
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach(ex => {
          expect(ex.sets).toHaveLength(5)
        })
      }
    })
  })

  it('bodyweight no incluye grupos musculares no disponibles (calves, glutes, forearms)', () => {
    const schedule = generateSchedule({ ...base, equipment: 'bodyweight' })
    const forbidden = new Set(['calves', 'forearms', 'glutes'])
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach(ex => {
          expect(forbidden.has(ex.muscle_group ?? '')).toBe(false)
        })
      }
    })
  })

  it('respeta daysPerWeek para distintos valores', () => {
    for (const days of [2, 3, 4, 5, 6]) {
      const schedule = generateSchedule({ ...base, daysPerWeek: days })
      const trainingDays = Object.values(schedule).filter(d => d?.type === 'training')
      expect(trainingDays).toHaveLength(days)
    }
  })

  it('todos los goals válidos generan un schedule', () => {
    const goals = ['muscle', 'fat_loss', 'maintain', 'performance'] as const
    for (const goal of goals) {
      const schedule = generateSchedule({ ...base, goal })
      const trainingDays = Object.values(schedule).filter(d => d?.type === 'training')
      expect(trainingDays).toHaveLength(base.daysPerWeek)
    }
  })

  it('los ejercicios tienen order correlativo empezando en 1', () => {
    const schedule = generateSchedule(base)
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach((ex, i) => {
          expect(ex.order).toBe(i + 1)
        })
      }
    })
  })
})

// ─── completedToday ───────────────────────────────────────────────────────────

function completedToday(workoutName: string, history: CompletedSession[]): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return history.some(s => s.date.slice(0, 10) === today && s.workoutName === workoutName)
}

describe('completedToday', () => {
  const makeSession = (overrides: Partial<CompletedSession> = {}): CompletedSession => ({
    id: 'abc',
    workoutName: 'Empuje',
    date: new Date().toISOString(),
    durationMin: 45,
    exercises: [],
    ...overrides,
  })

  it('devuelve true si hay una sesión de hoy con ese workoutName', () => {
    expect(completedToday('Empuje', [makeSession()])).toBe(true)
  })

  it('devuelve false si la sesión es de ayer', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString()
    expect(completedToday('Empuje', [makeSession({ date: yesterday })])).toBe(false)
  })

  it('devuelve false si el workoutName no coincide', () => {
    expect(completedToday('Piernas', [makeSession({ workoutName: 'Empuje' })])).toBe(false)
  })

  it('devuelve false con historial vacío', () => {
    expect(completedToday('Empuje', [])).toBe(false)
  })

  it('devuelve true cuando hay múltiples sesiones y una coincide', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString()
    const history = [
      makeSession({ workoutName: 'Piernas', date: yesterday }),
      makeSession({ workoutName: 'Empuje' }),
    ]
    expect(completedToday('Empuje', history)).toBe(true)
  })
})

// ─── inferStep ────────────────────────────────────────────────────────────────

function inferStep(draft: Partial<RoutineSetupAnswers> | null): number {
  if (!draft) return -1
  if (!draft.goal) return 0
  if (!draft.level) return 1
  if (!draft.daysPerWeek) return 2
  if (!draft.equipment) return 3
  return 3
}

describe('inferStep', () => {
  it('retorna -1 sin draft', () => {
    expect(inferStep(null)).toBe(-1)
  })

  it('retorna 0 si draft existe pero no tiene goal', () => {
    expect(inferStep({})).toBe(0)
  })

  it('retorna 1 si tiene goal pero no level', () => {
    expect(inferStep({ goal: 'muscle' })).toBe(1)
  })

  it('retorna 2 si tiene goal y level pero no daysPerWeek', () => {
    expect(inferStep({ goal: 'muscle', level: 'beginner' })).toBe(2)
  })

  it('retorna 3 si tiene goal, level y daysPerWeek pero no equipment', () => {
    expect(inferStep({ goal: 'muscle', level: 'beginner', daysPerWeek: 3 })).toBe(3)
  })

  it('retorna 3 si el draft está completo', () => {
    expect(inferStep({ goal: 'muscle', level: 'beginner', daysPerWeek: 3, equipment: 'full_gym' })).toBe(3)
  })
})
