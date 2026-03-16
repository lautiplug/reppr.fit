import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import type { DayExercise } from "@/types";
import { usePlanExercise, summarizeSets } from "./hooks/usePlanExercise";

export function PlanExerciseRow({ ex, index }: { ex: DayExercise; index: number }) {
  const { sets, expanded, toggleExpanded, handleChange, addSet, removeLastSet } = usePlanExercise(ex.sets);

  return (
    <div className="rounded-2xl overflow-hidden border bg-[#2C2C2E] border-[#38383A]">
      <button onClick={toggleExpanded} className="flex items-center gap-3 w-full text-left px-4 py-4">
        <span className="w-7 h-7 rounded-full bg-[#9BFF30] flex items-center justify-center text-[11px] font-black text-black shrink-0" style={{ fontFamily: "Syne, sans-serif" }}>
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-[15px] leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            {ex.name_es ?? ex.name}
          </p>
          <p className="text-[13px] text-[#8E8E93] mt-0.5 font-medium">{summarizeSets(sets)}</p>
        </div>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${expanded ? "bg-[#9BFF30]" : "bg-[#3A3A3C]"}`}>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-black" /> : <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93]" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 pl-10">
            <div className="flex gap-1">
              {sets.map((_, i) => (
                <span key={i} className="ml-1 w-12 text-center text-[10px] font-bold text-[#8E8E93] uppercase tracking-wide">
                  Set {i + 1}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide w-10 text-right">Reps</span>
            <div className="flex gap-1 flex-wrap">
              {sets.map((set, i) => (
                <input key={i} type={set.reps === "fallo" ? "text" : "number"} defaultValue={set.reps === "fallo" ? "f" : set.reps}
                  onChange={(e) => handleChange(i, "reps", e.target.value)}
                  className="w-12 h-10 bg-[#2C2C2E] rounded-xl text-center text-[13px] font-bold text-white outline-none border border-white focus:border-[#9BFF30] transition-colors"
                />
              ))}
              {sets.length > 1 && (
                <button onClick={removeLastSet}
                  className="w-12 h-10 rounded-xl border border-dashed border-[#D0D0D0] flex items-center justify-center text-[#8E8E93] hover:border-white hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide w-10 text-right">kg</span>
            <div className="flex gap-1 flex-wrap">
              {sets.map((set, i) => (
                <input key={i} type="number" defaultValue={set.weight_kg ?? ""} placeholder="—"
                  onChange={(e) => handleChange(i, "weight_kg", e.target.value)}
                  className="w-12 h-10 bg-[#2C2C2E] rounded-xl text-center text-[13px] font-bold text-[#8E8E93] outline-none border border-white focus:border-[#9BFF30] transition-colors"
                />
              ))}
              <button onClick={addSet}
                className="w-12 h-10 rounded-xl border border-dashed border-[#D0D0D0] flex items-center justify-center text-[#8E8E93] hover:border-white hover:text-white transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
