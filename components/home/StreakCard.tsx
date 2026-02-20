export const StreakCard = () => {
  return (
    <div>
      <h2 className="text-[17px] font-bold text-gray-900 mb-3">Tu racha</h2>
      <div className="bg-[#FFF0E8] rounded-[20px] p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#FF5C00] rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0">
          🔥
        </div>
        <div>
          <p className="text-[26px] font-extrabold text-gray-900 leading-none">7 días</p>
          <p className="text-[13px] text-gray-500 mt-1">Seguí así, no rompas la racha</p>
        </div>
      </div>
    </div>
  )
}
