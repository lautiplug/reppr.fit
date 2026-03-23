import { useMemo, useState } from "react";
import { useSessionHistoryQuery, useRoutineQuery } from "@/lib/queries";
import type { CompletedSession, WeekDay, DayExercise } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Dot,
} from "recharts";

// --- Data helpers ---

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function weekLabel(isoWeek: string): string {
  const num = parseInt(isoWeek.split("-W")[1], 10);
  return `S${num}`;
}

// Fake data shown when there's no real history yet
const MOCK_DATA: WeekPoint[] = [
  { week: "2025-W01", label: "S1", volume: 1200, maxWeight: 80 },
  { week: "2025-W02", label: "S2", volume: 1350, maxWeight: 80 },
  { week: "2025-W03", label: "S3", volume: 1300, maxWeight: 82.5 },
  { week: "2025-W04", label: "S4", volume: 1500, maxWeight: 85 },
  { week: "2025-W05", label: "S5", volume: 1480, maxWeight: 85 },
  { week: "2025-W06", label: "S6", volume: 1650, maxWeight: 87.5 },
  { week: "2025-W07", label: "S7", volume: 1720, maxWeight: 90 },
];

interface WeekPoint {
  week: string;
  label: string;
  volume: number;
  maxWeight: number;
}

function buildExerciseData(
  history: CompletedSession[],
  exerciseName: string,
): WeekPoint[] {
  const byWeek: Record<string, { volume: number; maxWeight: number }> = {};

  for (const session of history) {
    const week = getISOWeek(new Date(session.date));
    for (const ex of session.exercises) {
      if (ex.name !== exerciseName || ex.skipped) continue;
      if (!byWeek[week]) byWeek[week] = { volume: 0, maxWeight: 0 };
      for (const s of ex.sets) {
        if (s.reps === "fallo" || !s.weight_kg) continue;
        byWeek[week].volume += s.reps * s.weight_kg;
        if (s.weight_kg > byWeek[week].maxWeight)
          byWeek[week].maxWeight = s.weight_kg;
      }
    }
  }

  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, { volume, maxWeight }]) => ({
      week,
      label: weekLabel(week),
      volume: Math.round(volume),
      maxWeight,
    }));
}

// --- Custom tooltip ---

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as WeekPoint;
  return (
    <div className="bg-dark border border-[#38383A] rounded-xl px-3 py-2 text-sm">
      <p className="text-[#8E8E93] text-[11px] mb-1.5">{label}</p>
      <p className="text-brand font-bold text-[13px]">{d.maxWeight} kg máx</p>
      <p className="text-[#8E8E93] text-[11px] mt-0.5">Vol. {d.volume.toLocaleString()} kg·rep</p>
    </div>
  );
}

// --- Exercise chart card ---

