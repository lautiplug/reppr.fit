import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/store/useSessionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { queryKeys } from "@/lib/queries";

export type SessionSummary = {
  workoutName: string;
  durationMin: number;
  completedSets: number;
  totalSets: number;
  totalKg: number;
};


export function useActiveSession() {
  const { finishSession, abandonSession } = useSessionStore();
  const active = useSessionStore(s => s.active);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.user?.id);

  const [elapsed, setElapsed] = useState("0:00");
  const [showAbandon, setShowAbandon] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  // pausedMs accumulates time spent with the app in background
  const pausedMs = useRef(0);
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    if (!active) { setElapsed("0:00"); pausedMs.current = 0; return; }

    const tick = () => {
      const ms = Date.now() - new Date(active.startedAt).getTime() - pausedMs.current;
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setElapsed(`${min}:${sec.toString().padStart(2, "0")}`);
    };

    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now();
      } else if (hiddenAt.current != null) {
        pausedMs.current += Date.now() - hiddenAt.current;
        hiddenAt.current = null;
        tick();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [!!active, active?.startedAt]);

  const totalSets = active?.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) ?? 0;
  const completedSets = active?.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0) ?? 0;

  const handleFinish = () => {
    if (!active) return;
    const completedSetsCount = active.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
    const totalSetsCount = active.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const totalKg = active.exercises.reduce((acc, ex) =>
      acc + ex.sets.filter(s => s.completed).reduce((a, s) => a + ((s.weight_kg ?? 0) * (typeof s.reps === 'number' ? s.reps : 1)), 0), 0
    );
    const durationMin = Math.round((Date.now() - new Date(active.startedAt).getTime()) / 60000);
    setSummary({ workoutName: active.workoutName, durationMin, completedSets: completedSetsCount, totalSets: totalSetsCount, totalKg });
    finishSession();
    if (userId) queryClient.invalidateQueries({ queryKey: queryKeys.sessionHistory(userId) });
    navigate('/session/summary');
  };

  const handleAbandon = () => {
    abandonSession();
    setShowAbandon(false);
  };

  return {
    active,
    elapsed,
    totalSets,
    completedSets,
    summary,
    showAbandon,
    handleFinish,
    handleAbandon,
    setShowAbandon,
    clearSummary: () => setSummary(null),
  };
}
