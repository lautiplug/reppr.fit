import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../shared/EmptyState";
import { useMemo } from "react";

export interface Routine {
  day: string;
  name: string;
  exercises: number;
  active: boolean;
}

export const RoutinesPreview = ({
  routines,
}: {
  routines?: Routine[] | null;
}) => {
  const orderedRoutines = useMemo(() => {
    if (!routines) return null;
    const index = routines.findIndex((r) => r.active);
    if (index === -1) return routines;
    return [...routines.slice(index), ...routines.slice(0, index)];
  }, [routines]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-bold text-white">Tus rutinas</h2>
        {routines && routines.length > 0 && (
          <Link
            to="/"
            className="flex items-center gap-1 text-[13px] p-2 px-4 rounded-full text-[#9BFF30] font-medium"
          >
            Ver todas <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {orderedRoutines && orderedRoutines.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
          {orderedRoutines.map((r) => (
            <div
              key={r.day}
              className="min-w-35 bg-[#181818] rounded-2xl p-4 shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <div className="flex justify-between items-center mb-3">
                <div
                  className="w-7 h-1.5 rounded-full"
                  style={{ background: r.active ? "#9BFF30" : "#E8E8E3" }}
                />
                <p className={r.active ? "text-[#9BFF30] text-xs font-bold" : "text-[#6B6B6B] text-xs"}>{r.active ? "Hoy" : ''}</p>
              </div>
              <p className="text-[11px] text-[#9d9d9d] font-medium uppercase tracking-wider">
                {r.day}
              </p>
              <p className="text-[15px] font-bold text-white mt-1 mb-2 leading-snug">
                {r.name}
              </p>
              <p className="text-xs text-[#6B6B6B]">{r.exercises} ejercicios</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#181818] rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <EmptyState
            icon="📋"
            title="Sin rutinas todavía"
            description="Creá tu primer plan de entrenamiento."
            action={
              <Link
                to="/routines"
                className="inline-flex items-center gap-2 bg-[#9BFF30] text-black text-sm font-bold px-5 py-3 rounded-full"
              >
                Crear rutina
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
};
