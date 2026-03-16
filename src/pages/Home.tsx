import { OverallStatus } from "@/components/home/OverallStatus";
import { TodayCard } from "@/components/home/TodayCard";
import { LastSession } from "@/components/home/LastSession";
import type { SessionExercise } from "@/components/home/LastSession";
import { RoutinesPreview } from "@/components/home/RoutinesPreview";
import { Navbar } from "@/components/ui/Navbar";
import { WeekStrip } from "@/components/excercises/WeekStrip";
import { useRoutineStore } from "@/store/useRoutineStore";
import { useSessionStore } from "@/store/useSessionStore";
import { getTodayKey } from "@/components/excercises/utils";
import type { WeekDay } from "@/types";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const WEEK_KEYS: WeekDay[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

const DAY_LABELS: Record<WeekDay, string> = {
  lun: "Lunes",
  mar: "Martes",
  mie: "Miércoles",
  jue: "Jueves",
  vie: "Viernes",
  sab: "Sábado",
  dom: "Domingo",
};

export const Home = () => {
  const { schedule, selectedDay: storedDay, setSelectedDay } = useRoutineStore();
  const history = useSessionStore(s => s.history);
  const selectedDay = storedDay ?? getTodayKey();
  const [previewGifs, setPreviewGifs] = useState<string[]>([]);
  const [gifCount, setGifCount] = useState(0);

  useEffect(() => {
    const daySchedule = schedule?.[selectedDay];
    if (daySchedule?.type !== "training") { setPreviewGifs([]); setGifCount(0); return; }

    const exercises = daySchedule.exercises.slice(0, 3);
    setGifCount(exercises.length);
    const already = exercises.map(e => e.gif_url).filter((u): u is string => !!u);

    if (already.length === exercises.length) {
      setPreviewGifs(already);
      return;
    }

    const missingNames = exercises.filter(e => !e.gif_url).map(e => e.name);
    supabase
      .from("exercises")
      .select("name, gif_url")
      .in("name", missingNames)
      .then(({ data }) => {
        const gifByName: Record<string, string> = {};
        if (data) for (const row of data) if (row.gif_url) gifByName[row.name] = row.gif_url;
        setPreviewGifs(exercises.map(e => e.gif_url ?? gifByName[e.name] ?? "").filter(Boolean));
      });
  }, [selectedDay, schedule]);

  // Compute streak: count consecutive days (from today backwards) that have a completed session
  const streak = (() => {
    if (history.length === 0) return 0;
    const sessionDays = new Set(history.map(s => s.date.slice(0, 10)));
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

  // Map last completed session to LastSession shape
  const lastSession = history[0] ?? null;
  const lastSessionExercises: SessionExercise[] | null = lastSession
    ? lastSession.exercises.map(ex => {
        const maxWeight = ex.sets.reduce((max, s) => Math.max(max, s.weight_kg ?? 0), 0);
        return {
          name: ex.name_es ?? ex.name,
          muscle: "",
          sets: ex.sets.length,
          weight: maxWeight > 0 ? `${maxWeight} kg` : "—",
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

  const routines = schedule
    ? WEEK_KEYS.flatMap((key) => {
        const day = schedule[key];
        if (!day || day.type !== "training") return [];
        return [{ day: DAY_LABELS[key], name: day.workoutName, exercises: day.exercises.length, active: key === selectedDay }];
      })
    : null;

  const active = useSessionStore(s => s.active);
  const selectedSchedule = schedule?.[selectedDay];
  const todayKey = new Date().toISOString().slice(0, 10);
  const alreadyCompleted =
    selectedSchedule?.type === "training" &&
    !active &&
    history.some(s => s.date.slice(0, 10) === todayKey && s.workoutName === selectedSchedule.workoutName);

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
    <section className="bg-black min-h-full">
      {/* Navbar */}
      <Navbar />
      {/* Scroll content */}
      <div className="pb-28 flex flex-col gap-5">
        <div className="px-5">
          <WeekStrip
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            trainingDays={trainingDays}
          />
        </div>
        <div className="px-5 flex flex-col gap-5">
          <TodayCard workout={selectedWorkout} streak={streak} dayLabel={DAY_LABELS[selectedDay]} previewGifs={previewGifs} gifCount={gifCount} />
          <LastSession exercises={lastSessionExercises} />
          <RoutinesPreview routines={routines} />
          <OverallStatus />
        </div>
      </div>
    </section>
  );
};
