import { useState, useEffect } from "react";
import * as Sentry from '@sentry/react';
import { TodayCard } from "@/components/home/TodayCard";
import { LastSession } from "@/components/home/LastSession";
import type { SessionExercise } from "@/components/home/LastSession";
import { RoutinesPreview } from "@/components/home/RoutinesPreview";
import { Navbar } from "@/components/ui/Navbar";
import { WeekStrip } from "@/components/excercises/WeekStrip";
import { useRoutineStore } from "@/store/useRoutineStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useRoutineQuery, useSessionHistoryQuery } from "@/lib/queries";
import { getTodayKey } from "@/components/excercises/utils";
import { supabase } from "@/lib/supabase";
import type { WeekDay, DayExercise, CompletedSession } from "@/types";

const WEEK_KEYS: WeekDay[] = ["L", "M", "X", "J", "V", "S", "D"];

const DAY_LABELS: Record<WeekDay, string> = {
  L: "Lunes", M: "Martes", X: "Miércoles", J: "Jueves",
  V: "Viernes", S: "Sábado", D: "Domingo",
};

export const Home = () => {
  const { selectedDay: storedDay, setSelectedDay } = useRoutineStore();
  const active = useSessionStore(s => s.active);
  const { data: routineData } = useRoutineQuery();
  const { data: history = [], isLoading: historyLoading } = useSessionHistoryQuery();
  const schedule = routineData?.schedule ?? null;
  const selectedDay = storedDay ?? getTodayKey();

  const [previewGifs, setPreviewGifs] = useState<string[]>([]);
  const [gifCount, setGifCount] = useState(0);

  useEffect(() => {
    const daySchedule = schedule?.[selectedDay];
    if (daySchedule?.type !== "training") {
      void Promise.resolve().then(() => { setPreviewGifs([]); setGifCount(0); });
      return;
    }

    const exercises = daySchedule.exercises.slice(0, 3);
    const already = exercises.map((e: DayExercise) => e.gif_url).filter((u): u is string => !!u);

    if (already.length === exercises.length) {
      void Promise.resolve().then(() => { setGifCount(exercises.length); setPreviewGifs(already); });
      return;
    }

    const missingNames = exercises.filter((e: DayExercise) => !e.gif_url).map((e: DayExercise) => e.name);
    supabase
      .from("exercises")
      .select("name, gif_url")
      .in("name", missingNames)
      .then(({ data, error }) => {
        if (error) { Sentry.captureException(error); return; }
        const gifByName: Record<string, string> = {};
        if (data) for (const row of data) if (row.gif_url) gifByName[row.name] = row.gif_url;
        setGifCount(exercises.length);
        setPreviewGifs(exercises.map((e: DayExercise) => e.gif_url ?? gifByName[e.name] ?? "").filter(Boolean));
      });
  }, [selectedDay, schedule]);

  const selectedSchedule = schedule?.[selectedDay];

  const streak = (() => {
    if (history.length === 0) return 0;
    const sessionDays = new Set(history.map((s: CompletedSession) => s.date.slice(0, 10)));
    let count = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (!sessionDays.has(key)) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const selectedWorkoutName = selectedSchedule?.type === "training" ? selectedSchedule.workoutName : null;
  const lastSessionForDay = selectedWorkoutName
    ? (history.find((s: CompletedSession) => s.workoutName === selectedWorkoutName) ?? null)
    : null;
  const lastSession = lastSessionForDay ?? history[0] ?? null;
  const lastSessionLabel = lastSessionForDay ? `Última sesión · ${DAY_LABELS[selectedDay]}` : "Última sesión";

  const prevSessionForDay = selectedWorkoutName
    ? (history.filter((s: CompletedSession) => s.workoutName === selectedWorkoutName)[1] ?? null)
    : null;
  const prevSession = prevSessionForDay ?? history[1] ?? null;

  const lastSessionExercises: SessionExercise[] | null = lastSession
    ? lastSession.exercises.map(ex => {
        const sets = ex.sets ?? [];
        const maxWeight = sets.reduce((max, s) => Math.max(max, s.weight_kg ?? 0), 0);
        const prevEx = prevSession?.exercises.find(
          pe => pe.name === ex.name && !pe.skipped && pe.sets.length > 0
        );
        const prevMaxWeight = prevEx
          ? prevEx.sets.reduce((max, s) => Math.max(max, s.weight_kg ?? 0), 0)
          : null;
        const weightDelta = prevMaxWeight != null && maxWeight > 0
          ? Math.round((maxWeight - prevMaxWeight) * 10) / 10
          : null;
        return {
          name: ex.name_es ?? ex.name,
          muscle: "",
          sets: sets.length,
          weight: maxWeight > 0 ? `${maxWeight} kg` : "—",
          weightDelta,
        };
      })
    : null;

  const trainingDays = schedule
    ? (Object.fromEntries(
        Object.entries(schedule)
          .filter(([, v]) => v?.type === "training")
          .map(([k]) => [k, true])
      ) as Partial<Record<WeekDay, boolean>>)
    : undefined;

  const completedDays = (() => {
    if (historyLoading) return undefined;
    const toLocalDate = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const sessionDates = new Set(history.map((s: CompletedSession) => toLocalDate(new Date(s.date))));
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const entries = WEEK_KEYS.map((key, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return [key, sessionDates.has(toLocalDate(d))] as const;
    }).filter(([, v]) => v);
    return entries.length ? Object.fromEntries(entries) as Partial<Record<WeekDay, boolean>> : undefined;
  })();

  const routines = schedule
    ? WEEK_KEYS.flatMap((key) => {
        const day = schedule[key];
        if (!day || day.type !== "training") return [];
        return [{ day: DAY_LABELS[key], name: day.workoutName, exercises: day.exercises.length, active: key === selectedDay }];
      })
    : null;

  const todayKey = new Date().toISOString().slice(0, 10);
  const alreadyCompleted =
    selectedSchedule?.type === "training" &&
    !active &&
    history.some((s: CompletedSession) => s.date.slice(0, 10) === todayKey && s.workoutName === selectedSchedule.workoutName);

  const isRestDay = selectedSchedule?.type === "rest";

  const selectedWorkout =
    selectedSchedule?.type === "training"
      ? {
          name: selectedSchedule.workoutName,
          description: selectedSchedule.muscleGroups.join(", "),
          progress: alreadyCompleted
            ? 100
            : active?.workoutName === selectedSchedule.workoutName
            ? Math.round(
                (active.exercises.flatMap(e => e.sets).filter(s => s.completed).length /
                  Math.max(active.exercises.flatMap(e => e.sets).length, 1)) * 100
              )
            : 0,
          completed: alreadyCompleted,
          exercisesTotal: selectedSchedule.exercises.length,
          exercisesDone: alreadyCompleted
            ? selectedSchedule.exercises.length
            : active?.workoutName === selectedSchedule.workoutName
            ? active.exercises.filter(e => e.sets.every(s => s.completed)).length
            : 0,
        }
      : null;

  return (
    <section className="min-h-full">
      <Navbar />
      <div className="pb-28 flex flex-col gap-5">
        <div className="px-3">
          <WeekStrip
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            trainingDays={trainingDays}
            completedDays={completedDays}
          />
        </div>
        <div className="px-5 flex flex-col gap-5">
          <TodayCard workout={selectedWorkout} isRestDay={isRestDay} streak={streak} dayLabel={DAY_LABELS[selectedDay]} previewGifs={previewGifs} gifCount={gifCount} />
          <LastSession exercises={lastSessionExercises} label={lastSessionLabel} />
          <RoutinesPreview routines={routines} />
        </div>
      </div>
    </section>
  );
};
