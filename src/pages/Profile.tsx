import { useAuthStore } from "@/store/useAuthStore";

export const Profile = () => {
  const signOut = useAuthStore(s => s.signOut);

  return (
    <section className="min-h-screen bg-black px-5 py-6">
      <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
        <h1 className="text-xl font-bold text-white mb-2">Perfil</h1>
        <p className="text-sm text-white/65 mb-5">Administra tu cuenta y sesión.</p>
        <button
          onClick={() => signOut()}
          className="rounded-full border border-red-500/35 px-4 py-2 text-sm font-medium text-red-400"
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </div>
    </section>
  );
}
