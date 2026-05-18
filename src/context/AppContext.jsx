import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api, clearAuth, readStoredAuth } from '../lib/api'

const CLUB_ID = import.meta.env.VITE_CLUB_ID ?? '1'
const KR_DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

const AppContext = createContext(null)

function displayDate(dateStr) {
  const [, month, day] = dateStr.split('-')
  return `${Number(month)}월 ${Number(day)}일`
}

function isConfirmedParticipationStatus(status) {
  const normalized = String(status ?? '').trim().toUpperCase()
  return !normalized || normalized === 'CONFIRMED'
}

function mapSession(session, participation = null, participants = null, courts = null, currentUser = null) {
  const date = session.sessionDate
  const confirmedCount = session.confirmedCount ?? participants?.length ?? 0
  const placeholders = Array.from({ length: confirmedCount }, (_, index) => ({
    id: `confirmed-${session.id}-${index}`,
    name: `참가자 ${index + 1}`,
    status: 'confirmed',
  }))

  const participantList = participants?.length ? participants : placeholders
  const hasMe = currentUser && participantList.some(participant => participant.id === currentUser.id)
  let nextParticipants = participantList
  if (
    participation?.applied &&
    currentUser &&
    !hasMe &&
    isConfirmedParticipationStatus(participation.status)
  ) {
    const me = {
      id: currentUser.id,
      name: currentUser.name || '나',
      status: 'confirmed',
    }
    nextParticipants = participants?.length
      ? [...participantList, me]
      : participantList.length > 0
        ? [me, ...participantList.slice(1)]
        : [me]
  }

  return {
    id: String(session.id),
    date,
    displayDate: displayDate(date),
    day: KR_DAYS[new Date(date).getDay()],
    time: (session.startTime ?? '').slice(0, 5),
    endTime: (session.endTime ?? '').slice(0, 5),
    location: session.location,
    rule: session.rules,
    maxCapacity: session.maxParticipants,
    status: session.status,
    openAt: session.openAt ?? null,
    participants: nextParticipants,
    activeCourts: courts ? Object.keys(courts).map(Number) : [],
    courts,
    applied: participation?.applied ?? false,
  }
}

function mapUser(user) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role === 'ADMIN' ? 'admin' : 'user',
    profileImageUrl: user.profileImageUrl,
    totalParticipations: user.totalParticipations ?? 0,
    monthlyParticipations: user.monthlyParticipations ?? 0,
  }
}

function mapNotice(notice) {
  return {
    id: String(notice.id),
    title: notice.title,
    text: notice.content ?? notice.title,
    createdAt: (notice.createdAt ?? '').slice(0, 10),
    pinned: notice.pinned,
    authorName: notice.authorName,
    imageUrls: notice.imageUrls ?? [],
  }
}

function makeNoticeForm(text, images = []) {
  const formData = new FormData()
  formData.append('title', text.slice(0, 30) || '공지사항')
  formData.append('content', text)
  formData.append('pinned', 'false')
  images.forEach((image, idx) => {
    formData.append(`images`, image)
  })
  return formData
}

function mapParticipants(rawParticipants = []) {
  return rawParticipants.filter(participant => isConfirmedParticipationStatus(participant.status)).map((participant, index) => {
    const user = participant.user ?? participant
    return {
      id: String(user.id ?? user.userId ?? participant.userId ?? `p-${index}`),
      name: user.name ?? participant.name ?? `참가자 ${index + 1}`,
      status: 'confirmed',
    }
  })
}

function mapPublicParticipants(rawParticipants = [], currentUser = null, sessionId = '') {
  return rawParticipants.filter(participant => isConfirmedParticipationStatus(participant.status)).map((participant, index) => {
    const isMe = participant.isMe === true
    const fallbackName = isMe ? currentUser?.name || '나' : `참가자 ${index + 1}`
    return {
      id: isMe ? currentUser?.id ?? `me-${sessionId}` : `anon-${sessionId}-${index}`,
      name: participant.userName ?? participant.name ?? participant.displayName ?? fallbackName,
      status: 'confirmed',
      order: participant.order ?? index + 1,
      isMe,
    }
  })
}

function mapCourts(rawCourts = []) {
  if (!Array.isArray(rawCourts) || rawCourts.length === 0) return null
  return rawCourts.reduce((acc, assignment) => {
    const courtNumber = String(assignment.courtNumber)
    if (!acc[courtNumber]) acc[courtNumber] = { playing: [], waiting: [] }
    const name = assignment.userName ?? assignment.name ?? assignment.user?.name
    if (name) acc[courtNumber].playing.push(name)
    return acc
  }, {})
}

function getCurrentYearMonth() {
  const today = new Date()
  return { year: today.getFullYear(), month: today.getMonth() + 1 }
}

