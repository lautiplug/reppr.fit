import { useState, useMemo } from "react";
import { Search, ChevronRight, Clock, Zap, Weight } from "lucide-react";
import { useSessionHistoryQuery } from "@/lib/queries";
import type { CompletedSession, CompletedExercise } from "@/types";

// --- Helpers ---

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";

  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "short" });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function calcVolume(session: CompletedSession): number {
  return session.exercises.flatMap(e => e.sets).reduce((acc, s) => {
    if (s.reps === "fallo" || !s.weight_kg) return acc;
    return acc + s.reps * s.weight_kg;
  }, 0);
}

function calcTotalSets(session: CompletedSession): number {
  return session.exercises.filter(e => !e.skipped).reduce((acc, e) => acc + e.sets.length, 0);
}

// Agrupa sesiones por fecha relativa
function groupByDate(sessions: CompletedSession[]): { label: string; items: CompletedSession[] }[] {
  const groups: Record<string, CompletedSession[]> = {};
  for (const s of sessions) {
    const label = formatDate(s.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

// --- Session detail sheet ---

function SetRow({ set, index }: { set: CompletedSession["exercises"][0]["sets"][0]; index: number }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-5 text-center text-[11px] font-bold text-white/30">{index + 1}</span>
      <span className="flex-1 text-[13px] font-semibold text-white">
        {set.reps === "fallo" ? "Fallo" : `${set.reps} reps`}
      </span>
      <span className="text-[13px] text-white/60">
        {set.weight_kg ? `${set.weight_kg} kg` : "—"}
      </span>
      {set.rir !== undefined && (
        <span className="text-[11px] font-bold text-brand bg-brand/10 rounded-md px-1.5 py-0.5">
          RIR {set.rir}
        </span>
      )}
    </div>
  );
}

function ExerciseDetail({ ex }: { ex: CompletedExercise }) {
  const [open, setOpen] = useState(false);
  const maxWeight = ex.sets.reduce((m, s) => Math.max(m, s.weight_kg ?? 0), 0);

  if (ex.skipped) {
    return (
      <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
        <div className="w-1 h-8 rounded-full bg-white/10 shrink-0" />
        <p className="text-white/30 text-[13px] line-through">{ex.name_es ?? ex.name}</p>
        <span className="ml-auto text-[11px] text-white/20">Salteado</span>
      </div>
    );
  }

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 py-3 cursor-pointer text-left"
      >
        <div className="w-1 h-8 rounded-full bg-brand shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-[13px] font-semibold truncate">{ex.name_es ?? ex.name}</p>
          <p className="text-white/40 text-[11px]">
            {ex.sets.length} series{maxWeight > 0 ? ` · ${maxWeight} kg máx` : ""}
            {ex.swappedFrom && <span className="ml-1 text-brand/60">· swap</span>}
          </p>
        </div>
        <ChevronRight
          size={14}
          className={`text-white/30 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="pl-4 pb-3">
          {ex.sets.map((s, si) => <SetRow key={si} set={s} index={si} />)}
        </div>
      )}
    </div>
  );
}

function SessionSheet({ session, onClose }: { session: CompletedSession; onClose: () => void }) {
  const volume = calcVolume(session);
  const totalSets = calcTotalSets(session);
  const completed = session.exercises.filter(e => !e.skipped);

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] rounded-t-3xl max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-1 shrink-0" />

        {/* Header */}
        <div className="px-5 pt-2 pb-4 border-b border-white/8 shrink-0">
          <p className="text-white/40 text-[11px] uppercase tracking-wider mb-0.5">
            {formatDate(session.date)} · {formatTime(session.date)}
          </p>
          <h2 className="font-black text-white text-xl leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            {session.workoutName}
          </h2>

          {/* Stats row */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-white/40" />
              <span className="text-[13px] font-semibold text-white">{formatDuration(session.durationMin)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={13} className="text-white/40" />
              <span className="text-[13px] font-semibold text-white">{totalSets} series</span>
            </div>
            {volume > 0 && (
              <div className="flex items-center gap-1.5">
                <Weight size={13} className="text-white/40" />
                <span className="text-[13px] font-semibold text-white">
                  {volume >= 1000 ? `${(volume / 1000).toFixed(1)}t` : `${Math.round(volume)} kg`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-white/40">
                {completed.length}/{session.exercises.length} ejercicios
              </span>
            </div>
          </div>
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1 px-5 pb-8">
          {session.exercises.map((ex, i) => (
            <ExerciseDetail key={i} ex={ex} />
          ))}
        </div>
      </div>
    </>
  );
}

// --- Session card ---

function SessionCard({ session, onClick }: { session: CompletedSession; onClick: () => void }) {
  const volume = calcVolume(session);
  const totalSets = calcTotalSets(session);
  const completedCount = session.exercises.filter(e => !e.skipped).length;

  return (
    <button
      onClick={onClick}
      className="w-full bg-[#111] border border-white/8 rounded-2xl px-4 py-4 flex items-center gap-4 cursor-pointer hover:border-white/20 transition-colors text-left"
    >
      {/* Color accent */}
      <div className="w-1 self-stretch rounded-full bg-brand shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="font-black text-white text-[15px] leading-tight truncate" style={{ fontFamily: "Syne, sans-serif" }}>
          {session.workoutName}
        </p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] text-white/40">
            <Clock size={11} /> {formatDuration(session.durationMin)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-white/40">
            <Zap size={11} /> {totalSets} series
          </span>
          {volume > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-white/40">
              <Weight size={11} />
              {volume >= 1000 ? `${(volume / 1000).toFixed(1)}t` : `${Math.round(volume)} kg`}
            </span>
          )}
          <span className="text-[11px] text-white/25">{completedCount}/{session.exercises.length} ejercicios</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[11px] text-white/30">{formatTime(session.date)}</span>
        <ChevronRight size={14} className="text-white/20" />
      </div>
    </button>
  );
}

// --- Page ---

export const History = () => {
  const { data: history = [], isLoading } = useSessionHistoryQuery();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CompletedSession | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    const q = query.toLowerCase();
    return history.filter(s =>
      s.workoutName.toLowerCase().includes(q) ||
      s.exercises.some(e => (e.name_es ?? e.name).toLowerCase().includes(q))
    );
  }, [history, query]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-5 pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}>
      {/* Search */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 bg-white/6 border border-white/8 rounded-2xl px-4 h-11">
          <Search size={15} className="text-white/30 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar sesión o ejercicio..."
            className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder:text-white/25"
          />
        </div>
      </div>

      {/* Empty state */}
      {history.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-24 px-8 gap-3">
          <p className="text-4xl">🏋️</p>
          <p className="text-white font-bold text-lg text-center">Sin sesiones todavía</p>
          <p className="text-white/40 text-sm text-center">Completá tu primer entrenamiento para verlo acá</p>
        </div>
      )}

      {filtered.length === 0 && history.length > 0 && (
        <div className="flex flex-col items-center justify-center pt-16 px-8 gap-2">
          <p className="text-white/40 text-sm text-center">Sin resultados para "{query}"</p>
        </div>
      )}

      {/* Grouped list */}
      <div className="flex flex-col gap-6 px-5">
        {groups.map(({ label, items }) => (
          <div key={label}>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-2 capitalize">
              {label}
            </p>
            <div className="flex flex-col gap-2">
              {items.map(s => (
                <SessionCard key={s.id} session={s} onClick={() => setSelected(s)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <SessionSheet session={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};
