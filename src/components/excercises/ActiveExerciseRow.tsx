import { ChevronDown, ChevronUp, Check, Plus, X, SkipForward } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionStore, type ActiveExercise } from "@/store/useSessionStore";
import { useGifLoader } from "./hooks/useGifLoader";
import { ExerciseFlip } from "./ExerciseFlip";

export function ActiveExerciseRow({ ex, exIndex }: { ex: ActiveExercise; exIndex: number }) {
  const [expanded, setExpanded] = useState(true);
  const { gifLoaded, onLoad } = useGifLoader();
  const { toggleSet, updateSet, skipExercise, removeSet, addSet } = useSessionStore();

  const completedCount = ex.sets.filter((s) => s.completed).length;
  const allDone = completedCount === ex.sets.length;

  return (
    <div className={`rounded-2xl overflow-hidden border transition-colors ${allDone ? "border-[#9BFF30]/40 bg-[#1C1C1E]" : "border-[#38383A] bg-[#1C1C1E]"}`}>

      <button onClick={() => setExpanded(v => !v)} className="w-full text-left relative cursor-pointer">
        {ex.gif_url ? (
          <div className="relative h-44 overflow-hidden">
            {!gifLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
            <ExerciseFlip
              gifUrl={ex.gif_url}
              alt={ex.name_es ?? ex.name}
              onLoad={onLoad}
              className={`w-full h-full transition-opacity duration-500 ${gifLoaded ? "opacity-100" : "opacity-0"}`}
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#1C1C1E] via-[#1C1C1E]/30 to-transparent" />
            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${allDone ? "bg-[#9BFF30] text-black" : "bg-black/60 text-white"}`}>
              {allDone ? "✓ Completo" : `${completedCount}/${ex.sets.length} series`}
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest mb-0.5">#{exIndex + 1}</p>
                <p className="font-black text-white text-[18px] leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
                  {ex.name_es ?? ex.name}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 mb-0.5 ${expanded ? "bg-[#9BFF30]" : "bg-[#3A3A3C]"}`}>
                {expanded ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-[#8E8E93]" />}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-4">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${allDone ? "bg-[#9BFF30] text-black" : "bg-[#3A3A3C] text-[#8E8E93]"}`} style={{ fontFamily: "Syne, sans-serif" }}>
              {allDone ? <Check className="w-3.5 h-3.5" /> : exIndex + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[15px] text-white leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
                {ex.name_es ?? ex.name}
              </p>
              <p className="text-[13px] text-[#8E8E93] mt-0.5 font-medium">{completedCount}/{ex.sets.length} series</p>
            </div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${expanded ? "bg-[#9BFF30]" : "bg-[#3A3A3C]"}`}>
              {expanded ? <ChevronUp className="w-3.5 h-3.5 text-black" /> : <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93]" />}
            </div>
          </div>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 shrink-0" />
            <span className="flex-1 text-[10px] font-bold text-[#8E8E93] uppercase tracking-wide text-center">Reps</span>
            <span className="flex-1 text-[10px] font-bold text-[#8E8E93] uppercase tracking-wide text-center">kg</span>
            <span className="w-10 shrink-0" />
          </div>

          {ex.sets.map((s, si) => {
            const canComplete = s.weight_kg != null && s.weight_kg > 0;
            return (
              <div key={si} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center text-[12px] font-bold text-[#8E8E93]">{si + 1}</span>
                <input
                  type="number"
                  value={s.reps === "fallo" ? "" : (s.reps || "")}
                  placeholder={s.reps === "fallo" ? "f" : "—"}
                  onChange={(e) => updateSet(exIndex, si, { reps: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                  className={`flex-1 min-w-0 h-11 rounded-xl text-center text-[14px] font-bold outline-none border transition-colors ${s.completed ? "bg-[#9BFF30]/15 border-[#9BFF30]/50 text-[#9BFF30]" : "bg-[#2C2C2E] border-transparent text-white focus:border-[#9BFF30]"}`}
                />
                <input
                  type="number"
                  value={s.weight_kg ?? ""}
                  placeholder="—"
                  onChange={(e) => updateSet(exIndex, si, { weight_kg: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                  className={`flex-1 min-w-0 h-11 rounded-xl text-center text-[14px] font-bold outline-none border transition-colors ${s.completed ? "bg-[#9BFF30]/15 border-[#9BFF30]/50 text-[#9BFF30]" : "bg-[#2C2C2E] border-transparent text-[#8E8E93] focus:border-[#9BFF30]"}`}
                />
                <button
                  onClick={() => canComplete && toggleSet(exIndex, si)}
                  className={`w-10 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                    s.completed ? "bg-[#9BFF30] text-black"
                    : canComplete ? "bg-[#3A3A3C] text-[#8E8E93] hover:bg-[#9BFF30]/20 hover:text-[#9BFF30]"
                    : "bg-[#2C2C2E] text-[#3A3A3C] cursor-not-allowed"
                  }`}
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            );
          })}

          <div className="flex gap-2 mt-1">
            {ex.sets.length > 1 && (
              <button
                onClick={() => removeSet(exIndex)}
                className="flex-1 h-9 rounded-xl border border-dashed border-[#3A3A3C] flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#8E8E93] hover:border-white hover:text-white transition-colors"
              >
                <X className="w-3 h-3" /> Quitar serie
              </button>
            )}
            <button
              onClick={() => addSet(exIndex)}
              className="flex-1 h-9 rounded-xl border border-dashed border-[#3A3A3C] flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#8E8E93] hover:border-white hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3" /> Agregar serie
            </button>
          </div>

          <button
            onClick={() => skipExercise(exIndex)}
            className={`w-full h-9 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-colors mt-1 ${
              ex.skipped
                ? "text-[#ff625a] hover:text-[#8E8E93]"
                : "text-[#8E8E93] hover:text-[#ff625a]"
            }`}
          >
            <SkipForward className="w-3.5 h-3.5" />
            {ex.skipped ? "Salteado — deshacer" : "Saltear ejercicio"}
          </button>
        </div>
      )}
    </div>
  );
}
