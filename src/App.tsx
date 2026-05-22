import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useRoutineStore } from "@/store/useRoutineStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Auth } from "@/pages/Auth";
import { Home } from "@/pages/Home";
import { Routines } from "@/pages/Routines";
import { Excercises } from "@/pages/Excercises";
import { DayEditor } from "@/pages/DayEditor";
import { Profile } from "@/pages/Profile";
import { ProfileSetup } from "@/pages/ProfileSetup";
import SessionSummary from "@/pages/SessionSummary";
import { Progress } from "@/pages/Progress";
import { History } from "@/pages/History";
import { NavigationBar } from "@/components/ui/NavigationBar";
import { TopBar } from "@/components/ui/TopBar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const AnimatedOutlet = () => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="animate-[fadeIn_0.18s_ease-out]">
      <Outlet />
    </div>
  );
};

const PageError = () => (
  <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
    <p className="text-3xl">⚠️</p>
    <p className="text-white font-black text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
      Esta página falló
    </p>
    <p className="text-[#8E8E93] text-sm leading-relaxed">
      Podés volver al inicio o recargar la app.
    </p>
    <button
      onClick={() => window.location.assign("/")}
      className="mt-1 px-5 py-2.5 bg-brand text-black font-bold rounded-2xl text-sm"
    >
      Ir al inicio
    </button>
  </div>
);

const AppLayout = () => (
  <>
    <TopBar />
    <ErrorBoundary fallback={<PageError />}>
      <AnimatedOutlet />
    </ErrorBoundary>
    <NavigationBar />
  </>
);

const SplashScreen = () => (
  <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4">
    <p className="text-white font-black text-3xl animate-[fadeIn_0.4s_ease-out] font-display">
      reppr.fit
    </p>
    <div className="flex gap-1.5 animate-[fadeIn_0.4s_ease-out_0.2s_both]">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#9BFF30]"
          style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  </div>
);

const RequireAuth = () => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const hasProfile = useProfileStore((s) => s.hasProfile);
  const loadingProfile = useProfileStore((s) => s.loadingProfile);

  if (loading || loadingProfile) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasProfile) {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
};

const RequireSetup = () => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const hasProfile = useProfileStore((s) => s.hasProfile);
  const loadingProfile = useProfileStore((s) => s.loadingProfile);

  if (loading || loadingProfile) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (hasProfile) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const App = () => {
  const init = useAuthStore((s) => s.init);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  useEffect(() => {
    init();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (
        (_event === "SIGNED_IN" || _event === "INITIAL_SESSION") &&
        session?.user
      ) {
        useProfileStore.getState().loadFromSupabase(session.user.id);
      } else if (_event === "INITIAL_SESSION" && !session?.user) {
        useProfileStore.setState({ loadingProfile: false });
      }

      if (_event === "SIGNED_OUT") {
        useSessionStore.setState({ active: null });
        useRoutineStore.getState().clearDraftAnswers();
        useProfileStore.getState().clearProfile();
        queryClient.clear();
      }
    });
    return () => subscription.unsubscribe();
  }, [init, setUser, queryClient]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<RequireSetup />}>
          <Route path="/setup" element={<ProfileSetup />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/session/summary" element={<SessionSummary />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/routines/edit/:day" element={<DayEditor />} />
            <Route path="/exercises" element={<Excercises />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
