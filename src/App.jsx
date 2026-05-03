import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import AppBar from './components/AppBar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

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
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
