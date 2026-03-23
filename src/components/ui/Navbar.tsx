import { Bell } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export const Navbar = () => {
  const user = useAuthStore((s) => s.user);
  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const [imgError, setImgError] = useState(false);

  return (
    <header className="flex justify-between items-center gap-2 px-3 pt-3 pb-4">
      <div className="flex items-center gap-3 bg-[#000000] p-2 rounded-full w-full">
        {avatarUrl && !imgError ? (
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={avatarUrl}
            alt={name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center">
            <span className="text-white text-lg font-bold font-display">
              {name[0].toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-md font-medium text-white font-body">{name}</h1>
          <p className="text-white text-xs">24 años</p>
        </div>
      </div>
      <div className="relative flex items-center gap-6 p-3.5 bg-[#000000] rounded-full">
        <Bell strokeWidth={1.5} className="text-white" size={27} />
      </div>
    </header>
  );
};
