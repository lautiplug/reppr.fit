import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/store/useSessionStore";

export type SessionSummary = {
  workoutName: string;
  durationMin: number;
  completedSets: number;
  totalSets: number;
  totalKg: number;
};

function formatElapsed(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function useActiveSession() {
  const { finishSession, abandonSession } = useSessionStore();
  const active = useSessionStore(s => s.active);
  const navigate = useNavigate();

  const [elapsed, setElapsed] = useState("0:00");
  const [showAbandon, setShowAbandon] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const startedAtRef = useRef<string | null>(null);

  useEffect(() => {
    startedAtRef.current = active?.startedAt ?? null;
  }, [active?.startedAt]);

  useEffect(() => {
    if (!active) { setElapsed("0:00"); return; }
    setElapsed(formatElapsed(active.startedAt));
    const id = setInterval(() => {
      if (startedAtRef.current) setElapsed(formatElapsed(startedAtRef.current));
    }, 1000);
    return () => clearInterval(id);
  }, [!!active]);

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