function ExerciseChart({ ex, history }: { ex: DayExercise; history: CompletedSession[] }) {
  const realData = useMemo(() => buildExerciseData(history, ex.name), [history, ex.name]);
  const isMock = realData.length === 0;
  const data = isMock ? MOCK_DATA : realData;
  const latest = isMock ? null : data[data.length - 1];
  const prev = isMock ? null : data[data.length - 2];
  const weightDelta = latest && prev ? latest.maxWeight - prev.maxWeight : null;
  const volumeDelta = latest && prev ? latest.volume - prev.volume : null;

  return (
    <div className="bg-[#141414] border border-[#2C2C2E] rounded-2xl px-4 pt-4 pb-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className="font-black text-white text-[15px] leading-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {ex.name_es ?? ex.name}
          </p>
          {ex.name_es && (
            <p className="text-[11px] text-[#8E8E93] mt-0.5">{ex.name}</p>
          )}
        </div>
        {isMock ? (
          <span className="text-[11px] font-semibold text-[#8E8E93] border border-[#38383A] rounded-full px-2 py-0.5 shrink-0 ml-2">
            Ejemplo
          </span>
        ) : latest ? (
          <div className="text-right shrink-0 ml-4">
            <p
              className="text-brand font-black text-[16px]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {latest.maxWeight} kg
            </p>
            {weightDelta !== null && (
              <p
                className={`text-[11px] font-semibold ${weightDelta >= 0 ? "text-brand" : "text-[#ff625a]"}`}
              >
                {weightDelta >= 0 ? "+" : ""}
                {weightDelta} kg vs sem. ant.
              </p>
            )}
            {volumeDelta !== null && (
              <p className="text-[10px] text-[#8E8E93] mt-0.5">
                Vol. {volumeDelta >= 0 ? "+" : ""}{volumeDelta.toLocaleString()} kg·rep
              </p>
            )}
          </div>
        ) : null}
      </div>

      {!isMock && data.length < 2 ? (
        <p className="text-[#8E8E93] text-[13px] py-4 text-center">
          Necesitás al menos 2 semanas para ver progresión
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#8E8E93", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#8E8E93", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(v) => `${v}kg`}
              domain={[
                (min: number) => Math.floor(min - Math.max(min * 0.05, 5)),
                (max: number) => Math.ceil(max + Math.max(max * 0.05, 5)),
              ]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="maxWeight"
              stroke="#9BFF30"
              strokeWidth={2.5}
              dot={<Dot r={4} fill="#9BFF30" stroke="#141414" strokeWidth={1.5} />}
              activeDot={{ r: 6, fill: "#9BFF30", stroke: "#141414", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// --- Day tabs ---

const DAY_LABELS: Record<WeekDay, string> = {
  L: "LUN", M: "MAR", X: "MIÉ", J: "JUE", V: "VIE", S: "SÁB", D: "DOM",
};
const DAY_ORDER: WeekDay[] = ["L", "M", "X", "J", "V", "S", "D"];

// --- Page ---

export const Progress = () => {
  const { data: history = [], isLoading: historyLoading } = useSessionHistoryQuery();
  const { data: routine, isLoading: routineLoading } = useRoutineQuery();

  const trainingDays = useMemo(() => {
    if (!routine?.schedule) return [];
    return DAY_ORDER.filter(
      (d) => routine.schedule![d]?.type === "training",
    );
  }, [routine]);

  const [selectedDay, setSelectedDay] = useState<WeekDay | null>(null);

  const activeDay = selectedDay ?? trainingDays[0] ?? null;

  const daySchedule =
    activeDay && routine?.schedule?.[activeDay]?.type === "training"
      ? (routine.schedule[activeDay] as Extract<typeof routine.schedule[WeekDay], { type: "training" }>)
      : null;

  const isLoading = historyLoading || routineLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
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

  if (trainingDays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 px-8 gap-3">
        <p className="text-[#8E8E93] text-[15px] text-center">
          Configurá tu rutina para ver el progreso por día
        </p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}>
      {/* Day tabs */}
      <div className="flex gap-2 px-5 pt-4 pb-3 overflow-x-auto no-scrollbar">
        {trainingDays.map((day) => {
          const s = routine?.schedule?.[day];
          const name = s?.type === "training" ? s.workoutName : "";
          const isActive = day === activeDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 flex flex-col items-start px-4 py-2.5 rounded-2xl border transition-colors ${
                isActive
                  ? "bg-brand border-brand"
                  : "bg-[#141414] border-[#2C2C2E]"
              }`}
            >
              <span
                className={`text-[11px] font-bold uppercase tracking-wide ${isActive ? "text-black" : "text-[#8E8E93]"}`}
              >
                {DAY_LABELS[day]}
              </span>
              <span
                className={`text-[13px] font-black leading-tight mt-0.5 ${isActive ? "text-black" : "text-white"}`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Exercise charts */}
      <div className="flex flex-col gap-4 px-5">
        {daySchedule?.exercises.map((ex) => (
          <ExerciseChart key={ex.name} ex={ex} history={history} />
        ))}
      </div>
    </div>
  );
};
