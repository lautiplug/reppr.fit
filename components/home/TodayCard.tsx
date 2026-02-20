import { Play } from "lucide-react"
import { Link } from "react-router-dom"

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
}

const CircularProgress = ({ percentage, size = 56, strokeWidth = 4 }: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#FF5C00" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[13px] font-extrabold text-white">{percentage}%</span>
    </div>
  )
}

export const TodayCard = () => {
  return (
    <div className="bg-[#111111] rounded-4xl p-6 relative overflow-hidden">
      {/* decorative blob */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#FF5C00]/15 pointer-events-none" />

      <div className="absolute top-5 right-5">
        <CircularProgress percentage={65} />
      </div>

      <p className="text-xs text-white/50 font-medium mb-1">Hoy · Lunes</p>
      <h2 className="text-[22px] font-extrabold text-white mb-1 leading-tight">Pecho &amp; Tríceps</h2>
      <p className="text-[13px] text-white/60 leading-relaxed mb-5">
        Press banca, press inclinado,<br />aperturas, tríceps polea...
      </p>

      <Link
        to="/session"
        className="inline-flex items-center gap-2 bg-[#FF5C00] text-white text-sm font-bold px-5 py-3 rounded-full"
      >
        <Play size={14} fill="white" strokeWidth={0} />
        Empezar sesión
      </Link>
    </div>
  )
}
