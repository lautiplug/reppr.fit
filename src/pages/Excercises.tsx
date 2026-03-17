import { Navigate, useNavigate } from "react-router-dom";
import type { WeekDay, DaySchedule } from "@/types";
import { TrainingDay } from "@/components/excercises/TrainingDay";
import { RestDay } from "@/components/excercises/RestDay";
import { getDayLabel, getTodayKey } from "@/components/excercises/utils";
import { useRoutineStore } from "@/store/useRoutineStore";
import { useRoutineQuery } from "@/lib/queries";

export const Excercises = () => {
  const navigate = useNavigate();
  const { selectedDay: storedDay, setSelectedDay } = useRoutineStore();
  const { data, isLoading } = useRoutineQuery();
  const selectedDay = storedDay ?? getTodayKey();

  if (isLoading) {
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

  if (!data?.schedule) {
    return <Navigate to="/routines" replace />;
  }

  const { schedule } = data;

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
