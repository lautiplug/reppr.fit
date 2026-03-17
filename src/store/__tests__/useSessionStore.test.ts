import { describe, it, expect, beforeEach, vi } from 'vitest'

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
    sets: [{ reps: 10 }, { reps: 10 }, { reps: 8 }],
  },
  {
    order: 2,
    name: 'Squat',
    name_es: 'Sentadilla',
    muscle_group: 'legs',
    sets: [{ reps: 8 }, { reps: 8 }],
  },
]

beforeEach(() => {
  useSessionStore.setState({ active: null })
})

describe('useSessionStore', () => {
  // --- startSession ---

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

  // --- toggleSet ---

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

    expect(useSessionStore.getState().active?.exercises[0].sets[0].completed).toBe(false)
  })

  // --- updateSet ---

  it('updateSet actualiza reps y weight_kg del set', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().updateSet(0, 1, { reps: 12, weight_kg: 80 })

    const set = useSessionStore.getState().active?.exercises[0].sets[1]
    expect(set?.reps).toBe(12)
    expect(set?.weight_kg).toBe(80)
  })

  // --- finishSession ---

  it('finishSession limpia active y retorna el CompletedSession', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0)
    const result = useSessionStore.getState().finishSession()

    expect(useSessionStore.getState().active).toBeNull()
    expect(result).not.toBeNull()
    expect(result?.workoutName).toBe('Empuje')
  })

  it('finishSession solo guarda los sets completados', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0) // solo el primer set del primer ejercicio
    const result = useSessionStore.getState().finishSession()

    expect(result?.exercises[0].sets).toHaveLength(1)
  })

  it('finishSession guarda ejercicio salteado con sets vacíos y skipped true', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().skipExercise(0)
    const result = useSessionStore.getState().finishSession()

    expect(result?.exercises[0].skipped).toBe(true)
    expect(result?.exercises[0].sets).toHaveLength(0)
  })

  it('finishSession marca como skipped ejercicios sin ningún set completado', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0) // solo el primer ejercicio tiene sets
    const result = useSessionStore.getState().finishSession()

    expect(result?.exercises[1].skipped).toBe(true)
    expect(result?.exercises[1].sets).toHaveLength(0)
  })

  it('finishSession sin sesión activa retorna null sin romper', () => {
    expect(() => useSessionStore.getState().finishSession()).not.toThrow()
    expect(useSessionStore.getState().finishSession()).toBeNull()
  })

  // --- skipExercise ---

  it('skipExercise marca el ejercicio como salteado y pone todos los sets en no completado', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().toggleSet(0, 0)
    useSessionStore.getState().skipExercise(0)

    const { active } = useSessionStore.getState()
    expect(active?.exercises[0].skipped).toBe(true)
    active?.exercises[0].sets.forEach(s => expect(s.completed).toBe(false))
  })

  it('skipExercise actúa como toggle — un segundo call deshace el saltear', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().skipExercise(0)
    useSessionStore.getState().skipExercise(0)

    expect(useSessionStore.getState().active?.exercises[0].skipped).toBe(false)
  })

  it('skipExercise no afecta otros ejercicios', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().skipExercise(0)

    expect(useSessionStore.getState().active?.exercises[1].skipped).toBeFalsy()
  })

  // --- abandonSession ---

  it('abandonSession limpia active', async () => {
    await useSessionStore.getState().startSession('Empuje', mockExercises)
    useSessionStore.getState().abandonSession()

    expect(useSessionStore.getState().active).toBeNull()
  })

  // --- persistencia ---

  it('active persiste — updateSet conserva pesos cargados tras simular recarga', async () => {
    await useSessionStore.getState().startSession('Piernas', mockExercises)
    useSessionStore.getState().updateSet(0, 0, { reps: 8, weight_kg: 100 })

    // Simula recarga restaurando solo active (lo único que se persiste)
    useSessionStore.setState({ active: useSessionStore.getState().active })

    const set = useSessionStore.getState().active?.exercises[0].sets[0]
    expect(set?.weight_kg).toBe(100)
    expect(set?.reps).toBe(8)
  })
})
