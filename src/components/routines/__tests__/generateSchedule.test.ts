import { describe, it, expect } from 'vitest'
import { generateSchedule } from '../generateSchedule'
import type { RoutineSetupAnswers } from '@/types'

const base: RoutineSetupAnswers = {
  goal: 'muscle',
  level: 'intermediate',
  daysPerWeek: 3,
  equipment: 'full_gym',
}

describe('generateSchedule', () => {
  it('siempre devuelve los 7 días de la semana', () => {
    const schedule = generateSchedule(base)
    const days = Object.keys(schedule)
    expect(days).toHaveLength(7)
    expect(days).toEqual(expect.arrayContaining(['L', 'M', 'X', 'J', 'V', 'S', 'D']))
  })

  it('el número de días de entrenamiento coincide con daysPerWeek', () => {
    for (const days of [2, 3, 4, 5, 6]) {
      const schedule = generateSchedule({ ...base, daysPerWeek: days })
      const trainingDays = Object.values(schedule).filter(d => d?.type === 'training')
      expect(trainingDays).toHaveLength(days)
    }
  })

  it('los días restantes son de descanso', () => {
    const schedule = generateSchedule({ ...base, daysPerWeek: 3 })
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

  it('los ejercicios tienen sets válidos según el nivel', () => {
    const schedule = generateSchedule({ ...base, level: 'beginner' })
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach(ex => {
          expect(ex.sets).toHaveLength(3) // beginner = 3 sets
          ex.sets.forEach(s => expect(s.reps).toBeGreaterThan(0))
        })
      }
    })
  })

  it('nivel advanced tiene más sets que beginner', () => {
    const beginner = generateSchedule({ ...base, level: 'beginner' })
    const advanced = generateSchedule({ ...base, level: 'advanced' })

    const firstTrainingBeginner = Object.values(beginner).find(d => d?.type === 'training')
    const firstTrainingAdvanced = Object.values(advanced).find(d => d?.type === 'training')

    if (firstTrainingBeginner?.type === 'training' && firstTrainingAdvanced?.type === 'training') {
      expect(firstTrainingAdvanced.exercises[0].sets.length)
        .toBeGreaterThan(firstTrainingBeginner.exercises[0].sets.length)
    }
  })

  it('bodyweight no incluye glutes ni calves como muscle_group', () => {
    const schedule = generateSchedule({ ...base, equipment: 'bodyweight', daysPerWeek: 3 })
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach(ex => {
          expect(ex.muscle_group).not.toBe('glutes')
          expect(ex.muscle_group).not.toBe('calves')
        })
      }
    })
  })

  it('home_weights no incluye calves ni forearms como muscle_group', () => {
    const schedule = generateSchedule({ ...base, equipment: 'home_weights', daysPerWeek: 3 })
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach(ex => {
          expect(ex.muscle_group).not.toBe('calves')
          expect(ex.muscle_group).not.toBe('forearms')
        })
      }
    })
  })

  it('todos los ejercicios tienen name, name_es y muscle_group', () => {
    const schedule = generateSchedule(base)
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach(ex => {
          expect(ex.name).toBeTruthy()
          expect(ex.name_es).toBeTruthy()
          expect(ex.muscle_group).toBeTruthy()
        })
      }
    })
  })

  it('los ejercicios tienen order secuencial empezando en 1', () => {
    const schedule = generateSchedule(base)
    Object.values(schedule).forEach(day => {
      if (day?.type === 'training') {
        day.exercises.forEach((ex, i) => {
          expect(ex.order).toBe(i + 1)
        })
      }
    })
  })

  it('funciona con todos los goals', () => {
    const goals = ['muscle', 'fat_loss', 'maintain', 'performance'] as const
    goals.forEach(goal => {
      expect(() => generateSchedule({ ...base, goal })).not.toThrow()
      const schedule = generateSchedule({ ...base, goal })
      const trainingDays = Object.values(schedule).filter(d => d?.type === 'training')
      expect(trainingDays).toHaveLength(base.daysPerWeek)
    })
  })
})
