import type { DayExercise } from "@/types";
import { summarizeSets } from "./hooks/usePlanExercise";
import { Skeleton } from "@/components/ui/skeleton";
import { useGifLoader } from "./hooks/useGifLoader";

export function PlanExerciseRow({ ex, index }: { ex: DayExercise; index: number }) {
  const { gifLoaded, onLoad } = useGifLoader();

  return (
    <div className="rounded-2xl overflow-hidden bg-dark border border-[#38383A]">
      {ex.gif_url && (
        <div className="relative h-32 overflow-hidden">
          {!gifLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
          <img
            src={ex.gif_url}
            alt={ex.name_es ?? ex.name}
            onLoad={onLoad}
            className={`w-full h-full object-cover transition-opacity duration-500 ${gifLoaded ? "opacity-100" : "opacity-0"}`}
          />
          <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/20 to-transparent" />
          <p
            className="absolute bottom-3 left-4 font-black text-white text-[16px] leading-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {ex.name_es ?? ex.name}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        {!ex.gif_url && (
          <>
            <span
              className="w-7 h-7 rounded-full bg-[#9BFF30]/20 flex items-center justify-center text-[11px] font-black text-[#9BFF30] shrink-0"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {index + 1}
            </span>
            <p className="flex-1 font-bold text-white text-[15px] leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
              {ex.name_es ?? ex.name}
            </p>
          </>
        )}
        {ex.gif_url && <span className="w-7 shrink-0" />}
        <span className="text-[13px] text-[#8E8E93] font-medium shrink-0">
          {summarizeSets(ex.sets)}
        </span>
      </div>
    </div>
  );
}
