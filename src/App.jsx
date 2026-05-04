import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import AppBar from './components/AppBar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Login from './pages/Login'
import EventPage from './pages/EventPage'

const PAGE_TITLES = {
  home: '인친소',
  profile: '내 정보',
  settings: '설정',
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('home')
  const [eventId, setEventId] = useState(null)
  const { isAdmin, events } = useApp()

  if (eventId) {
    const event = events.find(e => e.id === eventId)
    const title = event ? `${event.displayDate} (${event.day})` : '모임 상세'
    return (
      <>
        <AppBar title={title} isAdmin={isAdmin} onBack={() => setEventId(null)} />
        <main>
          <EventPage eventId={eventId} />
        </main>
      </>
    )
  }

  return (
    <>
      <AppBar title={PAGE_TITLES[activeTab]} isAdmin={isAdmin} />
      <main>
        {activeTab === 'home' && <Home onEventSelect={setEventId} />}
        {activeTab === 'profile' && <Profile />}
        {activeTab === 'settings' && <Settings />}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  )
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)

  if (!currentUser) return <Login onLogin={setCurrentUser} />

  return (
    <AppProvider user={currentUser} onSignOut={() => setCurrentUser(null)}>
      <AppContent />
    </AppProvider>
  )
}
