import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { getEventStats } from '../utils/eventStats'
import { formatOpenAt, isBeforeOpen as getIsBeforeOpen } from '../utils/openAt'
import EventForm from '../components/EventForm'
import './Home.css'

const KR_DAY_SHORT = ['일', '월', '화', '수', '목', '금', '토']

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const _today = new Date()
const todayStr = toDateStr(_today.getFullYear(), _today.getMonth(), _today.getDate())

function EventMiniCard({ event, onOpen, onClose }) {
  const { currentUser, updateEvent } = useApp()
  const { confirmed, myStatus, isFull, pct } = getEventStats(event, currentUser.id)
  const [participationPending, setParticipationPending] = useState(false)
  const [participationError, setParticipationError] = useState('')
  const isBeforeOpen = !myStatus && getIsBeforeOpen(event.openAt)
  const openAtLabel = formatOpenAt(event.openAt)

  const handleParticipation = async () => {
    if (participationPending) return
    setParticipationPending(true)
    setParticipationError('')
    try {
      await updateEvent(
        event.id,
        myStatus ? 'leave' : 'join',
        myStatus ? { userId: currentUser.id } : { user: currentUser },
      )
    } catch (err) {
      setParticipationError(
        err.code === 'PARTICIPATION_NOT_OPEN'
          ? '아직 신청 시간이 아닙니다.'
          : err.message || '참가 신청을 처리하지 못했습니다.',
      )
    } finally {
      setParticipationPending(false)
    }
  }

  return (
    <div className="mini-overlay" onClick={onClose}>
      <div className="mini-card" onClick={e => e.stopPropagation()}>
        <div className="mini-card__handle" />
        <div className="mini-card__header">
          <div>
            <p className="mini-card__date">{event.displayDate} ({event.day})</p>
            <p className="mini-card__meta">{event.time} · {event.location}</p>
          </div>
          <button className="mini-card__close" onClick={onClose}>×</button>
        </div>

        <div className="mini-card__bar">
          <div className="mini-card__bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="mini-card__count-row">
          <span className="mini-card__count-num">{confirmed.length}</span>
          <span className="mini-card__count-max">/{event.maxCapacity}명</span>
          {myStatus && (
            <span className={`mini-card__status ${myStatus}`}>
              ✓ 확정
            </span>
          )}
        </div>

        <div className="mini-card__actions">
          <button
            className={`mini-card__join-btn${myStatus ? ' leave' : ''}`}
            onClick={handleParticipation}
            disabled={participationPending || isBeforeOpen || (!myStatus && isFull)}
          >
            {participationPending
              ? '처리 중...'
              : myStatus
                ? '신청 취소'
                : isBeforeOpen
                  ? openAtLabel
                  : isFull ? '마감' : '참가 신청'}
          </button>
          <button className="mini-card__open-btn" onClick={() => onOpen(event.id)}>
            상세 보기 →
          </button>
        </div>
        {participationError && <p className="mini-card__error">{participationError}</p>}
      </div>
    </div>
  )
}

export default function Home({ onEventSelect, onNoticeSelect }) {
  const { events, isAdmin, notices, addNotice, deleteNotice, refreshSessions } = useApp()
  const [viewYear, setViewYear] = useState(_today.getFullYear())
  const [viewMonth, setViewMonth] = useState(_today.getMonth())
  const [createDate, setCreateDate] = useState(null)
  const [previewId, setPreviewId] = useState(null)
  const [addingNotice, setAddingNotice] = useState(false)
  const [noticeText, setNoticeText] = useState('')
  const [noticeImages, setNoticeImages] = useState([])
  const [uploadingNotice, setUploadingNotice] = useState(false)

  useEffect(() => {
    refreshSessions(viewYear, viewMonth + 1)
  }, [refreshSessions, viewMonth, viewYear])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    setNoticeImages(prev => [...prev, ...files])
  }

  const removeNoticeImage = (index) => {
    setNoticeImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddNotice = async () => {
    if (!noticeText.trim()) return
    setUploadingNotice(true)
    try {
      await addNotice(noticeText.trim(), noticeImages)
      setNoticeText('')
      setNoticeImages([])
      setAddingNotice(false)
    } finally {
      setUploadingNotice(false)
    }
  }

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
      setPreviewId(event.id)
    } else if (isAdmin) {
      setCreateDate(dateStr)
    }
  }

  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const monthEvents = events
    .filter(e => e.date.startsWith(monthStr))
    .sort((a, b) => a.date.localeCompare(b.date))

  const previewEvent = previewId ? events.find(e => e.id === previewId) : null

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

      {/* 공지사항 */}
      {(notices.length > 0 || isAdmin) && (
        <div className="home__notice">
          <div className="home__notice-header">
            <span className="home__notice-title">📢 공지사항</span>
            {isAdmin && !addingNotice && (
              <button className="home__notice-add" onClick={() => setAddingNotice(true)}>+ 추가</button>
            )}
          </div>

          {notices.length === 0 && !addingNotice && (
            <p className="home__notice-empty">등록된 공지가 없습니다</p>
          )}

          {notices.map(n => (
            <button key={n.id} className="home__notice-item" onClick={() => onNoticeSelect(n.id)}>
              <p className="home__notice-text">{n.text}</p>
              <div className="home__notice-meta">
                <span className="home__notice-date">{n.createdAt}</span>
                {isAdmin && (
                  <button className="home__notice-del" onClick={e => { e.stopPropagation(); deleteNotice(n.id) }}>삭제</button>
                )}
              </div>
            </button>
          ))}

          {addingNotice && (
            <div className="home__notice-form">
              <textarea
                className="home__notice-input"
                placeholder="공지 내용을 입력하세요"
                value={noticeText}
                onChange={e => setNoticeText(e.target.value)}
                rows={3}
                autoFocus
              />

              {noticeImages.length > 0 && (
                <div className="home__notice-images">
                  {noticeImages.map((file, idx) => (
                    <div key={idx} className="home__notice-image-item">
                      <span className="home__notice-image-name">{file.name}</span>
                      <button
                        className="home__notice-image-remove"
                        type="button"
                        onClick={() => removeNoticeImage(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="home__notice-image-upload">
                <label className="home__notice-file-label">
                  📷 이미지 선택
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="home__notice-form-btns">
                <button
                  className="home__notice-btn home__notice-btn--cancel"
                  onClick={() => {
                    setAddingNotice(false)
                    setNoticeText('')
                    setNoticeImages([])
                  }}
                  disabled={uploadingNotice}
                >
                  취소
                </button>
                <button
                  className="home__notice-btn home__notice-btn--submit"
                  onClick={handleAddNotice}
                  disabled={!noticeText.trim() || uploadingNotice}
                >
                  {uploadingNotice ? '등록 중...' : '등록'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                  onClick={() => setPreviewId(event.id)}
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

      {previewEvent && (
        <EventMiniCard
          event={previewEvent}
          onOpen={(id) => { setPreviewId(null); onEventSelect(id) }}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  )
}
