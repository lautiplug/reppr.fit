import { Link, useLocation } from "react-router-dom";
import { ChartNoAxesColumn, Dumbbell, House, UserIcon, Bot } from "lucide-react";
import { useRoutineStore } from "@/store/useRoutineStore";

export const NavigationBar = () => {
  const { pathname } = useLocation();
  const { hasRoutine } = useRoutineStore();

  const navigationItems = [
    { name: "Home",     icon: House,            linkTo: "/"                              },
    { name: "Entrenar", icon: Dumbbell,          linkTo: hasRoutine ? "/exercises" : "/routines" },
    { name: "Progreso", icon: ChartNoAxesColumn, linkTo: "/session"                     },
    { name: "Perfil",   icon: UserIcon,          linkTo: "/profile"                     },
    { name: "Coach",    icon: Bot,               linkTo: "/chat"                        },
  ];

  return (
    <nav
      className="fixed bottom-0 h-20 left-0 right-0 flex z-30 bg-black"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {navigationItems.map(({ name, icon: Icon, linkTo }) => {
        const active =
          pathname === linkTo ||
          (name === "Entrenar" && (pathname.startsWith("/exercises") || pathname.startsWith("/routines")));
        return (
          <Link
            key={name}
            to={linkTo}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-200"
          >
            <Icon
              size={28}
              strokeWidth={1.5}
              className={`transition-colors duration-200 ${active ? "text-white" : "text-[#8E8E93]"}`}
            />
            <span className={`text-[12px] font-medium transition-colors duration-200 ${active ? "text-[#9BFF30]" : "text-[#8E8E93]"}`}>
              {name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
