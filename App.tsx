import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Auth } from '@/pages/Auth'
import { Home } from '@/pages/Home'
import { Routines } from '@/pages/Routines'
import { Excercises } from '@/pages/Excercises'
import { ActiveSessions } from '@/pages/ActiveSessions'
import { Profile } from '@/pages/Profile'
import { NavigationBar } from '@/components/ui/NavigationBar'

const AppLayout = () => (
  <>
    <Outlet />
    <NavigationBar />
  </>
)

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/exercises" element={<Excercises />} />
          <Route path="/session" element={<ActiveSessions />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
