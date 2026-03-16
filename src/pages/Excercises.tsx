import { Navigate, useNavigate } from "react-router-dom";
import type { WeekDay, DaySchedule } from "@/types";
import { TrainingDay } from "@/components/excercises/TrainingDay";
import { RestDay } from "@/components/excercises/RestDay";
import {
  getDayLabel,
  getTodayKey,
} from "@/components/excercises/utils";
import { useRoutineStore } from "@/store/useRoutineStore";

export const Excercises = () => {
  const navigate = useNavigate();
  const { schedule, hasRoutine, selectedDay: storedDay, setSelectedDay } = useRoutineStore();
  const selectedDay = storedDay ?? getTodayKey();

  if (!hasRoutine || !schedule) {
    return <Navigate to="/routines" replace />;
  }

  const getDaySchedule = (day: WeekDay): DaySchedule => schedule[day] ?? { type: "rest" };

  const trainingDays = Object.fromEntries(
    Object.entries(schedule)
      .filter(([, v]) => v?.type === "training")
      .map(([k]) => [k, true])
  ) as Partial<Record<WeekDay, boolean>>;

  const daySchedule = getDaySchedule(selectedDay);

  const getNextTrainingDay = (from: WeekDay) => {
    const ORDER: WeekDay[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
    const fromIdx = ORDER.indexOf(from);
    for (let i = 1; i <= 6; i++) {
      const candidate = ORDER[(fromIdx + i) % 7];
      const s = getDaySchedule(candidate);
      if (s.type === "training") return { day: candidate, schedule: s };
    }
    return null;
  };

  if (daySchedule.type === "training") {
    const totalSets = daySchedule.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

    return (
      <TrainingDay
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        trainingDays={trainingDays}
        workoutName={daySchedule.workoutName}
        dayLabel={getDayLabel(selectedDay)}
        muscleGroups={daySchedule.muscleGroups}
        exercises={daySchedule.exercises}
        stats={{
          exerciseCount: daySchedule.exercises.length,
          totalSets,
          durationMin: totalSets * 3,
        }}
      />
    );
  }

  const next = getNextTrainingDay(selectedDay);

  return (
    <RestDay
      selectedDay={selectedDay}
      onSelectDay={setSelectedDay}
      trainingDays={trainingDays}
      nextWorkout={
        next
          ? {
              dayLabel: getDayLabel(next.day),
              name: next.schedule.workoutName,
              exerciseCount: next.schedule.exercises.length,
              durationMin: next.schedule.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) * 3,
            }
          : undefined
      }
      onTrainAnyway={() => navigate("/routines")}
    />
  );
};
