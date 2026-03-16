import type { WeekDay } from "@/types";
import { getTodayKey } from "./utils";

const DAYS: { key: WeekDay; label: string }[] = [
  { key: "lun", label: "LUN" },
  { key: "mar", label: "MAR" },
  { key: "mie", label: "MIÉ" },
  { key: "jue", label: "JUE" },
  { key: "vie", label: "VIE" },
  { key: "sab", label: "SÁB" },
  { key: "dom", label: "DOM" },
];

// Returns the date number for each day of the current week (Mon–Sun)
function getCurrentWeekDates(): Record<WeekDay, number> {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return DAYS.reduce(
    (acc, { key }, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      acc[key] = d.getDate();
      return acc;
    },
    {} as Record<WeekDay, number>,
  );
}


interface Props {
  selectedDay: WeekDay;
  onSelectDay: (day: WeekDay) => void;
  /** Optional dot indicator per day (e.g. training days) */
  trainingDays?: Partial<Record<WeekDay, boolean>>;
}

export const WeekStrip = ({ selectedDay, onSelectDay, trainingDays }: Props) => {
  const dates = getCurrentWeekDates();
  const todayKey = getTodayKey();

  return (
    <div className="flex justify-between px-1 py-3">
      {DAYS.map(({ key, label }) => {
        const isSelected = key === selectedDay;
        const isToday = key === todayKey;
        const hasTraining = trainingDays?.[key];

        return (
          <button
            key={key}
            onClick={() => onSelectDay(key)}
            className="flex flex-col items-center gap-1 w-10"
          >
            <span className="text-[11px] font-semibold text-white tracking-wide">
              {label}
            </span>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isSelected ? "bg-[#9bff30] text-black" : "text-white"
              }`}
            >
              <span className="font-black text-[18px]" style={{ fontFamily: "Syne, sans-serif" }}>
                {dates[key]}
              </span>
            </div>
            {/* Dot: orange for today, gray for other training days */}
            <div className={`w-1.5 h-1.5 rounded-full ${
              hasTraining
                ? isToday
                  ? "bg-[#9bff30]"
                  : "bg-[#7c7c7c]"
                : "invisible"
            }`} />
          </button>
        );
      })}
    </div>
  );
};
