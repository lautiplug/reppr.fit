import type { WeekDay } from "@/types";
import { getTodayKey } from "./utils";

const DAYS: { key: WeekDay; label: string }[] = [
  { key: "L", label: "L" },
  { key: "M", label: "M" },
  { key: "X", label: "M" },
  { key: "J", label: "J" },
  { key: "V", label: "V" },
  { key: "S", label: "S" },
  { key: "D", label: "D" },
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
  /** Days of the current week where the user already completed a session */
  completedDays?: Partial<Record<WeekDay, boolean>>;
}

export const WeekStrip = ({
  selectedDay,
  onSelectDay,
  trainingDays,
  completedDays,
}: Props) => {
  const dates = getCurrentWeekDates();
  const todayKey = getTodayKey();

  return (
    <div className="flex justify-between px-3 py-2 bg-black rounded-full">
      {DAYS.map(({ key, label }) => {
        const isSelected = key === selectedDay;
        const isToday = key === todayKey;
        const hasTraining = trainingDays?.[key];
        const trainedToday = completedDays?.[key];
        const showDot = hasTraining && (isToday ? completedDays !== undefined : true);

        return (
          <button
            key={key}
            onClick={() => onSelectDay(key)}
            className="flex flex-col items-center gap-1 w-12"
          >
            <span
              className={`text-[11px] font-semiboldtracking-wide ${
                isSelected ? "bg-white text-dark" : "text-white"
              } px-2 py-0.5 rounded-full`}
            >
              {label}
            </span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors text-white`}
            >
              <span
                className="font-black text-[14px]"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {dates[key]}
              </span>
            </div>
            {showDot && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    isToday && trainedToday
                      ? "#9BFF30"
                      : isToday
                      ? "#fb923c"
                      : "#7c7c7c",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
