import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

interface Routine {
  day: string
  name: string
  exercises: number
  active: boolean
}

const routines: Routine[] = [
  { day: "Lunes", name: "Pecho & Tríceps", exercises: 8, active: true },
  { day: "Martes", name: "Espalda & Bíceps", exercises: 9, active: false },
  { day: "Miércoles", name: "Piernas", exercises: 7, active: false },
  { day: "Jueves", name: "Hombros", exercises: 6, active: false },
]

export const RoutinesPreview = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-bold text-gray-900">Tus rutinas</h2>
        <Link to="/" className="flex items-center gap-1 text-[13px] text-[#FF5C00] font-medium">
          Ver todas <ArrowRight size={14} />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
        {routines.map((r) => (
          <div
            key={r.day}
            className="min-w-[140px] bg-white rounded-[12px] border border-gray-100 p-4 flex-shrink-0"
          >
            <div
              className="w-7 h-1.5 rounded-full mb-3"
              style={{ background: r.active ? "#FF5C00" : "#E5E5E5" }}
            />
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{r.day}</p>
            <p className="text-[15px] font-bold text-gray-900 mt-1 mb-2 leading-snug">{r.name}</p>
            <p className="text-xs text-gray-400">{r.exercises} ejercicios</p>
          </div>
        ))}
      </div>
    </div>
  )
}
