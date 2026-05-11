import { useMemo, useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import AppBar from './components/AppBar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import MemberPage from './pages/MemberPage'
import NoticePage from './pages/NoticePage'
import Login from './pages/Login'
import EventPage from './pages/EventPage'
import { clearAuth, readStoredAuth, storeAuth } from './lib/api'

const PAGE_TITLES = {
  home: '인친소',
  members: '회원 관리',
  profile: '내 정보',
  settings: '설정',
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('home')
  const [eventId, setEventId] = useState(null)
  const [noticeId, setNoticeId] = useState(null)
  const [onboardingName, setOnboardingName] = useState('')
  const { isAdmin, events, loading, error, needsOnboarding, completeOnboarding, currentUser } = useApp()

  if (loading) {
    return <main><p style={{ padding: 24 }}>불러오는 중...</p></main>
  }

  if (needsOnboarding && !currentUser) {
    return (
      <main className="login">
        <div className="login__hero">
          <div className="login__shuttle">🏸</div>
          <h1 className="login__title">인친소</h1>
          <p className="login__subtitle">처음 오셨군요</p>
        </div>
        <form
          className="login__sheet"
          onSubmit={(event) => {
            event.preventDefault()
            if (onboardingName.trim()) completeOnboarding(onboardingName.trim())
          }}
        >
          <p className="login__welcome">사용할 이름을 알려주세요</p>
          <div className="login__field">
            <label className="login__field-label">이름</label>
            <input
              className="login__input"
              value={onboardingName}
              onChange={event => setOnboardingName(event.target.value)}
              autoFocus
            />
          </div>
          <button className="login__submit-btn" disabled={!onboardingName.trim()}>
            완료
          </button>
        </form>
      </main>
    )
  }

  if (error && !currentUser) {
    return <main><p style={{ padding: 24 }}>{error}</p></main>
  }

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

  if (noticeId) {
    return (
      <>
        <AppBar title="공지 상세" isAdmin={isAdmin} onBack={() => setNoticeId(null)} />
        <main>
          <NoticePage noticeId={noticeId} onBack={() => setNoticeId(null)} />
        </main>
      </>
    )
  }

  return (
    <>
      <AppBar title={PAGE_TITLES[activeTab]} isAdmin={isAdmin} />
      <main>
        {activeTab === 'home'     && <Home onEventSelect={setEventId} onNoticeSelect={setNoticeId} />}
        {activeTab === 'members'  && <MemberPage />}
        {activeTab === 'profile'  && <Profile />}
        {activeTab === 'settings' && <Settings />}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />
    </>
  )
}

export default function App() {
  const initialAuth = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const refresh = params.get('refresh')
    if (token && refresh) {
      const next = { accessToken: token, refreshToken: refresh }
      storeAuth(next)
      window.history.replaceState({}, '', window.location.pathname === '/onboarding' ? '/onboarding' : '/')
      return next
    }
    return readStoredAuth()
  }, [])

  const [auth, setAuth] = useState(initialAuth)

  const isOnboarding = window.location.pathname === '/onboarding'

  const handleAuthChange = (nextAuth) => {
    if (nextAuth) storeAuth(nextAuth)
    else clearAuth()
    setAuth(nextAuth)
    window.history.replaceState({}, '', '/')
  }

  if (!auth) return <Login />

  return (
    <AppProvider auth={auth} needsOnboarding={isOnboarding} onAuthChange={handleAuthChange}>
      <AppContent />
    </AppProvider>
  )
}
