import { Link, useLocation } from "react-router-dom";
import {
  ChartNoAxesColumn,
  Dumbbell,
  House,
  UserIcon,
  Bot,
} from "lucide-react";
import { useRoutineQuery } from "@/lib/queries";

export const NavigationBar = () => {
  const { pathname } = useLocation();
  const { data } = useRoutineQuery();
  const hasRoutine = !!data?.schedule;

  const navigationItems = [
    { name: "Home", icon: House, linkTo: "/" },
    {
      name: "Entrenar",
      icon: Dumbbell,
      linkTo: hasRoutine ? "/exercises" : "/routines",
    },
    { name: "Progreso", icon: ChartNoAxesColumn, linkTo: "/progress" },
    { name: "Perfil", icon: UserIcon, linkTo: "/profile" },
    { name: "Coach", icon: Bot, linkTo: "/chat" },
  ];

  return (
    <nav
      className="fixed bottom-2 h-20 left-2 right-2 flex z-30 bg-black/20 rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[17px]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {navigationItems.map(({ name, icon: Icon, linkTo }) => {
        const active =
          pathname === linkTo ||
          (name === "Entrenar" &&
            (pathname.startsWith("/exercises") ||
              pathname.startsWith("/routines")));
        return (
          <Link
            key={name}
            to={linkTo}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-200"
          >
            <Icon
              size={28}
              strokeWidth={1.5}
              className={`transition-colors duration-200 ${active ? "text-white" : "text-[#babac1]"}`}
            />
            <span
              className={`text-[12px] font-medium transition-colors duration-200 ${active ? "text-[#9BFF30]" : "text-[#babac1]"}`}
            >
              {name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
