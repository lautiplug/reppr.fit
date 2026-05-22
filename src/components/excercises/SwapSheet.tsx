import { useEffect, useState } from 'react'
import { X, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { MuscleGroup } from '@/types'

interface ExerciseOption {
  name: string
  name_es?: string
  gif_url?: string
  muscle_group: MuscleGroup
}

interface SwapSheetProps {
  muscleGroup?: MuscleGroup
  currentName: string
  onSelect: (exercise: ExerciseOption) => void
  onClose: () => void
}

export function SwapSheet({ muscleGroup, currentName, onSelect, onClose }: SwapSheetProps) {
  const [options, setOptions] = useState<ExerciseOption[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let req = supabase
        .from('exercises')
        .select('name, name_es, gif_url, muscle_group')
        .neq('name', currentName)
        .order('name')

      if (muscleGroup) {
        req = req.eq('muscle_group', muscleGroup)
      }

      const { data } = await req.limit(40)
      setOptions(data ?? [])
      setLoading(false)
    }
    load()
  }, [muscleGroup, currentName])

  const filtered = query.trim()
    ? options.filter(o =>
        (o.name_es ?? o.name).toLowerCase().includes(query.toLowerCase()) ||
        o.name.toLowerCase().includes(query.toLowerCase())
      )
    : options

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E] rounded-t-3xl max-h-[75vh] flex flex-col">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-2" />

        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-white text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
              Cambiar ejercicio
            </h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer">
              <X size={16} className="text-white/60" />
            </button>
          </div>

          {muscleGroup && (
            <p className="text-[12px] text-white/40 mb-2 uppercase tracking-wider">
              Mismo músculo · solo esta sesión
            </p>
          )}

          {/* Búsqueda */}
          <div className="flex items-center gap-2 bg-white/8 rounded-xl px-3 h-10 mb-3">
            <Search size={14} className="text-white/40 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar ejercicio..."
              className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder:text-white/30"
              autoFocus
            />
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 flex flex-col gap-1">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-8">Sin resultados</p>
          ) : (
            filtered.map(opt => (
              <button
                key={opt.name}
                onClick={() => onSelect(opt)}
                className="flex items-center gap-3 h-14 px-3 rounded-xl hover:bg-white/8 transition-colors text-left cursor-pointer w-full"
              >
                {opt.gif_url ? (
                  <img
                    src={opt.gif_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-white text-[14px] font-semibold truncate">
                    {opt.name_es ?? opt.name}
                  </p>
                  {opt.name_es && (
                    <p className="text-white/30 text-[11px] truncate">{opt.name}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}
