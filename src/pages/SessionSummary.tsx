import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, Zap, SkipForward } from 'lucide-react'
import { useSessionStore } from '@/store/useSessionStore'
import type { CompletedSession } from '@/types'

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex-1 bg-[#2C2C2E] rounded-2xl p-4 flex flex-col items-center gap-2">
      <div className="text-[#9BFF30]">{icon}</div>
      <p className="text-white font-bold text-xl">{value}</p>
      <p className="text-[#8E8E93] text-xs text-center">{label}</p>
    </div>
  )
}

export default function SessionSummary() {
  const navigate = useNavigate()
  const history = useSessionStore(s => s.history)
  const session: CompletedSession | null = history[0] ?? null

  useEffect(() => {
    if (!session) navigate('/', { replace: true })
  }, [session, navigate])

  if (!session) return null

  const completed = session.exercises.filter(e => !e.skipped && e.sets.length > 0)
  // const skipped = session.exercises.filter(e => e.skipped) // For future use, maybe show skipped exercises in the summary screen
  const totalSets = completed.reduce((acc, e) => acc + e.sets.length, 0)

  return (
    <div className="min-h-screen bg-[#1C1C1E] flex flex-col px-5 pt-16 pb-10">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-16 h-16 rounded-full bg-[#9BFF30]/15 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[#9BFF30]" />
        </div>
        <h1 className="font-black text-white text-3xl text-center font-display">
          ¡Entrenamiento completado!
        </h1>
        <p className="text-[#8E8E93] text-base text-center">{session.workoutName}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-8">
        <StatCard icon={<Clock className="w-5 h-5" />} label="Duración" value={formatDuration(session.durationMin)} />
        <StatCard icon={<Zap className="w-5 h-5" />} label="Ejercicios" value={`${completed.length}/${session.exercises.length}`} />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Series" value={String(totalSets)} />
      </div>

      {/* Exercise list */}
      <div className="flex flex-col gap-3 mb-10 flex-1">
        {session.exercises.map((ex, i) => (
          <div key={i} className={`rounded-2xl px-4 py-3 flex items-center justify-between ${ex.skipped ? 'bg-[#2C2C2E]/50' : 'bg-[#2C2C2E]'}`}>
            <div className="flex items-center gap-3">
              {ex.skipped
                ? <SkipForward className="w-4 h-4 text-[#636366]" />
                : <CheckCircle className="w-4 h-4 text-[#9BFF30]" />
              }
              <div>
                <p className={`font-semibold text-sm ${ex.skipped ? 'text-[#636366]' : 'text-white'}`}>
                  {ex.name_es ?? ex.name}
                </p>
                {ex.skipped
                  ? <p className="text-[#636366] text-xs">Salteado</p>
                  : <p className="text-[#8E8E93] text-xs">{ex.sets.length} {ex.sets.length === 1 ? 'serie' : 'series'}</p>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl bg-[#9BFF30] text-black font-bold text-[16px]"
        >
          Ir al inicio
        </button>
        <button
          onClick={() => navigate('/exercises')}
          className="w-full py-4 rounded-2xl bg-[#2C2C2E] text-white font-semibold text-[16px]"
        >
          Ver ejercicios
        </button>
      </div>
    </div>
  )
}
