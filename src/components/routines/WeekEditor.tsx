import { ArrowLeft, Pen, Plus, GripVertical } from "lucide-react";
import type { WeekDay, WeekSchedule } from "@/types";
import { useNavigationHook } from "@/hooks/useNavigation";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useCallback } from "react";
import { useRoutineQuery, useSaveRoutineMutation } from "@/lib/queries";

const WEEK_DAYS: { key: WeekDay; label: string }[] = [
  { key: "L", label: "Lunes" },
  { key: "M", label: "Martes" },
  { key: "X", label: "Miércoles" },
  { key: "J", label: "Jueves" },
  { key: "V", label: "Viernes" },
  { key: "S", label: "Sábado" },
  { key: "D", label: "Domingo" },
];

const ROW_HEIGHT = 72; // aprox height of each row + gap

interface Props {
  schedule: WeekSchedule;
  onConfirm: () => void;
  onBack: () => void;
  onReset?: () => void;
}

export const WeekEditor = ({ schedule, onConfirm, onBack, onReset }: Props) => {
  const { goBack } = useNavigationHook(onBack);
  const navigate = useNavigate();
  const { data: routineData } = useRoutineQuery();
  const saveRoutine = useSaveRoutineMutation();

  const swapDays = (a: WeekDay, b: WeekDay) => {
    const current = routineData?.schedule ?? {};
    const newSchedule = { ...current, [a]: current[b], [b]: current[a] };
    saveRoutine.mutate({
      schedule: newSchedule,
      lastAnswers: routineData?.lastAnswers ?? null,
    });
  };

  // Index being dragged
  const draggingIdx = useRef<number | null>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  const [dragState, setDragState] = useState<{
    idx: number;
    offsetY: number; // translation of the dragged item
    overIdx: number;
  } | null>(null);

  const getTargetIndex = useCallback(
    (touchY: number, originIdx: number): number => {
      if (!listRef.current) return originIdx;
      const listRect = listRef.current.getBoundingClientRect();
      const relY = touchY - listRect.top;
      const idx = Math.round(relY / ROW_HEIGHT);
      return Math.max(0, Math.min(WEEK_DAYS.length - 1, idx));
    },
    [],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent, idx: number) => {
    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
    draggingIdx.current = idx;
    setDragState({ idx, offsetY: 0, overIdx: idx });
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (draggingIdx.current === null) return;
      e.preventDefault();
      currentY.current = e.touches[0].clientY;
      const offsetY = currentY.current - startY.current;
      const overIdx = getTargetIndex(currentY.current, draggingIdx.current);
      setDragState({ idx: draggingIdx.current, offsetY, overIdx });
    },
    [getTargetIndex],
  );

  const handleTouchEnd = useCallback(() => {
    if (draggingIdx.current === null || !dragState) return;
    const fromKey = WEEK_DAYS[draggingIdx.current].key;
    const toKey = WEEK_DAYS[dragState.overIdx].key;
    if (fromKey !== toKey) swapDays(fromKey, toKey);
    draggingIdx.current = null;
    setDragState(null);
  }, [dragState, swapDays]);

  return (
    <div className="px-5 pb-28">
      <div className="flex justify-between">
        <button
          onClick={goBack}
          className="text-sm text-white mb-4 mt-4 flex items-center gap-1 p-1 rounded-full bg-[#3A3A3C]"
        >
          <ArrowLeft size={30} strokeWidth={1.5} />
        </button>

        <button
          onClick={onConfirm}
          className="text-sm text-black mb-4 mt-4 px-4 flex items-center gap-1 p-2 rounded-full bg-[#9BFF30]"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Continuar
        </button>
      </div>
      <div className="flex items-center justify-between pt-2 pb-4">
        <h2
          className="font-black text-xl text-white"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Esta es tu semana
        </h2>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs text-[#8E8E93] font-medium"
          >
            Rehacer desde cero
          </button>
        )}
      </div>

      <div
        ref={listRef}
        className="flex flex-col gap-2"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: dragState ? "none" : "auto" }}
      >
        {WEEK_DAYS.map(({ key, label }, idx) => {
          const day = schedule[key];
          const isTraining = day?.type === "training";
          const isRest = !day || day.type === "rest";

          const isDragging = dragState?.idx === idx;
          const isOver =
            dragState !== null &&
            dragState.overIdx === idx &&
            dragState.idx !== idx;

          return (
            <div
              key={key}
              style={
                isDragging
                  ? {
                      transform: `translateY(${dragState.offsetY}px)`,
                      zIndex: 50,
                    }
                  : undefined
              }
              className={`flex items-center gap-2 rounded-2xl border-2 transition-shadow select-none ${
                isDragging
                  ? "shadow-xl border-[#9BFF30] bg-[#2C2C2E] scale-[1.02] relative"
                  : isOver
                    ? "border-[#9BFF30] bg-[#2C2C2E]"
                    : isTraining
                      ? "border-[#38383A] bg-[#2C2C2E]"
                      : "border-dashed border-[#38383A] bg-dark"
              }`}
            >
              {/* Drag handle — touch target */}
              <div
                className="pl-3 py-5 text-[#8E8E93] cursor-grab active:cursor-grabbing touch-none"
                onTouchStart={(e) => handleTouchStart(e, idx)}
              >
                <GripVertical className="w-4 h-4 text-[#9BFF30]" />
              </div>

              {/* Tappable area */}
              <button
                onClick={() => !dragState && navigate(`/routines/edit/${key}`)}
                className="flex items-center gap-4 p-4 pl-1 flex-1 min-w-0 text-left"
              >
                {/* Day label */}
                <div className="w-10 shrink-0">
                  <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">
                    {label.slice(0, 3)}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {isTraining && day.type === "training" ? (
                    <>
                      <p
                        className="font-bold text-white text-sm"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        {day.workoutName}
                      </p>
                      <p className="text-xs text-[#8E8E93] mt-0.5">
                        {day.exercises.length} ejercicios ·{" "}
                        {day.muscleGroups.join(", ")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-[#8E8E93]">Día de descanso</p>
                  )}
                </div>

                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isTraining ? "bg-[#3A3A3C]" : "bg-[#3A3A3C]"
                  }`}
                >
                  {isRest ? (
                    <Plus className="w-4 h-4 text-white" />
                  ) : (
                    <Pen className="w-4 h-4 text-[white]" strokeWidth={2.5} />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
