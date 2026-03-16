import { Bell } from "lucide-react"
import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"

export const Navbar = () => {
  const user = useAuthStore(s => s.user)
  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? 'there'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const [imgError, setImgError] = useState(false)

  return (
    <header className="flex justify-between items-center px-5 pt-4 pb-4">
      <div className="flex items-center gap-3">
        {avatarUrl && !imgError ? (
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={avatarUrl}
            alt={name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#2C2C2E] flex items-center justify-center">
            <span className="text-white text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              {name[0].toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Hola, {name}
          </h1>
        </div>
      </div>
      <div className="relative flex items-center gap-6">
        <Bell strokeWidth={1.5} className="text-white" size={27} />
      </div>
    </header>
  )
}
