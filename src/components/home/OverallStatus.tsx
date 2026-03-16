import { ChartArea, Footprints } from "lucide-react"
import type { ReactNode } from "react"

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
}

const CircularProgress = ({ percentage, size = 44, strokeWidth = 4 }: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E8E8E3" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#9BFF30" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-white">{percentage}%</span>
    </div>
  )
}

interface StatCardProps {
  emoji: ReactNode
  label: string
  value: string
  unit: string
  change: string
  percentage: number
}

const StatCard = ({ emoji, label, value, unit, change, percentage }: StatCardProps) => (
  <div className="flex items-center justify-between py-3.5 px-1">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-[14px] bg-[#181818] flex items-center justify-center text-xl shrink-0">
        {emoji}
      </div>
      <div>
        <p className="text-xs text-white">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[17px] font-medium text-white">{value} <span className="text-[14px]">{unit}</span></span>
          <span className="text-xs font-medium text-[#9BFF30]">{change}</span>
        </div>
      </div>
    </div>
    <CircularProgress percentage={percentage} />
  </div>
)

export const OverallStatus = () => {
  return (
    <div>
      <h2 className="text-[17px] font-bold text-white mb-3">Estado general</h2>
      <div className="bg-[#181818] rounded-4xl px-4 divide-y divide-[#E8E8E3] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <StatCard emoji={<Footprints className="text-white"/>} label="Pasos" value="4381" unit="Pasos" change="+802" percentage={96} />
        <StatCard emoji={<ChartArea className="text-white"/>} label="Weight Loss" value="10.7" unit="Kg" change="-2kg este mes, wow!!" percentage={80} />
      </div>
    </div>
  )
}
