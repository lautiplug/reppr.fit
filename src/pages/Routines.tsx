import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { RoutineSetupAnswers } from "@/types";
import { SetupQuiz } from "@/components/routines/SetupQuiz";
import { WeekEditor } from "@/components/routines/WeekEditor";
import { useRoutineStore } from "@/store/useRoutineStore";

export const Routines = () => {
  const navigate = useNavigate();
  const { schedule, hasRoutine, loadingRoutine, lastAnswers, generateFromAnswers, clearRoutine } = useRoutineStore();
  // true si el usuario completó el quiz en esta misma visita a /routines
  const [cameFromQuiz, setCameFromQuiz] = useState(false);

  const handleQuizComplete = (answers: RoutineSetupAnswers) => {
    generateFromAnswers(answers);
    setCameFromQuiz(true);
  };

  const handleConfirm = () => {
    navigate("/exercises");
  };

  if (loadingRoutine) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!hasRoutine || !schedule) {
    return <SetupQuiz onComplete={handleQuizComplete} initialAnswers={lastAnswers ?? undefined} />;
  }

  const handleBack = cameFromQuiz ? clearRoutine : () => navigate(-1);

  return <WeekEditor schedule={schedule} onConfirm={handleConfirm} onBack={handleBack} onReset={clearRoutine} />;
};
