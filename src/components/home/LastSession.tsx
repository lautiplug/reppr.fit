import { ArrowRight, ChevronDown, ChevronUp, Rainbow } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/shared/EmptyState";

export interface SessionExercise {
  name: string;
  muscle: string;
  sets: number;
  weight: string;
  pr?: boolean;
}

interface LastSessionProps {
  exercises?: SessionExercise[] | null;
}

const PREVIEW_COUNT = 3;

export const LastSession = ({ exercises }: LastSessionProps) => {
  const [expanded, setExpanded] = useState(false);
  const visible = exercises
    ? expanded
      ? exercises
      : exercises.slice(0, PREVIEW_COUNT)
    : [];
  const hasMore = exercises && exercises.length > PREVIEW_COUNT;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-bold text-white">Última sesión</h2>
        {exercises && exercises.length > 0 && (
          <Link
            to="/exercises"
            className="flex items-center gap-1 text-[13px] p-2 px-4 rounded-full text-[#6B7280] font-medium"
          >
            Ver más <ArrowRight size={14} />
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {exercises && exercises.length > 0 ? (
          <>
            {visible.map((ex) => (
              <div
                key={ex.name}
                className="bg-[#181818] rounded-2xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-white truncate">
                    {ex.name}
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-medium text-[#7c7c7c] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
                    {ex.sets} series
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {ex.pr && (
                    <span className="text-[11px] font-bold text-black bg-[#9BFF30] px-2 py-0.5 rounded-full">
                      PR
                    </span>
                  )}
                  <p
                    className="text-[17px] font-black text-[#F4F4F5]"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {ex.weight}
                  </p>
                </div>
              </div>
            ))}
            {hasMore && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium text-[#7c7c7c]"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={15} /> Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown size={15} /> Ver{" "}
                    {exercises.length - PREVIEW_COUNT} más
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="bg-[#101010] rounded-2xl">
            <EmptyState
              icon={<Rainbow />}
              title="Sin sesiones registradas"
              description="Completá tu primer entrenamiento para ver el historial acá."
            />
          </div>
        )}
      </div>
    </div>
  );
};
