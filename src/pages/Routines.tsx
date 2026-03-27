import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { RoutineSetupAnswers } from "@/types";
import { SetupQuiz } from "@/components/routines/SetupQuiz";
import { WeekEditor } from "@/components/routines/WeekEditor";
import { useRoutineQuery, useGenerateRoutineMutation, useClearRoutineMutation, useSaveRoutineMutation } from "@/lib/queries";

export const Routines = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useRoutineQuery();
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
              className="w-1.5 h-1.5 rounded-full bg-[#9BFF30]"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.schedule) {
    return <SetupQuiz onComplete={handleQuizComplete} onSkip={handleSkip} initialAnswers={data?.lastAnswers ?? undefined} />;
  }

  const handleBack = cameFromQuiz ? () => clearRoutine.mutate() : () => navigate(-1);
  const handleReset = () => clearRoutine.mutate();
  return (
    <WeekEditor
      schedule={data.schedule}
      onConfirm={handleConfirm}
      onBack={handleBack}
      onReset={handleReset}
    />
  );
};
