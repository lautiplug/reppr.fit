import { ChevronRight } from "lucide-react";
import type { WeekDay } from "@/types";
import { WeekStrip } from "./WeekStrip";

interface NextWorkout {
  dayLabel: string;   // e.g. "VIERNES"
  name: string;
  exerciseCount: number;
  durationMin: number;
}

interface Props {
  selectedDay: WeekDay;
  onSelectDay: (day: WeekDay) => void;
  trainingDays: Partial<Record<WeekDay, boolean>>;
  nextWorkout?: NextWorkout;
  onTrainAnyway: () => void;
}

export const RestDay = ({
  selectedDay,
  onSelectDay,
  trainingDays,
  nextWorkout,
  onTrainAnyway,
}: Props) => {
  return (
    <div className="pb-28">
      <div className="px-5">
        <WeekStrip
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
          trainingDays={trainingDays}
        />
      </div>

      <div className="px-5 flex flex-col gap-6">
        {/* Rest card */}
        <div className="border-2 border-dashed border-[#38383A] rounded-2xl p-8 flex flex-col items-center text-center gap-3">
          <span className="text-5xl">😴</span>
          <h2
            className="font-black text-2xl text-white"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Día de descanso
          </h2>
          <p className="text-sm text-[#8E8E93] leading-relaxed max-w-xs">
            El descanso es parte del entrenamiento. Tu cuerpo se recupera y crece hoy.
          </p>
          <button
            onClick={onTrainAnyway}
            className="mt-1 bg-[#3A3A3C] text-white font-semibold text-sm px-5 py-2.5 rounded-full"
          >
            Igual quiero entrenar algo
          </button>
        </div>

        {/* Next workout preview */}
        {nextWorkout && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold tracking-widest text-[#8E8E93] uppercase">
              Próximo entrenamiento
            </p>
            <button className="flex items-center justify-between bg-[#2C2C2E] border border-[#38383A] rounded-2xl p-4 w-full text-left">
              <div>
                <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">
                  {nextWorkout.dayLabel}
                </p>
                <p
                  className="font-black text-xl text-white mt-0.5"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {nextWorkout.name}
                </p>
                <p className="text-sm text-[#8E8E93] mt-1">
                  {nextWorkout.exerciseCount} ejercicios · ~{nextWorkout.durationMin} min
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#3A3A3C] flex items-center justify-center shrink-0">
                <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
