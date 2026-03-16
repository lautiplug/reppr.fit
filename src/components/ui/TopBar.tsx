import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import { useRoutineStore } from "@/store/useRoutineStore";
import { useSessionStore } from "@/store/useSessionStore";
import { getTodayKey } from "@/components/excercises/utils";

interface TopBarConfig {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

const useTopBarConfig = (): TopBarConfig | null => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { schedule, selectedDay: storedDay } = useRoutineStore();

  if (pathname.startsWith("/exercises")) {
    const day = storedDay ?? getTodayKey();
    const daySchedule = schedule?.[day];
    const title = daySchedule?.type === "training" ? daySchedule.workoutName : "sesiones";

    return {
      title,
      icon: <Link className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center" to="/home"><ArrowLeft className="w-5 h-5 text-white" strokeWidth={2} /></Link>,
      action: (
        <button
          onClick={() => navigate("/routines")}
          className="w-9 h-9 rounded-xl bg-[#2C2C2E] flex items-center justify-center"
          aria-label="Editar rutina"
        >
          <PenLine className="w-4 h-4 text-white" strokeWidth={2} />
        </button>
      ),
    };
  }

  return null;
};

export const TopBar = () => {
  const config = useTopBarConfig();
  const active = useSessionStore(s => s.active);

  if (!config) return null;
  if (active) return null;

  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-4">
      <div className="flex items-center gap-2">
        {config.icon}
        <h1
          className="text-2xl font-black text-white ml-2"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          {config.title}
        </h1>
      </div>
      {config.action && <div>{config.action}</div>}
    </header>
  );
};
