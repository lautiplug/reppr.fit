import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Check, Pencil } from 'lucide-react'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
import type { WeekDay, MuscleGroup, DayExercise, DaySchedule, Exercise } from '@/types'
import { MUSCLE_LABELS } from '@/lib/constants'
import { useExercises } from '@/hooks/useExercises'
import { useRoutineStore } from '@/store/useRoutineStore'
import { supabase } from '@/lib/supabase'
import { suggestWorkoutName } from '@/lib/workoutName'


const ALL_MUSCLES = Object.keys(MUSCLE_LABELS) as MuscleGroup[]

const DEFAULT_SETS = 3
const DEFAULT_REPS = 10

type SelectedExercise = DayExercise & { muscle_group: MuscleGroup; gif_url?: string }

export const DayEditor = () => {
  const { day } = useParams<{ day: WeekDay }>()
  const navigate = useNavigate()
  const { schedule, updateDay } = useRoutineStore()

  const daySchedule = day && schedule ? schedule[day as WeekDay] : undefined

  const firstMuscle: MuscleGroup = daySchedule?.type === 'training'
    ? (daySchedule.exercises[0]?.muscle_group ?? 'chest') as MuscleGroup
    : 'chest'
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>(firstMuscle)
  const [search, setSearch] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>(
    daySchedule?.type === 'training'
      ? daySchedule.exercises.map(e => ({ ...e, muscle_group: (e.muscle_group ?? 'chest') as MuscleGroup, gif_url: e.gif_url }))
      : []
  )
  const [editingName, setEditingName] = useState(false)

  const initialName = daySchedule?.type === 'training' ? daySchedule.workoutName : ''
  const initialSuggested = suggestWorkoutName(selectedExercises.map(e => e.muscle_group))

  const suggestedName = useMemo(
    () => suggestWorkoutName(selectedExercises.map(e => e.muscle_group)),
    [selectedExercises]
  )

  const [workoutName, setWorkoutName] = useState(initialName)
  // Si el nombre guardado difiere del sugerido al abrir, el usuario lo había editado antes
  const [nameEdited, setNameEdited] = useState(!!initialName && initialName !== initialSuggested)
  const displayName = nameEdited ? workoutName : suggestedName

  const debouncedSearch = useDebounce(search, 300)
  const { exercises, loading, loadingMore, hasMore, loadMore } = useExercises(selectedMuscle, debouncedSearch)

  // Cache de ejercicios fetched por nombre (para tener gif_url de los pre-seleccionados)
  const [exerciseCache, setExerciseCache] = useState<Record<string, Exercise>>({})

  useEffect(() => {
    const initialNames = selectedExercises.map(e => e.name)
    if (initialNames.length === 0) return
    supabase
      .from('exercises')
      .select('*')
      .in('name', initialNames)
      .then(({ data }) => {
        if (!data) return
        setExerciseCache(prev => {
          const next = { ...prev }
          for (const ex of data) next[ex.name] = ex
          return next
        })
      })
  }, [])

  const loadMoreRef = useRef(loadMore)
  useEffect(() => {
    loadMoreRef.current = loadMore
  })

  const sentinelRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMoreRef.current()
    }, { threshold: 0.1 })
    observer.observe(el)
  }, [])

  const isSelected = (name: string) => selectedExercises.some(e => e.name === name)

  const filtered = useMemo(() => {
    // Ejercicios del grupo activo ya seleccionados (pueden no estar en la página actual)
    const dbByName = new Map(exercises.map(ex => [ex.name, ex]))
    const selectedInGroup = selectedExercises
      .filter(e => e.muscle_group === selectedMuscle)
      .map(e => dbByName.get(e.name) ?? exerciseCache[e.name] ?? { id: e.name, name: e.name, name_es: e.name_es, muscle_group: e.muscle_group, gif_url: undefined, created_at: '', secondary_muscles: undefined })

    const selectedNames = new Set(selectedInGroup.map(e => e.name))

    // Ejercicios de la DB para este grupo, excluyendo los ya seleccionados (para no duplicar)
    // El filtrado por texto ya lo hace el servidor via debouncedSearch
    const fromDb = exercises.filter(ex => !selectedNames.has(ex.name))

    const q = debouncedSearch.trim().toLowerCase()
    const selectedFiltered = q
      ? selectedInGroup.filter(ex =>
          (ex.name_es ?? ex.name).toLowerCase().includes(q) ||
          ex.name.toLowerCase().includes(q)
        )
      : selectedInGroup

    return [...selectedFiltered, ...fromDb] as typeof exercises
  }, [exercises, debouncedSearch, selectedExercises, selectedMuscle, exerciseCache])

  const toggleExercise = (name: string, muscle_group: MuscleGroup, name_es?: string, gif_url?: string) => {
    if (isSelected(name)) {
      setSelectedExercises(prev => prev.filter(e => e.name !== name))
    } else {
      setSelectedExercises(prev => [
        ...prev,
        { order: prev.length + 1, name, name_es, gif_url, sets: Array.from({ length: DEFAULT_SETS }, () => ({ reps: DEFAULT_REPS })), muscle_group },
      ])
    }
  }

  const handleSave = () => {
    if (!day) return
    const uniqueMuscleLabels = [...new Set(selectedExercises.map(e => MUSCLE_LABELS[e.muscle_group as MuscleGroup]))]
    const updated: DaySchedule = {
      type: 'training',
      workoutName: displayName,
      muscleGroups: uniqueMuscleLabels.length > 0 ? uniqueMuscleLabels : ['Entreno'],
      exercises: selectedExercises.map((e, i) => ({ order: i + 1, name: e.name, name_es: e.name_es, gif_url: e.gif_url, sets: e.sets, muscle_group: e.muscle_group })),
    }
    updateDay(day as WeekDay, updated)
    navigate('/exercises')
  }

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="px-5 pt-2 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/exercises')} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#3A3A3C]">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              autoFocus
              value={nameEdited ? workoutName : suggestedName}
              onChange={e => { setWorkoutName(e.target.value); setNameEdited(true) }}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
              className="font-black text-xl text-white leading-tight bg-transparent outline-none border-b-2 border-[#9BFF30] w-full font-display"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-2 group"
            >
              <h2 className="font-black text-xl text-white leading-tight font-display">
                {displayName}
              </h2>
              <Pencil className="w-3.5 h-3.5 text-[#8E8E93] group-hover:text-white transition-colors" />
            </button>
          )}
          <p className="text-xs text-[#8E8E93] capitalize">{day}</p>
        </div>
        {selectedExercises.length > 0 && (
          <button
            onClick={handleSave}
            className="shrink-0 px-4 py-2 bg-white text-black text-sm font-bold rounded-full font-display"
          >
            Guardar ({selectedExercises.length})
          </button>
        )}
      </div>

      {/* Muscle group filter */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {ALL_MUSCLES.map(muscle => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedMuscle === muscle
                  ? 'bg-[#9BFF30] text-black'
                  : 'bg-[#3A3A3C] text-[#8E8E93]'
              }`}
            >
              {MUSCLE_LABELS[muscle]}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-2 bg-[#2C2C2E] rounded-2xl px-4 py-3">
          <Search className="w-4 h-4 text-[#8E8E93] shrink-0" />
          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder:text-[#8E8E93] outline-none flex-1"
          />
        </div>
      </div>


      {/* Exercise list */}
      <div className="px-5 flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-[#3A3A3C] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#8E8E93] text-sm py-10">No se encontraron ejercicios</p>
        ) : (
          filtered.map(ex => {
            const selected = isSelected(ex.name)
            return (
              <button
                key={ex.id}
                onClick={() => toggleExercise(ex.name, ex.muscle_group, ex.name_es, ex.gif_url)}
                className={`flex items-center gap-4 p-3 rounded-2xl border-2 w-full text-left transition-colors ${
                  selected ? 'border-[#9BFF30] bg-[#3A3A3C]' : 'border-[#38383A] bg-[#2C2C2E]'
                }`}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#2C2C2E] shrink-0">
                  {ex.gif_url ? (
                    <img src={ex.gif_url} alt={ex.name_es ?? ex.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8E8E93] text-xs text-center px-1">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm leading-tight font-display ${selected ? 'text-white' : 'text-white'}`}>
                    {ex.name_es ?? ex.name}
                  </p>
                  {ex.secondary_muscles && ex.secondary_muscles.length > 0 && (
                    <p className="text-xs text-[#8E8E93] mt-0.5">
                      + {ex.secondary_muscles.map(m => MUSCLE_LABELS[m] ?? m).join(', ')}
                    </p>
                  )}
                </div>

                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${
                  selected ? 'bg-[#9BFF30]' : 'border-2 border-[#38383A]'
                }`}>
                  {selected && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                </div>
              </button>
            )
          })
        )}

        {/* Sentinel — dispara loadMore al entrar al viewport */}
        {hasMore && !loading && <div ref={sentinelRef} className="h-10" />}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#38383A] border-t-white animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
