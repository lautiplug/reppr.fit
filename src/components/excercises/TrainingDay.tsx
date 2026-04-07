import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle, FileSpreadsheet, Redo2 } from "lucide-react";
import type { DayExercise, WeekDay } from "@/types";
import { useSessionStore } from "@/store/useSessionStore";
import { useSessionHistoryQuery } from "@/lib/queries";
import { useActiveSession } from "./hooks/useActiveSession";
import { getFlipImageUrl } from "./utils";
import { PlanExerciseRow } from "./PlanExerciseRow";
import { ExerciseStory } from "./ExerciseStory";
import { SwapSheet } from "./SwapSheet";
import { SummaryModal, AbandonModal } from "./SessionModals";
import { Card } from "@/components/ui/card";
import { ShineBorder } from "../ui/shine-border";
import type { CompletedSession } from "@/types";

function completedToday(workoutName: string, history: CompletedSession[]): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return history.some(
    (s) => s.date.slice(0, 10) === today && s.workoutName === workoutName,
  );
}

interface Props {
  selectedDay: WeekDay;
  onSelectDay: (day: WeekDay) => void;
  trainingDays: Partial<Record<WeekDay, boolean>>;
  workoutName: string;
  dayLabel: string;
  muscleGroups: string[];
  exercises: DayExercise[];
  stats: {
    exerciseCount: number;
    totalSets: number;
    durationMin: number;
  };
}

export const TrainingDay = ({
  workoutName,
  muscleGroups,
  exercises,
}: Props) => {
  const navigate = useNavigate();
  const [swapOpen, setSwapOpen] = useState(false);
  const { startSession, currentExerciseIndex, goToExercise, nextExercise, prevExercise, swapExercise } = useSessionStore();
  const { data: history = [] } = useSessionHistoryQuery();
  const {
    active,
    elapsed,
    totalSets,
    completedSets,
    summary,
    showAbandon,
    handleFinish,
    handleAbandon,
    setShowAbandon,
    clearSummary,
  } = useActiveSession();
  const alreadyDone = !active && completedToday(workoutName, history);

  useEffect(() => {
    exercises.forEach((ex) => {
      if (!ex.gif_url) return;
      new Image().src = ex.gif_url;
      new Image().src = getFlipImageUrl(ex.gif_url);
    });
  }, [exercises]);

  return (
    <div
      style={{
        paddingBottom: "calc(8rem + env(safe-area-inset-bottom, 0px))",
        paddingTop: active ? "5rem" : undefined,
      }}
    >
      {active && (
        <div
          className="fixed top-0 left-0 right-0 z-20 bg-dark px-5 pb-3"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <p
                className="font-black text-white text-lg leading-tight"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {workoutName}
              </p>
              <p className="text-[12px] font-semibold text-[#8E8E93]">
                {elapsed} · {completedSets}/{totalSets} series
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAbandon(true)}
                className="text-[12px] font-semibold border border-white text-white px-2 py-1 rounded-xl"
              >
                Abandonar
              </button>
              <button
                onClick={handleFinish}
                className="text-[13px] font-semibold bg-[#9BFF30] text-dark px-2 py-1 rounded-xl"
              >
                Finalizar
              </button>
            </div>
          </div>
          <div className="h-1 bg-[#3A3A3C] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#9BFF30] rounded-full transition-all duration-300"
              style={{
                width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="px-5 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map((group) => (
            <span
              key={group}
              className="px-3 py-1.5 rounded-full bg-[#9BFF30]/15 text-[#9BFF30] text-[12px] font-semibold"
            >
              {group}
            </span>
          ))}
        </div>

        {alreadyDone ? (
          <Card className="relative w-full py-4 bg-[#191919] rounded-2xl flex items-center justify-center gap-2 overflow-hidden">
            <span className="text-white font-semibold text-base flex items-center gap-4">
              <CheckCircle className="w-5 h-5 text-[#9BFF30]" />
              Entrenamiento completado
            </span>
            <ShineBorder shineColor={["gold", "gold", "gold"]} />
          </Card>
        ) : null}

        {!active && (
          <div className="flex flex-col gap-2">
            {exercises.map((ex, i) => (
              <div
                key={ex.order}
                className="animate-[fadeIn_0.3s_ease-out_both]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <PlanExerciseRow ex={ex} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>

      {!active && (
        <div
          className="px-5 z-20"
          style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {alreadyDone ? (
            <div className="flex flex-col gap-2 mt-6">
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/session/summary")}
                  className="flex-1 py-3 text-white font-semibold text-sm bg-black rounded-2xl flex items-center justify-center gap-1"
                >
                 <FileSpreadsheet size={16}/> Ver resumen
                </button>
                <button
                  onClick={() => startSession(workoutName, exercises)}
                  className="flex-1 py-3 text-white font-semibold text-sm bg-black rounded-2xl flex items-center justify-center gap-1"
                >
                  <span><Redo2/></span>
                  Repetir
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => startSession(workoutName, exercises)}
              className="w-full py-4 mb-5 bg-[#9BFF30] text-black font-medium text-base rounded-2xl mt-6"
            >
              Entrenar
            </button>
          )}
        </div>
      )}

      {summary && <SummaryModal summary={summary} onClose={clearSummary} />}
      {showAbandon && (
        <AbandonModal
          onConfirm={handleAbandon}
          onCancel={() => setShowAbandon(false)}
        />
      )}

      {/* Story viewer — overlay completo cuando la sesión está activa */}
      {active && (
        <div className="fixed inset-0 z-30 bg-black flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          {/* Top bar: workout name + controles */}
          <div className="flex justify-between items-center px-4 pt-2 pb-1 shrink-0">
            <div>
              <p className="font-black text-white text-base leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                {workoutName}
              </p>
              <p className="text-[11px] font-semibold text-white/40">
                {elapsed} · {completedSets}/{totalSets} series
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAbandon(true)}
                className="text-[12px] font-semibold border border-white/30 text-white/60 px-2.5 py-1 rounded-xl cursor-pointer"
              >
                Abandonar
              </button>
              <button
                onClick={handleFinish}
                className="text-[13px] font-semibold bg-brand text-black px-2.5 py-1 rounded-xl cursor-pointer"
              >
                Finalizar
              </button>
            </div>
          </div>

          {/* Story del ejercicio actual */}
          <div className="flex-1 overflow-hidden">
            <ExerciseStory
              ex={active.exercises[currentExerciseIndex]}
              exIndex={currentExerciseIndex}
              total={active.exercises.length}
              onPrev={prevExercise}
              onNext={nextExercise}
              onSwap={() => setSwapOpen(true)}
            />
          </div>
        </div>
      )}

      {/* SwapSheet */}
      {swapOpen && active && (
        <SwapSheet
          muscleGroup={exercises[currentExerciseIndex]?.muscle_group}
          currentName={active.exercises[currentExerciseIndex].name}
          onSelect={(replacement) => {
            swapExercise(currentExerciseIndex, replacement)
            setSwapOpen(false)
          }}
          onClose={() => setSwapOpen(false)}
        />
      )}
    </div>
  );
};
