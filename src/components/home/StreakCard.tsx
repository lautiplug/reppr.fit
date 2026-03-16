import { EmptyState } from "@/components/shared/EmptyState"
import { Flame } from "lucide-react"

interface StreakCardProps {
  streak?: number | null
}

export const StreakCard = ({ streak }: StreakCardProps) => {
  return (
    <div>
      <h2 className="text-[17px] font-bold text-[#111111] mb-3">Tu racha</h2>

      {streak != null && streak > 0 ? (
        <div className="bg-white rounded-4xl p-5 flex items-center gap-4 border border-[#E8E8E3] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="w-12 h-12 bg-[#9BFF30] rounded-[14px] flex items-center justify-center text-2xl shrink-0">
            <Flame className="text-white" />
          </div>
          <div>
            <p className="text-[26px] font-extrabold text-[#111111] leading-none">{streak} { streak < 2 ? 'día' : 'días' }</p>
            <p className="text-[13px] text-[#6B6B6B] mt-1">Seguí así! No rompas la racha</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-4xl border border-[#E8E8E3] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <EmptyState
            icon={<Flame className="text-[#9BFF30]" />  }
            title="Sin racha activa"
            description="Completá tu primer sesión para empezar."
          />
        </div>
      )}
    </div>
  )
}
