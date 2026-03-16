import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { RoutineSetupAnswers } from "@/types";
import { SetupQuiz } from "@/components/routines/SetupQuiz";
import { WeekEditor } from "@/components/routines/WeekEditor";
import { useRoutineStore } from "@/store/useRoutineStore";

export const Routines = () => {
  const navigate = useNavigate();
  const { schedule, hasRoutine, lastAnswers, generateFromAnswers, clearRoutine } = useRoutineStore();
  // true si el usuario completó el quiz en esta misma visita a /routines
  const [cameFromQuiz, setCameFromQuiz] = useState(false);

  const handleQuizComplete = (answers: RoutineSetupAnswers) => {
    generateFromAnswers(answers);
    setCameFromQuiz(true);
  };

  const handleConfirm = () => {
    navigate("/exercises");
  };

  if (!hasRoutine || !schedule) {
    return <SetupQuiz onComplete={handleQuizComplete} initialAnswers={lastAnswers ?? undefined} />;
  }

  const handleBack = cameFromQuiz ? clearRoutine : () => navigate(-1);

  return <WeekEditor schedule={schedule} onConfirm={handleConfirm} onBack={handleBack} onReset={clearRoutine} />;
};
