import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

interface SessionExercise {
  name: string
  muscle: string
  sets: number
  weight: string
  pr?: boolean
}

const exercises: SessionExercise[] = [
  { name: "Press banca", muscle: "Pecho", sets: 4, weight: "80 kg", pr: true },
  { name: "Press inclinado", muscle: "Pecho", sets: 3, weight: "65 kg" },
  { name: "Tríceps polea", muscle: "Tríceps", sets: 3, weight: "35 kg" },
]

export const LastSession = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-bold text-gray-900">Última sesión</h2>
        <Link to="/" className="flex items-center gap-1 text-[13px] text-[#FF5C00] font-medium">
          Ver más <ArrowRight size={14} />
        </Link>
      </div>

      <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden">
        {exercises.map((ex, i) => (
          <div
            key={ex.name}
            className={`flex items-center justify-between px-5 py-3.5 ${i < exercises.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{ex.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ex.muscle} · {ex.sets} series</p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-bold text-gray-900">{ex.weight}</p>
              {ex.pr && <p className="text-[11px] text-[#FF5C00] font-semibold mt-0.5">🏆 PR</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
