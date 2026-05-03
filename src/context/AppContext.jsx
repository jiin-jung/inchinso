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

const INITIAL_NOTICE = {
  date: '5월 10일',
  day: '토요일',
  time: '18:00',
  location: '인천대 체육관 2층',
  rule: '10분 전 도착',
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const currentUser = { id: 'me', name: '박지민' }

  const [isAdmin, setIsAdmin] = useState(true)
  const [maxCapacity, setMaxCapacity] = useState(16)
  const [participants, setParticipants] = useState(
    MOCK_PARTICIPANTS.map((p) => ({ ...p, status: 'confirmed' }))
  )
  const [notice, setNotice] = useState(INITIAL_NOTICE)
  const [courts, setCourts] = useState(null)

  const myStatus = participants.find((p) => p.id === currentUser.id)?.status ?? null

  const joinSession = useCallback(() => {
    setParticipants((prev) => {
      if (prev.find((p) => p.id === currentUser.id)) return prev
      const confirmedCount = prev.filter((p) => p.status === 'confirmed').length
      const status = confirmedCount < maxCapacity ? 'confirmed' : 'waiting'
      return [...prev, { ...currentUser, status }]
    })
  }, [maxCapacity])

  const leaveSession = useCallback(() => {
    setParticipants((prev) => {
      const next = prev.filter((p) => p.id !== currentUser.id)
      return next.map((p, i) => ({ ...p, status: i < maxCapacity ? 'confirmed' : 'waiting' }))
    })
  }, [maxCapacity])

  const updateMaxCapacity = useCallback((newMax) => {
    setMaxCapacity(newMax)
    setParticipants((prev) =>
      prev.map((p, i) => ({ ...p, status: i < newMax ? 'confirmed' : 'waiting' }))
    )
  }, [])

  const assignCourts = useCallback(() => {
    const confirmed = participants.filter((p) => p.status === 'confirmed')
    const shuffled = [...confirmed].sort(() => Math.random() - 0.5)
    const result = {}
    shuffled.forEach((p, i) => {
      const num = Math.floor(i / 4) + 1
      if (num > 6) return
      if (!result[num]) result[num] = []
      result[num].push(p.name)
    })
    setCourts(result)
  }, [participants])

  return (
    <AppContext.Provider
      value={{
        isAdmin, setIsAdmin,
        currentUser,
        maxCapacity, updateMaxCapacity,
        participants, myStatus,
        joinSession, leaveSession,
        notice, setNotice,
        courts, assignCourts, setCourts,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
