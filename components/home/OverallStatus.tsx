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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#2DD4BF" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-gray-700">{percentage}%</span>
    </div>
  )
}

interface StatCardProps {
  emoji: string
  label: string
  value: string
  unit: string
  change: string
  percentage: number
}

const StatCard = ({ emoji, label, value, unit, change, percentage }: StatCardProps) => (
  <div className="flex items-center justify-between py-3.5 px-1">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-[14px] bg-gray-100 flex items-center justify-center text-xl shrink-0">
        {emoji}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[17px] font-bold text-gray-900">{value} <span className="text-[14px]">{unit}</span></span>
          <span className="text-xs font-semibold text-teal-400">{change}</span>
        </div>
      </div>
    </div>
    <CircularProgress percentage={percentage} />
  </div>
)

export const OverallStatus = () => {
  return (
    <div>
      <h2 className="text-[17px] font-bold text-gray-900 mb-3">Estado general</h2>
      <div className="bg-white rounded-4xl border border-gray-100 px-4 divide-y divide-gray-100">
        <StatCard emoji="🔥" label="Calories Loss" value="12.182" unit="Kcal" change="+2,8%" percentage={37} />
        <StatCard emoji="🏋️" label="Weight Loss" value="10.7" unit="Kg" change="+2,8%" percentage={80} />
      </div>
    </div>
  )
}
