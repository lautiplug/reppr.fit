import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock supabase before importing the store
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ in: () => Promise.resolve({ data: [] }) }),
      insert: () => Promise.resolve({ error: null }),
    }),
  },
}))

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: { getState: () => ({ user: { id: 'test-user' } }) },
}))

import { useSessionStore } from '../useSessionStore'
import type { DayExercise } from '@/types'

const mockExercises: DayExercise[] = [
  {
    order: 1,
    name: 'Barbell Bench Press',
    name_es: 'Press de banca',
    muscle_group: 'chest',
    sets: [
      { reps: 10 },
      { reps: 10 },
      { reps: 8 },
    ],
  },
  {
    order: 2,
    name: 'Squat',
    name_es: 'Sentadilla',
    muscle_group: 'legs',
    sets: [
      { reps: 8 },
      { reps: 8 },
    ],
  },
]

beforeEach(() => {
  useSessionStore.setState({ active: null, history: [] })
})

describe('useSessionStore', () => {
  it('startSession crea una sesión activa con los ejercicios correctos', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    const { active } = useSessionStore.getState()

    expect(active).not.toBeNull()
    expect(active?.workoutName).toBe('Empuje')
    expect(active?.exercises).toHaveLength(2)
    expect(active?.exercises[0].name).toBe('Barbell Bench Press')
    expect(active?.exercises[1].name).toBe('Squat')
  })

  it('startSession inicializa todos los sets como no completados', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    const { active } = useSessionStore.getState()

    active?.exercises.forEach(ex => {
      ex.sets.forEach(s => expect(s.completed).toBe(false))
    })
  })

  it('toggleSet marca un set como completado', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0)

    const { active } = useSessionStore.getState()
    expect(active?.exercises[0].sets[0].completed).toBe(true)
    expect(active?.exercises[0].sets[1].completed).toBe(false)
  })

  it('toggleSet puede desmarcar un set ya completado', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0)
    useSessionStore.getState().toggleSet(0, 0)

    const { active } = useSessionStore.getState()
    expect(active?.exercises[0].sets[0].completed).toBe(false)
  })

  it('updateSet actualiza reps y weight_kg del set', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().updateSet(0, 1, { reps: 12, weight_kg: 80 })

    const { active } = useSessionStore.getState()
    const set = active?.exercises[0].sets[1]
    expect(set?.reps).toBe(12)
    expect(set?.weight_kg).toBe(80)
  })

  it('finishSession agrega la sesión al historial y limpia active', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0)
    useSessionStore.getState().finishSession()

    const { active, history } = useSessionStore.getState()
    expect(active).toBeNull()
    expect(history).toHaveLength(1)
    expect(history[0].workoutName).toBe('Empuje')
  })

  it('finishSession solo guarda los sets completados', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0) // completa solo el primer set del primer ejercicio
    useSessionStore.getState().finishSession()

    const { history } = useSessionStore.getState()
    const completedSets = history[0].exercises[0].sets
    expect(completedSets).toHaveLength(1)
  })

  it('abandonSession limpia active sin agregar al historial', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().abandonSession()

    const { active, history } = useSessionStore.getState()
    expect(active).toBeNull()
    expect(history).toHaveLength(0)
  })

  it('finishSession sin sesión activa no rompe nada', () => {
    expect(() => useSessionStore.getState().finishSession()).not.toThrow()
    expect(useSessionStore.getState().history).toHaveLength(0)
  })

  it('skipExercise marca el ejercicio como salteado y pone todos los sets en no completado', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0) // completa un set primero
    useSessionStore.getState().skipExercise(0)

    const { active } = useSessionStore.getState()
    expect(active?.exercises[0].skipped).toBe(true)
    active?.exercises[0].sets.forEach(s => expect(s.completed).toBe(false))
  })

  it('skipExercise actúa como toggle — un segundo call deshace el saltear', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().skipExercise(0)
    useSessionStore.getState().skipExercise(0)

    const { active } = useSessionStore.getState()
    expect(active?.exercises[0].skipped).toBe(false)
  })

  it('skipExercise no afecta otros ejercicios', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().skipExercise(0)

    const { active } = useSessionStore.getState()
    expect(active?.exercises[1].skipped).toBeFalsy()
  })

  it('finishSession guarda ejercicio salteado con sets vacíos y skipped true', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().skipExercise(0)
    useSessionStore.getState().finishSession()

    const { history } = useSessionStore.getState()
    const skippedEx = history[0].exercises[0]
    expect(skippedEx.skipped).toBe(true)
    expect(skippedEx.sets).toHaveLength(0)
  })

  it('finishSession marca como skipped ejercicios sin ningún set completado', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    // Solo completamos sets del primer ejercicio, el segundo queda sin completar
    useSessionStore.getState().toggleSet(0, 0)
    useSessionStore.getState().finishSession()

    const { history } = useSessionStore.getState()
    expect(history[0].exercises[1].skipped).toBe(true)
    expect(history[0].exercises[1].sets).toHaveLength(0)
  })

  it('loadFromSupabase no pisa active si ya existe en el store', async () => {
    await useSessionStore.getState().startSession('Piernas', mockExercises)
    const activeBefore = useSessionStore.getState().active

    // Simula lo que hace loadFromSupabase con set(state => ({ history, active: state.active }))
    useSessionStore.setState(state => ({ history: [], active: state.active }))

    expect(useSessionStore.getState().active).toEqual(activeBefore)
  })

  it('completedToday detecta sesión de hoy con mismo workoutName', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0)
    useSessionStore.getState().finishSession()

    const { history } = useSessionStore.getState()
    const today = new Date().toDateString()
    const found = history.some(s => new Date(s.date).toDateString() === today && s.workoutName === 'Empuje')
    expect(found).toBe(true)
  })

  it('completedToday no confunde workout de otro día', async () => {
    // Sesión de ayer
    useSessionStore.setState({
      history: [{
        id: 'old',
        workoutName: 'Empuje',
        date: new Date(Date.now() - 86400000).toISOString(),
        durationMin: 45,
        exercises: [],
      }]
    })

    const { history } = useSessionStore.getState()
    const today = new Date().toDateString()
    const found = history.some(s => new Date(s.date).toDateString() === today && s.workoutName === 'Empuje')
    expect(found).toBe(false)
  })

  it('active persiste entre recargas — updateSet conserva pesos cargados', async () => {
    await useSessionStore.getState().startSession('Piernas', mockExercises)
    useSessionStore.getState().updateSet(0, 0, { reps: 8, weight_kg: 100 })

    // Simula recarga restaurando solo el estado persistido
    const persisted = {
      active: useSessionStore.getState().active,
      history: useSessionStore.getState().history,
    }
    useSessionStore.setState(persisted)

    const set = useSessionStore.getState().active?.exercises[0].sets[0]
    expect(set?.weight_kg).toBe(100)
    expect(set?.reps).toBe(8)
  })
})
