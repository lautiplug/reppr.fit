import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionSummary {
  workoutName: string;
  durationMin: number;
  completedSets: number;
  totalSets: number;
  totalKg: number;
}

interface SummaryModalProps {
  summary: SessionSummary;
  onClose: () => void;
}

interface AbandonModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function SummaryModal({ summary, onClose }: SummaryModalProps) {
  return (
    <div className="fixed inset-0 bg-dark/40 flex items-end z-50">
      <div className="bg-[#2C2C2E] w-full rounded-t-3xl p-6 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[#9BFF30] flex items-center justify-center">
            <Check className="w-7 h-7 text-black" strokeWidth={3} />
          </div>
          <p
            className="font-black text-xl text-white text-center"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            ¡Entreno completado!
          </p>
          <p className="text-sm text-[#8E8E93] text-center">
            {summary.workoutName}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark rounded-2xl p-3 flex flex-col items-center gap-1">
            <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide">
              Duración
            </p>
            <p
              className="font-black text-2xl text-white"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {summary.durationMin}
              <span className="text-sm font-semibold text-[#8E8E93]">min</span>
            </p>
          </div>
          <div className="bg-dark rounded-2xl p-3 flex flex-col items-center gap-1">
            <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide">
              Series
            </p>
            <p
              className="font-black text-2xl text-white"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {summary.completedSets}
              <span className="text-sm font-semibold text-[#8E8E93]">
                /{summary.totalSets}
              </span>
            </p>
          </div>
          <div className="bg-dark rounded-2xl p-3 flex flex-col items-center gap-1">
            <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wide">
              Volumen
            </p>
            <p
              className="font-black text-2xl text-white"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {summary.totalKg > 0 ? `${Math.round(summary.totalKg)}` : "—"}
              <span className="text-sm font-semibold text-[#8E8E93]">
                {summary.totalKg > 0 ? "kg" : ""}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-[#9BFF30] text-black font-black text-base rounded-2xl"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Listo
        </button>
      </div>
    </div>
  );
}

export function AbandonModal({ onConfirm, onCancel }: AbandonModalProps) {
  return (
    <div className="fixed inset-0 bg-dark/40 flex items-end z-50">
      <div className="bg-[#2C2C2E] w-full rounded-t-3xl p-6 flex flex-col gap-4">
        <p
          className="font-black text-lg text-white text-center"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          ¿Abandonar el entreno?
        </p>
        <p className="text-sm text-[#8E8E93] text-center">
          Se perderá el progreso de esta sesión.
        </p>
        <button
          onClick={onCancel}
          className="w-full py-3.5 bg-[#9BFF30] rounded-full font-semibold"
        >
          Seguir entrenando
        </button>
        <Button
          onClick={onConfirm}
          className="w-full py-3.5 bg-0 text-white font-bold rounded-2xl"
        >
          Sí, abandonar
        </Button>
      </div>
    </div>
  );
}
