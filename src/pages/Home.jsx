import { useState } from 'react'
import { useApp } from '../context/AppContext'
import EventForm from '../components/EventForm'
import './Home.css'

const KR_DAY_SHORT = ['일', '월', '화', '수', '목', '금', '토']

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const _today = new Date()
const todayStr = toDateStr(_today.getFullYear(), _today.getMonth(), _today.getDate())

export default function Home({ onEventSelect }) {
  const { events, isAdmin } = useApp()
  const [viewYear, setViewYear] = useState(_today.getFullYear())
  const [viewMonth, setViewMonth] = useState(_today.getMonth())
  const [createDate, setCreateDate] = useState(null)

  const eventMap = Object.fromEntries(events.map(e => [e.date, e]))

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleDayClick = (day) => {
    const dateStr = toDateStr(viewYear, viewMonth, day)
    const event = eventMap[dateStr]
    if (event) {
      onEventSelect(event.id)
    } else if (isAdmin) {
      setCreateDate(dateStr)
    }
  }

  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const monthEvents = events
    .filter(e => e.date.startsWith(monthStr))
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="home">
      {/* 캘린더 */}
      <div className="cal">
        <div className="cal__nav">
          <button className="cal__nav-btn" onClick={prevMonth}>‹</button>
          <span className="cal__title">{viewYear}년 {viewMonth + 1}월</span>
          <button className="cal__nav-btn" onClick={nextMonth}>›</button>
        </div>

        <div className="cal__weekdays">
          {KR_DAY_SHORT.map(d => <span key={d}>{d}</span>)}
        </div>

        <div className="cal__grid">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />
            const dateStr = toDateStr(viewYear, viewMonth, day)
            const hasEvent = !!eventMap[dateStr]
            const isToday = dateStr === todayStr
            return (
              <button
                key={dateStr}
                className={[
                  'cal__day',
                  isToday ? 'today' : '',
                  hasEvent ? 'has-event' : '',
                  isAdmin && !hasEvent ? 'addable' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleDayClick(day)}
              >
                <span className="cal__day-num">{day}</span>
                {hasEvent && <span className="cal__dot" />}
                {isAdmin && !hasEvent && <span className="cal__plus">+</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* 이번 달 모임 목록 */}
      <div className="home__events">
        <h2 className="home__events-title">{viewMonth + 1}월 모임</h2>

        {monthEvents.length === 0 ? (
          <p className="home__empty">
            {isAdmin ? '날짜를 눌러 모임을 추가하세요' : '예정된 모임이 없어요'}
          </p>
        ) : (
          <div className="home__event-list">
            {monthEvents.map(event => {
              const confirmed = event.participants.filter(p => p.status === 'confirmed').length
              const dayNum = event.displayDate.match(/(\d+)일/)?.[1] ?? ''
              const dayInitial = event.day[0]
              return (
                <button
                  key={event.id}
                  className="home__event-card"
                  onClick={() => onEventSelect(event.id)}
                >
                  <div className="home__event-badge">
                    <span className="home__event-badge-num">{dayNum}</span>
                    <span className="home__event-badge-day">{dayInitial}</span>
                  </div>
                  <div className="home__event-info">
                    <p className="home__event-title">{event.displayDate} ({event.day})</p>
                    <p className="home__event-meta">{event.time} · {event.location}</p>
                  </div>
                  <div className="home__event-count">
                    <span className="home__event-confirmed">{confirmed}</span>
                    <span className="home__event-max">/{event.maxCapacity}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {createDate && (
        <EventForm date={createDate} onClose={() => setCreateDate(null)} />
      )}
    </div>
  )
}
