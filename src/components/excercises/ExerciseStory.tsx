import { useState, useRef } from 'react'
import { Play, Pause, SkipForward, Plus, X, Check, ArrowLeftRight } from 'lucide-react'
import { useSessionStore, type ActiveExercise } from '@/store/useSessionStore'
import { ExerciseFlip } from './ExerciseFlip'
import { useGifLoader } from './hooks/useGifLoader'
import { RIRSelector } from './RIRSelector'
import { RestTimer } from './RestTimer'
import { Skeleton } from '@/components/ui/skeleton'

interface ExerciseStoryProps {
  ex: ActiveExercise
  exIndex: number
  total: number
  onPrev: () => void
  onNext: () => void
  onSwap: () => void
}

const REST_SECONDS = 90

export function ExerciseStory({ ex, exIndex, total, onPrev, onNext, onSwap }: ExerciseStoryProps) {
  const [playing, setPlaying] = useState(false)
  const { gifLoaded, onLoad } = useGifLoader()
  const { toggleSet, updateSet, skipExercise, removeSet, addSet, startRestTimer, clearRestTimer, active } = useSessionStore()
  const touchStartX = useRef<number | null>(null)

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
  }

  const handleRestDone = (elapsed: number) => {
    if (!restTimer) return
    updateSet(restTimer.exerciseIndex, restTimer.setIndex, { restSeconds: elapsed })
    clearRestTimer()
  }

  const nextIncompleteSet = ex.sets.findIndex(s => !s.completed)

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
          <div className="relative h-52 overflow-hidden">
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
                    elapsedOnMount={Math.floor((Date.now() - new Date(restTimer.startedAt).getTime()) / 1000)}
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
