import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, Zap, SkipForward, Weight, ChevronRight, Dumbbell } from "lucide-react";
import { useSessionHistoryQuery } from "@/lib/queries";
import type { CompletedSession } from "@/types";

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function calcVolume(session: CompletedSession): number {
  return session.exercises.flatMap(e => e.sets).reduce((acc, s) => {
    if (s.reps === "fallo" || !s.weight_kg) return acc;
    return acc + s.reps * s.weight_kg;
  }, 0);
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex-1 bg-white/5 border border-white/8 rounded-2xl p-4 flex flex-col items-center gap-1.5">
      <div className="text-brand">{icon}</div>
      <p className="text-white font-black text-xl" style={{ fontFamily: "Syne, sans-serif" }}>{value}</p>
      <p className="text-white/40 text-[11px] text-center uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function SessionSummary() {
  const navigate = useNavigate();
  const { data: history = [] } = useSessionHistoryQuery();
  const session: CompletedSession | null = history[0] ?? null;

  useEffect(() => {
    if (!session) navigate("/", { replace: true });
  }, [session, navigate]);

  if (!session) return null;

  const completed = session.exercises.filter(e => !e.skipped && e.sets.length > 0);
  const skipped = session.exercises.filter(e => e.skipped);
  const totalSets = completed.reduce((acc, e) => acc + e.sets.length, 0);
  const volume = calcVolume(session);
  const volumeLabel = volume >= 1000
    ? `${(volume / 1000).toFixed(1)}t`
    : `${Math.round(volume)} kg`;

  return (
    <div className="min-h-screen bg-black flex flex-col px-5 pt-14 pb-10">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-16 h-16 rounded-full bg-brand/15 flex items-center justify-center mb-1">
          <CheckCircle className="w-8 h-8 text-brand" strokeWidth={1.5} />
        </div>
        <h1 className="font-black text-white text-2xl text-center" style={{ fontFamily: "Syne, sans-serif" }}>
          ¡Entrenamiento completado!
        </h1>
        <p className="text-white/40 text-sm text-center">{session.workoutName}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-2.5 mb-6">
        <StatCard icon={<Clock className="w-4 h-4" />} label="Duración" value={formatDuration(session.durationMin)} />
        <StatCard icon={<Zap className="w-4 h-4" />} label="Series" value={String(totalSets)} />
        {volume > 0 && (
          <StatCard icon={<Weight className="w-4 h-4" />} label="Volumen" value={volumeLabel} />
        )}
      </div>

      {/* Exercise list */}
      <div className="flex flex-col gap-2 mb-8 flex-1">
        <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-1">
          Ejercicios · {completed.length}/{session.exercises.length}
        </p>

        {completed.map((ex, i) => {
          const maxWeight = ex.sets.reduce((m, s) => Math.max(m, s.weight_kg ?? 0), 0);
          const totalVol = ex.sets.reduce((acc, s) => {
            if (s.reps === "fallo" || !s.weight_kg) return acc;
            return acc + s.reps * s.weight_kg;
          }, 0);

          return (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3.5 flex items-center gap-3">
              <div className="w-1 self-stretch rounded-full bg-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-[14px] truncate">{ex.name_es ?? ex.name}</p>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <span className="text-white/40 text-[11px]">{ex.sets.length} series</span>
                  {maxWeight > 0 && <span className="text-white/40 text-[11px]">{maxWeight} kg máx</span>}
                  {totalVol > 0 && <span className="text-white/25 text-[11px]">Vol. {Math.round(totalVol)} kg·rep</span>}
                </div>
              </div>
              <Dumbbell size={14} className="text-white/20 shrink-0" />
            </div>
          );
        })}

        {skipped.map((ex, i) => (
          <div key={i} className="bg-white/3 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-1 self-stretch rounded-full bg-white/15 shrink-0" />
            <p className="text-white/25 text-[13px] line-through flex-1 truncate">{ex.name_es ?? ex.name}</p>
            <SkipForward size={13} className="text-white/20 shrink-0" />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => navigate("/history")}
          className="w-full py-3.5 rounded-2xl bg-white/8 border border-white/10 text-white font-semibold text-[15px] flex items-center justify-center gap-2"
        >
          <ChevronRight size={16} className="text-white/40" />
          Ver historial completo
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full py-3.5 rounded-2xl bg-brand text-black font-black text-[15px]"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
}
