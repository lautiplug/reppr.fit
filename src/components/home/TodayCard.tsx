import { Check, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

function GifSlot({ url, last }: { url: string | null; last: boolean }) {
  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{ borderRight: !last ? "1px solid #111" : undefined }}
    >
      <Skeleton className="absolute inset-0 rounded-none" />
      {url && (
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#0b0b0b]" />
    </div>
  );
}

export interface TodayWorkout {
  name: string;
  description: string;
  progress: number;
  completed?: boolean;
  exercisesDone?: number;
  exercisesTotal?: number;
}

interface TodayCardProps {
  workout?: TodayWorkout | null;
  isRestDay?: boolean;
  streak?: number | null;
  dayLabel?: string;
  previewGifs?: string[];
  gifCount?: number;
}

export const TodayCard = ({
  workout,
  isRestDay = false,
  dayLabel = "Hoy",
  previewGifs = [],
  gifCount = 0,
}: TodayCardProps) => {
  const slots = gifCount > 0 ? gifCount : previewGifs.length;
  const showHero = workout && slots > 0;
  const isLoadingGifs = gifCount > 0 && previewGifs.length === 0;

  return (
    <div className="bg-[#0b0b0b] rounded-4xl relative overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      {workout ? (
        <>
          {/* Hero — espacio siempre reservado, skeleton bajo la imagen */}
          {showHero && (
            <div className="flex h-36 overflow-hidden">
              {Array.from({ length: slots }).map((_, i) => (
                <GifSlot
                  key={i}
                  url={previewGifs[i] ?? null}
                  last={i === slots - 1}
                />
              ))}
            </div>
          )}

          <section className="flex flex-col items-start p-6">
            <div
              className={`w-full transition-opacity duration-500 mb-2 ${isLoadingGifs ? "opacity-0" : "opacity-100"}`}
            >
              <p className="text-xs text-white font-medium mb-1">
                {dayLabel} · Entrenamiento
              </p>
              <h2 className="text-[22px] font-semibold text-white leading-tight">
                {workout.name} - {workout.description}
              </h2>
              {workout.exercisesTotal != null && (
                <p className="text-xs text-[#6B6B6B] mt-1">
                  {workout.exercisesDone ?? 0} de {workout.exercisesTotal}{" "}
                  ejercicios realizados
                </p>
              )}
            </div>


            {workout.completed ? (
              <div className="w-full flex justify-center items-center gap-2 bg-[#9BFF30] text-black text-md font-medium px-5 py-3 rounded-full">
                <Check />
                Entrenamiento completado
              </div>
            ) : (
              <Link
                to="/exercises"
                className="w-full flex justify-center items-center gap-2 bg-[#9BFF30] text-black text-md font-medium px-5 py-3 rounded-full"
              >
                <Play size={15} fill="black" strokeWidth={0} />
                {workout.progress > 0 ? "Continuar sesión" : "Empezar sesión"}
              </Link>
            )}
          </section>
        </>
      ) : (
        <div className="p-6">
          <p className="text-xs text-[#6B6B6B] font-medium mb-4">
            Hoy · {dayLabel}
          </p>
          {isRestDay ? (
            <EmptyState
              icon="😴"
              title="Día de descanso"
              description="Hoy toca recuperar. El descanso también es parte del entrenamiento."
            />
          ) : (
            <EmptyState
              icon="🏋️"
              title="Sin rutina para hoy"
              description="Todavía no configuraste un plan de entrenamiento."
              action={
                <Link
                  to="/routines"
                  className="inline-flex items-center gap-2 bg-[#9BFF30] text-black text-sm font-bold px-5 py-3 rounded-full"
                >
                  Crear rutina
                </Link>
              }
            />
          )}
        </div>
      )}
    </div>
  );
};
