import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { AppProvider, useApp } from './context/AppContext'
import AppBar from './components/AppBar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Login from './pages/Login'

const PAGE_TITLES = {
  home: '인친소',
  profile: '내 정보',
  settings: '설정',
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('home')
  const { isAdmin } = useApp()

  return (
    <>
      <AppBar title={PAGE_TITLES[activeTab]} isAdmin={isAdmin} />
      <main>
        {activeTab === 'home' && <Home />}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'settings' && <Settings />}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 초기 세션 확인 중
  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)' }}>
        <span style={{ fontSize: '48px' }}>🏸</span>
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <AppProvider user={session.user}>
      <AppContent />
    </AppProvider>
  )
}
