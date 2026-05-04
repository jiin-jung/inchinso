import { createContext, useContext, useState, useCallback } from 'react'

const MOCK_PARTICIPANTS = [
  { id: '1', name: '김철수' },
  { id: '2', name: '이영희' },
  { id: '3', name: '박민수' },
  { id: '4', name: '최지우' },
  { id: '5', name: '정민준' },
  { id: '6', name: '한소영' },
  { id: '7', name: '오태양' },
  { id: '8', name: '윤지수' },
  { id: '9', name: '강다은' },
]

const INITIAL_EVENTS = [
  {
    id: '1',
    date: '2026-05-09',
    displayDate: '5월 9일',
    day: '토요일',
    time: '18:00',
    location: '인천대 체육관 2층',
    rule: '10분 전 도착',
    maxCapacity: 16,
    participants: MOCK_PARTICIPANTS.map(p => ({ ...p, status: 'confirmed' })),
    courts: null,
  },
  {
    id: '2',
    date: '2026-05-16',
    displayDate: '5월 16일',
    day: '토요일',
    time: '18:00',
    location: '인천대 체육관 2층',
    rule: '10분 전 도착',
    maxCapacity: 16,
    participants: [],
    courts: null,
  },
]

const AppContext = createContext(null)

export function AppProvider({ children, user, onSignOut }) {
  const currentUser = { id: 'me', name: user.name }
  const [isAdmin, setIsAdmin] = useState(user.isAdmin)
  const [events, setEvents] = useState(INITIAL_EVENTS)

  const createEvent = useCallback((data) => {
    setEvents(prev => [
      ...prev,
      { id: Date.now().toString(), ...data, participants: [], courts: null },
    ])
  }, [])

  const updateEvent = useCallback((eventId, action, payload = {}) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event
      switch (action) {
        case 'join': {
          if (event.participants.find(p => p.id === payload.user.id)) return event
          const count = event.participants.filter(p => p.status === 'confirmed').length
          return {
            ...event,
            participants: [...event.participants, {
              ...payload.user,
              status: count < event.maxCapacity ? 'confirmed' : 'waiting',
            }],
          }
        }
        case 'leave': {
          const next = event.participants.filter(p => p.id !== payload.userId)
          return { ...event, participants: next.map((p, i) => ({ ...p, status: i < event.maxCapacity ? 'confirmed' : 'waiting' })) }
        }
        case 'remove': {
          const next = event.participants.filter(p => p.id !== payload.participantId)
          return { ...event, participants: next.map((p, i) => ({ ...p, status: i < event.maxCapacity ? 'confirmed' : 'waiting' })) }
        }
        case 'add': {
          const count = event.participants.filter(p => p.status === 'confirmed').length
          return {
            ...event,
            participants: [...event.participants, {
              id: `m-${Date.now()}`,
              name: payload.name,
              status: count < event.maxCapacity ? 'confirmed' : 'waiting',
            }],
          }
        }
        case 'updateCapacity': {
          return {
            ...event,
            maxCapacity: payload.newMax,
            participants: event.participants.map((p, i) => ({ ...p, status: i < payload.newMax ? 'confirmed' : 'waiting' })),
          }
        }
        case 'assignCourts': {
          const confirmed = event.participants.filter(p => p.status === 'confirmed')
          const shuffled = [...confirmed].sort(() => Math.random() - 0.5)
          const courts = {}
          shuffled.forEach((p, i) => {
            const num = Math.floor(i / 4) + 1
            if (num > 6) return
            if (!courts[num]) courts[num] = []
            courts[num].push(p.name)
          })
          return { ...event, courts }
        }
        default: return event
      }
    }))
  }, [])

  const deleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }, [])

  return (
    <AppContext.Provider value={{
      isAdmin, setIsAdmin,
      currentUser,
      events, createEvent, updateEvent, deleteEvent,
      signOut: onSignOut,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