export function AppProvider({ children, auth, needsOnboarding, onAuthChange }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [requiresName, setRequiresName] = useState(needsOnboarding)
  const [isAdmin, setIsAdmin] = useState(false)
  const [events, setEvents] = useState([])
  const [members, setMembers] = useState([])
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const currentUserRef = useRef(null)

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  const signOut = useCallback(async () => {
    const stored = readStoredAuth()
    try {
      if (stored?.refreshToken) await api.logout(stored.refreshToken)
    } catch {
      // Local sign-out should still proceed when the server token is already invalid.
    }
    clearAuth()
    onAuthChange(null)
  }, [onAuthChange])

  const refreshNotices = useCallback(async () => {
    const data = await api.notices()
    setNotices((data ?? []).map(mapNotice))
  }, [])

  const refreshMembers = useCallback(async (admin) => {
    if (!admin) {
      setMembers([])
      return
    }
    const data = await api.users()
    setMembers((data ?? []).map(mapUser))
  }, [])

  const refreshSessions = useCallback(async (year, month, userOverride = null) => {
    const viewer = userOverride ?? currentUserRef.current
    const sessions = await api.sessions(year, month)
    const mapped = await Promise.all((sessions ?? []).map(async (session) => {
      const [participation, participants, courts] = await Promise.all([
        api.myParticipation(session.id).catch(() => null),
        viewer?.role === 'admin'
          ? api.participants(session.id).then(mapParticipants).catch(() => null)
          : api.publicParticipations(session.id).then(data => mapPublicParticipants(data, viewer, session.id)).catch(() => null),
        api.courts(session.id).then(mapCourts).catch(() => null),
      ])
      return mapSession(session, participation, participants, courts, viewer)
    }))

    setEvents(prev => {
      const monthPrefix = `${year}-${String(month).padStart(2, '0')}`
      const others = prev.filter(event => !event.date.startsWith(monthPrefix))
      return [...others, ...mapped]
    })
  }, [])

  const loadInitialData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const me = await api.me()
      const user = mapUser(me)
      const admin = user.role === 'admin'
      setCurrentUser(user)
      setIsAdmin(admin)
      setRequiresName(!user.name?.trim())

      const { year, month } = getCurrentYearMonth()
      await Promise.all([
        refreshSessions(year, month, user),
        refreshNotices(),
        refreshMembers(admin),
      ])
    } catch (err) {
      setError(err.message)
      if (err.message.includes('토큰') || err.message.includes('인증')) {
        clearAuth()
        onAuthChange(null)
      }
    } finally {
      setLoading(false)
    }
  }, [onAuthChange, refreshMembers, refreshNotices, refreshSessions])

  useEffect(() => {
    if (!needsOnboarding) loadInitialData()
    else {
      setRequiresName(true)
      setLoading(false)
    }
  }, [loadInitialData, needsOnboarding])

  const completeOnboarding = useCallback(async (name) => {
    await api.onboarding(name)
    setRequiresName(false)
    window.history.replaceState({}, '', '/')
    await loadInitialData()
  }, [loadInitialData])

  const toggleRole = useCallback(async (memberId) => {
    const member = members.find(m => m.id === memberId)
    if (!member) return
    if (member.role === 'admin') await api.revokeAdmin(memberId)
    else await api.grantAdmin(memberId)
    await refreshMembers(true)
  }, [members, refreshMembers])

  const addNotice = useCallback(async (text, images = []) => {
    await api.createNotice(makeNoticeForm(text, images))
    await refreshNotices()
  }, [refreshNotices])

  const deleteNotice = useCallback(async (noticeId) => {
    await api.deleteNotice(noticeId)
    setNotices(prev => prev.filter(n => n.id !== noticeId))
  }, [])

  const updateNotice = useCallback(async (noticeId, text, images = []) => {
    await api.updateNotice(noticeId, makeNoticeForm(text, images))
    await refreshNotices()
  }, [refreshNotices])

  const createEvent = useCallback(async (data) => {
    await api.createSession({
      sessionDate: data.date,
      startTime: `${data.time}:00`,
      endTime: data.endTime ? `${data.endTime}:00` : '21:00:00',
      location: data.location,
      rules: data.rule,
      maxParticipants: data.maxCapacity,
      ...(data.openAt ? { openAt: data.openAt } : {}),
    })
    const [year, month] = data.date.split('-').map(Number)
    await refreshSessions(year, month)
  }, [refreshSessions])

  const updateEvent = useCallback(async (eventId, action, payload = {}) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    switch (action) {
      case 'join':
        await api.apply(eventId)
        break
      case 'leave':
        await api.cancelApply(eventId)
        break
      case 'updateCapacity':
        await api.updateCapacity(eventId, payload.newMax)
        break
      case 'selectCourts':
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, activeCourts: payload.courts } : e))
        return
      case 'resetCourts':
        await api.resetCourts(eventId)
        break
      case 'assignCourts': {
        const confirmed = event.participants.filter(p => p.status === 'confirmed' && !p.id.startsWith('confirmed-'))
        const activeCourts = event.activeCourts?.length ? event.activeCourts : [1, 2, 3]
        const assignments = confirmed.map((participant, index) => ({
          userId: Number(participant.id),
          courtNumber: activeCourts[Math.floor(index / 4) % activeCourts.length],
          matchType: 'DOUBLES',
        }))
        if (assignments.length > 0) await api.saveCourts(eventId, assignments)
        break
      }
      default:
        return
    }

    const [year, month] = event.date.split('-').map(Number)
    await refreshSessions(year, month)
  }, [events, refreshSessions])

  const deleteEvent = useCallback(async (eventId) => {
    const event = events.find(e => e.id === eventId)
    await api.deleteSession(eventId)
    setEvents(prev => prev.filter(e => e.id !== eventId))
    if (event) {
      const [year, month] = event.date.split('-').map(Number)
      await refreshSessions(year, month)
    }
  }, [events, refreshSessions])

  const value = useMemo(() => ({
    auth,
    loading,
    error,
    needsOnboarding: requiresName,
    completeOnboarding,
    isAdmin,
    setIsAdmin,
    currentUser,
    events,
    refreshSessions,
    createEvent,
    updateEvent,
    deleteEvent,
    members,
    toggleRole,
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    signOut,
    clubId: CLUB_ID,
  }), [
    addNotice, auth, completeOnboarding, createEvent, currentUser, deleteEvent,
    deleteNotice, error, events, isAdmin, loading, members, requiresName,
    notices, refreshSessions, signOut, toggleRole, updateEvent, updateNotice,
  ])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
