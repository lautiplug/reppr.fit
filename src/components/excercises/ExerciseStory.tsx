import { useState, useRef, useMemo } from 'react'
import { Play, Pause, SkipForward, Plus, X, Check, ArrowLeftRight } from 'lucide-react'
import { useSessionStore, type ActiveExercise } from '@/store/useSessionStore'
import { ExerciseFlip } from './ExerciseFlip'
import { useGifLoader } from './hooks/useGifLoader'
import { RIRSelector } from './RIRSelector'
import { RestTimer } from './RestTimer'
import { Skeleton } from '@/components/ui/skeleton'
import { useProgressionSuggestion, getIntraSessionSuggestion } from '@/hooks/useProgressionSuggestion'
import type { CompletedSession } from '@/types'

interface ExerciseStoryProps {
  ex: ActiveExercise
  exIndex: number
  total: number
  onPrev: () => void
  onNext: () => void
  onSwap: () => void
  history: CompletedSession[]
}

const REST_SECONDS = 90

export function ExerciseStory({ ex, exIndex, total, onPrev, onNext, onSwap, history }: ExerciseStoryProps) {
  const [playing, setPlaying] = useState(false)
  const [intraDismissed, setIntraDismissed] = useState(false)
  const { gifLoaded, onLoad } = useGifLoader()
  const { toggleSet, updateSet, skipExercise, removeSet, addSet, startRestTimer, clearRestTimer, active } = useSessionStore()
  const touchStartX = useRef<number | null>(null)
  const historySuggestion = useProgressionSuggestion(ex.name, history)

  // Reps de referencia: las del plan para la serie activa (inmutables).
  // Si no hay plan (ejercicio sin reps definidas), caer a null — sin expectativa.
  const nextIncompleteIdx = ex.sets.findIndex(s => !s.completed)
  const currentPlannedSet = nextIncompleteIdx >= 0 ? ex.sets[nextIncompleteIdx] : ex.sets[ex.sets.length - 1]
  const expectedReps = currentPlannedSet?.plannedReps ?? null

  const completedSets = ex.sets.filter(s => s.completed)
  const intraSessionSuggestion = getIntraSessionSuggestion(completedSets, expectedReps)

  // Intra-sesión tiene prioridad sobre historial una vez que hay sets completados.
  // Si el usuario descartó la sugerencia intra-sesión, volver al chip de historial.
  const activeChip = (!intraDismissed && intraSessionSuggestion)
    ? intraSessionSuggestion
    : (historySuggestion ? { ...historySuggestion, isHistory: true as const } : null)

  const restTimer = active?.restTimer
  const isRestingThisExercise = restTimer?.exerciseIndex === exIndex

  const completedCount = ex.sets.filter(s => s.completed).length
  const allDone = completedCount === ex.sets.length && ex.sets.length > 0

  // Zona de tap izquierda/derecha para navegar (30% del ancho)
  const handleTapZone = (side: 'left' | 'right') => {
    if (side === 'left') onPrev()
    else onNext()
  }

  // Swipe como fallback
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 60) {
      if (delta > 0) onPrev()
      else onNext()
    }
    touchStartX.current = null
  }

  const handleComplete = (si: number) => {
    const s = ex.sets[si]
    if (s.completed) {
      toggleSet(exIndex, si)
      return
    }
    toggleSet(exIndex, si)

    // Auto-rellenar el peso del siguiente set con la sugerencia intra-sesión
    const nextSi = si + 1
    if (nextSi < ex.sets.length && !ex.sets[nextSi].completed) {
      const updatedCompleted = ex.sets
        .slice(0, nextSi)
        .map((set, i) => i === si ? { ...set, completed: true } : set)
        .filter(set => set.completed)
      const suggestion = getIntraSessionSuggestion(updatedCompleted, expectedReps)
      if (suggestion && ex.sets[nextSi].weight_kg == null) {
        updateSet(exIndex, nextSi, { weight_kg: suggestion.suggestedWeight })
      }
    }
  }

  const handleRestDone = (elapsed: number) => {
    if (!restTimer) return
    updateSet(restTimer.exerciseIndex, restTimer.setIndex, { restSeconds: elapsed })
    clearRestTimer()
  }

  const nextIncompleteSet = nextIncompleteIdx

  const restElapsedOnMount = useMemo(
    () => restTimer ? Math.floor((Date.now() - new Date(restTimer.startedAt).getTime()) / 1000) : 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [restTimer?.startedAt]
  )

  return (
    <div
      className="flex flex-col h-full bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Barra de progreso segmentada */}
      <div className="flex gap-1 px-4 pt-3 pb-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full transition-colors duration-300"
            style={{ background: i <= exIndex ? '#9BFF30' : 'rgba(255,255,255,0.2)' }}
          />
        ))}
      </div>

      {/* Header con nombre y controles */}
      <div className="relative">
        {/* GIF / placeholder */}
        {ex.gif_url ? (
          <div className="relative overflow-hidden">
            {!gifLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
            <ExerciseFlip
              gifUrl={ex.gif_url}
              alt={ex.name_es ?? ex.name}
              playing={playing}
              onLoad={onLoad}
              className={`w-full h-full transition-opacity duration-500 ${gifLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />

            {/* Zona tap izquierda */}
            <button
              className="absolute left-0 top-0 w-[30%] h-full cursor-pointer"
              onClick={() => handleTapZone('left')}
              aria-label="Ejercicio anterior"
            />
            {/* Zona tap derecha */}
            <button
              className="absolute right-0 top-0 w-[30%] h-full cursor-pointer"
              onClick={() => handleTapZone('right')}
              aria-label="Ejercicio siguiente"
            />

            {/* Info sobre el GIF */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex items-end justify-between pointer-events-none">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                  {exIndex + 1} / {total}
                  {ex.swappedFrom && (
                    <span className="ml-1.5 text-[#9BFF30]/70">· swap</span>
                  )}
                </p>
                <button
                  className="font-black text-white text-xl leading-tight pointer-events-auto cursor-pointer flex items-center gap-1.5"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                  onClick={onSwap}
                >
                  {ex.name_es ?? ex.name}
                  <ArrowLeftRight size={14} className="text-white/40 shrink-0" />
                </button>
                {ex.swappedFrom && (
                  <p className="text-[11px] text-white/30 mt-0.5">{ex.swappedFrom}</p>
                )}
              </div>
              <button
                onClick={() => setPlaying(v => !v)}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center pointer-events-auto cursor-pointer shrink-0 mb-0.5"
              >
                {playing
                  ? <Pause className="w-4 h-4 text-black" />
                  : <Play className="w-4 h-4 text-black" />
                }
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">
                {exIndex + 1} / {total}
              </p>
              <button
                className="font-black text-white text-xl leading-tight cursor-pointer flex items-center gap-1.5"
                style={{ fontFamily: 'Syne, sans-serif' }}
                onClick={onSwap}
              >
                {ex.name_es ?? ex.name}
                <ArrowLeftRight size={14} className="text-white/40 shrink-0" />
              </button>
            </div>
            {/* Tap zones sin GIF */}
            <button className="absolute left-0 top-0 w-[30%] h-full cursor-pointer" onClick={() => handleTapZone('left')} aria-label="Ejercicio anterior" />
            <button className="absolute right-0 top-0 w-[30%] h-full cursor-pointer" onClick={() => handleTapZone('right')} aria-label="Ejercicio siguiente" />
          </div>
        )}
      </div>

      {/* Cuerpo: series */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 flex flex-col gap-2">
        {/* Chip de progresión */}
        {activeChip && (() => {
          const isIntra = 'prevWeight' in activeChip
          if (isIntra) {
            // Chip intra-sesión: basado en sets completados hoy
            const chip = activeChip
            const applyWeight = () => {
              const nextSet = ex.sets.findIndex(s => !s.completed)
              if (nextSet >= 0) updateSet(exIndex, nextSet, { weight_kg: chip.suggestedWeight })
            }
            const reasonLabel =
              chip.reason === 'reduce' ? '↓ Bajá el peso' :
              chip.reason === 'increase' ? '↑ Podés subir' :
              '= Mantener'
            const reasonColor =
              chip.reason === 'reduce' ? 'text-[#ff625a]' :
              chip.reason === 'increase' ? 'text-brand' :
              'text-white/40'
            return (
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-1">
                <div className="flex items-center gap-1.5 text-[12px] font-medium flex-wrap">
                  <span className={`font-bold ${reasonColor}`}>{reasonLabel}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/60">
                    Serie anterior: <span className="text-white font-bold">{chip.prevWeight}kg × {chip.prevReps === 'fallo' ? 'fallo' : `${chip.prevReps}`}</span>
                  </span>
                  {chip.expectedReps !== null && chip.prevReps !== 'fallo' && chip.prevReps < chip.expectedReps && (
                    <span className="text-white/30">({chip.expectedReps} esperadas)</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={() => setIntraDismissed(true)}
                    className="text-[11px] font-semibold text-white/30 hover:text-white/60 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                  >
                    Ignorar
                  </button>
                  <button
                    onClick={applyWeight}
                    className="text-[11px] font-bold text-black bg-brand px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    {chip.suggestedWeight}kg
                  </button>
                </div>
              </div>
            )
          } else {
            // Chip de historial: antes de completar el primer set
            const chip = activeChip
            const suggestedWeight = 'suggestedWeight' in chip ? chip.suggestedWeight : null
            return (
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-1">
                <div className="flex items-center gap-1.5 text-[12px] text-white/60 font-medium flex-wrap">
                  <span>Última vez:</span>
                  <span className="text-white font-bold">
                    {'lastWeight' in chip && `${chip.lastWeight}kg`} × {'lastReps' in chip && (chip.lastReps === 'fallo' ? 'fallo' : `${chip.lastReps} reps`)}
                  </span>
                  {'lastRIR' in chip && chip.lastRIR !== null && (
                    <span className="text-white/40">RIR {chip.lastRIR}</span>
                  )}
                  {suggestedWeight !== null && 'reason' in chip && chip.reason === 'increase' && (
                    <>
                      <span className="text-white/30">→</span>
                      <span className="text-brand font-bold">Hoy: {suggestedWeight}kg</span>
                    </>
                  )}
                  {suggestedWeight !== null && 'reason' in chip && chip.reason === 'maintain' && (
                    <span className="text-white/40 font-medium">· mantener</span>
                  )}
                </div>
                {suggestedWeight !== null && (
                  <button
                    onClick={() => {
                      const nextSet = ex.sets.findIndex(s => !s.completed)
                      const targetSet = nextSet >= 0 ? nextSet : 0
                      updateSet(exIndex, targetSet, { weight_kg: suggestedWeight })
                    }}
                    className="text-[11px] font-bold text-black bg-brand px-2.5 py-1 rounded-lg shrink-0 ml-2 cursor-pointer"
                  >
                    Usar
                  </button>
                )}
              </div>
            )
          }
        })()}

        {/* Cabecera columnas */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 shrink-0" />
          <span className="flex-1 text-[10px] font-bold text-white/40 uppercase tracking-wide text-center">Reps</span>
          <span className="flex-1 text-[10px] font-bold text-white/40 uppercase tracking-wide text-center">kg</span>
          <span className="w-10 text-[10px] font-bold text-white/40 uppercase tracking-wide text-center shrink-0">RIR</span>
          <span className="w-10 shrink-0" />
        </div>

        {ex.sets.map((s, si) => {
          const isActive = si === nextIncompleteSet && !ex.skipped
          const isResting = isRestingThisExercise && restTimer?.setIndex === si

          return (
            <div key={si} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center text-[12px] font-bold text-white/40">{si + 1}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={s.reps === 'fallo' ? '' : (s.reps || '')}
                  placeholder={s.reps === 'fallo' ? 'f' : '—'}
                  onChange={e => updateSet(exIndex, si, { reps: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                  className={[
                    'flex-1 min-w-0 h-11 rounded-xl text-center text-[14px] font-bold outline-none border transition-colors',
                    s.completed
                      ? 'bg-[#9BFF30]/15 border-[#9BFF30]/50 text-[#9BFF30]'
                      : 'bg-white/8 border-transparent text-white focus:border-[#9BFF30]',
                  ].join(' ')}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  value={s.weight_kg ?? ''}
                  placeholder="—"
                  onChange={e => updateSet(exIndex, si, { weight_kg: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                  className={[
                    'flex-1 min-w-0 h-11 rounded-xl text-center text-[14px] font-bold outline-none border transition-colors',
                    s.completed
                      ? 'bg-[#9BFF30]/15 border-[#9BFF30]/50 text-[#9BFF30]'
                      : 'bg-white/8 border-transparent text-white/60 focus:border-[#9BFF30]',
                  ].join(' ')}
                />
                <RIRSelector
                  value={s.rir}
                  completed={s.completed}
                  onChange={rir => updateSet(exIndex, si, { rir })}
                />
                <button
                  onClick={() => handleComplete(si)}
                  disabled={ex.skipped}
                  className={[
                    'w-10 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors cursor-pointer',
                    s.completed
                      ? 'bg-[#9BFF30] text-black'
                      : isActive
                      ? 'bg-white/15 text-white/60 hover:bg-[#9BFF30]/20 hover:text-[#9BFF30]'
                      : 'bg-white/5 text-white/20',
                  ].join(' ')}
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Timer de descanso (solo tras completar, activado manualmente) */}
              {s.completed && !isResting && (
                <div className="pl-8">
                  <button
                    onClick={() => startRestTimer(exIndex, si, REST_SECONDS)}
                    className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  >
                    <span>⏱</span>
                    {s.restSeconds
                      ? `Descansaste ${s.restSeconds}s · descansar de nuevo`
                      : 'Iniciar descanso'}
                  </button>
                </div>
              )}

              {isResting && restTimer && (
                <div className="pl-8">
                  <RestTimer
                    seconds={restTimer.totalSeconds}
                    elapsedOnMount={restElapsedOnMount}
                    onDone={handleRestDone}
                    onSkip={handleRestDone}
                  />
                </div>
              )}
            </div>
          )
        })}

        {/* Agregar / quitar serie */}
        <div className="flex gap-2 mt-2">
          {ex.sets.length > 1 && (
            <button
              onClick={() => removeSet(exIndex)}
              className="flex-1 h-9 rounded-xl border border-dashed border-white/15 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white/40 hover:border-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" /> Quitar serie
            </button>
          )}
          <button
            onClick={() => addSet(exIndex)}
            className="flex-1 h-9 rounded-xl border border-dashed border-white/15 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white/40 hover:border-white/40 hover:text-white/70 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Agregar serie
          </button>
        </div>

        {/* Saltear */}
        <button
          onClick={() => skipExercise(exIndex)}
          className={[
            'w-full h-9 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-colors mt-1 cursor-pointer',
            ex.skipped
              ? 'text-red-400 hover:text-white/40'
              : 'text-white/30 hover:text-red-400',
          ].join(' ')}
        >
          <SkipForward className="w-3.5 h-3.5" />
          {ex.skipped ? 'Salteado · deshacer' : 'Saltear ejercicio'}
        </button>

        {/* Indicador "todo listo → siguiente" */}
        {allDone && exIndex < total - 1 && (
          <button
            onClick={onNext}
            className="w-full h-12 rounded-2xl bg-[#9BFF30] text-black font-black text-[15px] flex items-center justify-center gap-2 mt-2 cursor-pointer"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Siguiente ejercicio →
          </button>
        )}
      </div>
    </div>
  )
}
