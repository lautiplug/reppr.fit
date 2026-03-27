import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { RoutineSetupAnswers } from "@/types";
import { SetupQuiz } from "@/components/routines/SetupQuiz";
import { WeekEditor } from "@/components/routines/WeekEditor";
import { useRoutineQuery, useGenerateRoutineMutation, useClearRoutineMutation, useSaveRoutineMutation } from "@/lib/queries";

const formatLastSync = (timestamp: number) => {
  if (!timestamp) return "Sin sincronizar";
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
};

export const Routines = () => {
  const navigate = useNavigate();
  const { data, isLoading, dataUpdatedAt, isFetching, refetch } = useRoutineQuery();
  const generateRoutine = useGenerateRoutineMutation();
  const clearRoutine = useClearRoutineMutation();
  const saveRoutine = useSaveRoutineMutation();
  const [cameFromQuiz, setCameFromQuiz] = useState(false);

  const handleQuizComplete = (answers: RoutineSetupAnswers) => {
    generateRoutine.mutate(answers);
    setCameFromQuiz(true);
  };

  const handleSkip = () => {
    saveRoutine.mutate({ schedule: {}, lastAnswers: null });
    setCameFromQuiz(true);
  };

  const handleConfirm = () => navigate("/exercises");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[rgb(155,255,48)]"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.schedule) {
    return (
      <section className="min-h-screen bg-black px-5 pt-4">
        <div className="mb-4">
          <button
            onClick={() => refetch()}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80"
            disabled={isFetching}
          >
            {isFetching ? "Sincronizando..." : `Sync ${formatLastSync(dataUpdatedAt)}`}
          </button>
        </div>
        <SetupQuiz onComplete={handleQuizComplete} onSkip={handleSkip} initialAnswers={data?.lastAnswers ?? undefined} />
      </section>
    );
  }

  const handleBack = cameFromQuiz ? () => clearRoutine.mutate() : () => navigate(-1);
  const handleReset = () => clearRoutine.mutate();
  return (
    <section className="min-h-screen bg-black">
      <div className="px-5 pt-4 mb-2">
        <button
          onClick={() => refetch()}
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80"
          disabled={isFetching}
        >
          {isFetching ? "Sincronizando..." : `Sync ${formatLastSync(dataUpdatedAt)}`}
        </button>
      </div>
      <WeekEditor
        schedule={data.schedule}
        onConfirm={handleConfirm}
        onBack={handleBack}
        onReset={handleReset}
      />
    </section>
  );
};
