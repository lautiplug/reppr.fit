import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useRoutineStore } from '@/store/useRoutineStore'
import { useSessionStore } from '@/store/useSessionStore'
import { useProfileStore } from '@/store/useProfileStore'
import { supabase } from '@/lib/supabase'
import { Auth } from '@/pages/Auth'
import { Home } from '@/pages/Home'
import { Routines } from '@/pages/Routines'
import { Excercises } from '@/pages/Excercises'
import { DayEditor } from '@/pages/DayEditor'
import { ActiveSessions } from '@/pages/ActiveSessions'
import { Profile } from '@/pages/Profile'
import { ProfileSetup } from '@/pages/ProfileSetup'
import SessionSummary from '@/pages/SessionSummary'
import { NavigationBar } from '@/components/ui/NavigationBar'
import { TopBar } from '@/components/ui/TopBar'

const AnimatedOutlet = () => {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="animate-[fadeIn_0.18s_ease-out]">
      <Outlet />
    </div>
  )
}

const AppLayout = () => (
  <>
    <TopBar />
    <AnimatedOutlet />
    <NavigationBar />
  </>
)

const SplashScreen = () => (
  <div className="min-h-screen bg-[#1C1C1E] flex flex-col items-center justify-center gap-4">
    <p className="text-white font-black text-3xl animate-[fadeIn_0.4s_ease-out] font-display">
      reppr.fit
    </p>
    <div className="flex gap-1.5 animate-[fadeIn_0.4s_ease-out_0.2s_both]">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#9BFF30]"
          style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  </div>
)

const RequireAuth = () => {
  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const hasProfile = useProfileStore(s => s.hasProfile)
  const loadingProfile = useProfileStore(s => s.loadingProfile)

  if (loading || loadingProfile) {
    return <SplashScreen />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!hasProfile) {
    return <Navigate to="/setup" replace />
  }

  return <Outlet />
}

const RequireSetup = () => {
  const user = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)
  const hasProfile = useProfileStore(s => s.hasProfile)
  const loadingProfile = useProfileStore(s => s.loadingProfile)

  if (loading || loadingProfile) {
    return <SplashScreen />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (hasProfile) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export const App = () => {
  const init = useAuthStore(s => s.init)
  const setUser = useAuthStore(s => s.setUser)

  useEffect(() => {
    init()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      if ((_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') && session?.user) {
        const userId = session.user.id
        // Wait for persist rehydration before loading from Supabase
        // so active session in localStorage is not overwritten
        useSessionStore.persist.onFinishHydration(() => {
          useSessionStore.getState().loadFromSupabase(userId)
        })
        useRoutineStore.getState().loadFromSupabase?.(userId)
        useProfileStore.getState().loadFromSupabase(userId)
      } else if (_event === 'INITIAL_SESSION' && !session?.user) {
        // No user — stop loading so RequireAuth can redirect to /auth
        useProfileStore.setState({ loadingProfile: false })
      }

      if (_event === 'SIGNED_OUT') {
        useRoutineStore.getState().clearRoutine()
        useSessionStore.setState({ history: [], active: null })
        useProfileStore.getState().clearProfile()
      }
    })
    return () => subscription.unsubscribe()
  }, [init, setUser])

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
            <Route path="/session" element={<ActiveSessions />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
