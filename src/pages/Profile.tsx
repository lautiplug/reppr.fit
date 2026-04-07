import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useSessionHistoryQuery } from "@/lib/queries";
import { useMemo } from "react";
import { LogOut, Flame, Dumbbell, Weight } from "lucide-react";
import type { CompletedSession } from "@/types";

function calcStreak(history: CompletedSession[]): number {
  if (history.length === 0) return 0;
  const sessionDays = new Set(history.map(s => s.date.slice(0, 10)));
  let count = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (!sessionDays.has(key)) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

function calcTotalVolume(history: CompletedSession[]): number {
  return history.flatMap(s => s.exercises.flatMap(e => e.sets)).reduce((acc, s) => {
    if (s.reps === "fallo" || !s.weight_kg) return acc;
    return acc + s.reps * s.weight_kg;
  }, 0);
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex-1 bg-white/5 border border-white/8 rounded-2xl p-4 flex flex-col items-center gap-1.5">
      <div className="text-brand">{icon}</div>
      <p className="text-white font-black text-xl" style={{ fontFamily: "Syne, sans-serif" }}>{value}</p>
      <p className="text-white/40 text-[11px] uppercase tracking-wide text-center">{label}</p>
    </div>
  );
}

export const Profile = () => {
  const signOut = useAuthStore(s => s.signOut);
  const user = useAuthStore(s => s.user);
  const profile = useProfileStore(s => s.profile);
  const { data: history = [] } = useSessionHistoryQuery();

  const streak = useMemo(() => calcStreak(history), [history]);
  const totalVolume = useMemo(() => calcTotalVolume(history), [history]);
  const volumeLabel = totalVolume >= 1000
    ? `${(totalVolume / 1000).toFixed(0)}t`
    : `${Math.round(totalVolume)} kg`;

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";

  const SEX_LABEL = { male: "Hombre", female: "Mujer", other: "Otro" };

  return (
    <div className="min-h-screen bg-black px-5 pt-6 pb-32 flex flex-col gap-5">

      {/* Avatar + email */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0">
          <span className="text-brand font-black text-xl" style={{ fontFamily: "Syne, sans-serif" }}>
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-white font-black text-lg truncate" style={{ fontFamily: "Syne, sans-serif" }}>
            {user?.email?.split("@")[0]}
          </p>
          <p className="text-white/40 text-[12px] truncate">{user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2.5">
        <StatPill icon={<Flame size={16} />} label="Racha" value={streak > 0 ? `${streak}d` : "—"} />
        <StatPill icon={<Dumbbell size={16} />} label="Sesiones" value={String(history.length)} />
        {totalVolume > 0 && (
          <StatPill icon={<Weight size={16} />} label="Volumen total" value={volumeLabel} />
        )}
      </div>

      {/* Profile info */}
      {profile && (
        <div className="bg-white/5 border border-white/8 rounded-2xl divide-y divide-white/6">
          {[
            { label: "Sexo", value: SEX_LABEL[profile.sex] },
            { label: "Año de nacimiento", value: String(profile.birth_year) },
            { label: "Peso", value: `${profile.weight_kg} kg` },
            { label: "Altura", value: `${profile.height_cm} cm` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3.5">
              <span className="text-white/40 text-[13px]">{label}</span>
              <span className="text-white text-[13px] font-semibold">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-[14px] font-semibold w-full cursor-pointer hover:bg-red-500/10 transition-colors"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </div>
  );
};
