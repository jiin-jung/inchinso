import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './EventDetail.css'

export default function EventDetail({ eventId, onClose }) {
  const { events, currentUser, isAdmin, updateEvent, deleteEvent } = useApp()
  const event = events.find(e => e.id === eventId)

  const [editMode, setEditMode] = useState(false)
  const [newName, setNewName] = useState('')
  const [copied, setCopied] = useState(false)

  if (!event) return null

  const confirmed = event.participants.filter(p => p.status === 'confirmed')
  const myStatus = confirmed.find(p => p.id === currentUser.id)?.status ?? null
  const isFull = confirmed.length >= event.maxCapacity
  const pct = Math.min((confirmed.length / event.maxCapacity) * 100, 100)

  const myCourt = event.courts
    ? Object.entries(event.courts).find(([, members]) => members.includes(currentUser.name))?.[0]
    : null

  const handleAdd = () => {
    if (!newName.trim()) return
    updateEvent(eventId, 'add', { name: newName.trim() })
    setNewName('')
  }

  const handleCopy = () => {
    if (!event.courts) return
    const text = Object.entries(event.courts)
      .map(([num, members]) => `${num}번 코트: ${members.join(', ')}`)
      .join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="ed__overlay" onClick={onClose}>
      <div className="ed__sheet" onClick={e => e.stopPropagation()}>
        <div className="ed__handle" />

        {/* 헤더 */}
        <div className="ed__header">
          <div>
            <p className="ed__date">{event.displayDate} ({event.day})</p>
            <p className="ed__meta">⏰ {event.time}&nbsp;&nbsp;📍 {event.location}</p>
          </div>
          <button className="ed__close" onClick={onClose}>✕</button>
        </div>

        {/* 정원 + 참가 신청 */}
        <section className="ed__section">
          <div className="ed__capacity-row">
            <div>
              <span className="ed__cap-num">{confirmed.length}</span>
              <span className="ed__cap-max"> / {event.maxCapacity}명</span>
            </div>
            {isAdmin && (
              <div className="ed__cap-ctrl">
                <button onClick={() => updateEvent(eventId, 'updateCapacity', { newMax: Math.max(4, event.maxCapacity - 2) })}>−</button>
                <span>정원</span>
                <button onClick={() => updateEvent(eventId, 'updateCapacity', { newMax: Math.min(24, event.maxCapacity + 2) })}>+</button>
              </div>
            )}
          </div>
          <div className="ed__bar">
            <div className="ed__bar-fill" style={{ width: `${pct}%` }} />
          </div>
          {myStatus && (
            <span className={`ed__my-status ${myStatus}`}>
              ✓ 확정
            </span>
          )}
          <button
            className={`ed__join-btn${myStatus ? ' leave' : ''}`}
            disabled={!myStatus && isFull}
            onClick={() => myStatus
              ? updateEvent(eventId, 'leave', { userId: currentUser.id })
              : updateEvent(eventId, 'join', { user: currentUser })
            }
          >
            {myStatus ? '신청 취소' : isFull ? '마감' : '참가 신청'}
          </button>
        </section>

        {/* 참가 현황 */}
        <section className="ed__section">
          <div className="ed__section-header">
            <h3 className="ed__section-title">참가 현황</h3>
            {isAdmin && (
              <button
                className={`ed__edit-btn${editMode ? ' active' : ''}`}
                onClick={() => { setEditMode(v => !v); setNewName('') }}
              >
                {editMode ? '완료' : '편집'}
              </button>
            )}
          </div>

          <p className="ed__chips-label">확정 {confirmed.length}명</p>
          <div className="ed__chips">
            {confirmed.map(p => (
              <div key={p.id} className={`ed__chip${p.id === currentUser.id ? ' me' : ''}`}>
                {p.name}
                {editMode && (
                  <button className="ed__chip-remove" onClick={() => updateEvent(eventId, 'remove', { participantId: p.id })}>×</button>
                )}
              </div>
            ))}
          </div>

          {editMode && (
            <div className="ed__add-row">
              <input
                className="ed__add-input"
                placeholder="이름 직접 추가"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <button className="ed__add-btn" onClick={handleAdd} disabled={!newName.trim()}>
                추가
              </button>
            </div>
          )}
        </section>

        {/* 코트 배정 */}
        <section className="ed__section">
          <div className="ed__section-header">
            <h3 className="ed__section-title">코트 배정</h3>
            {event.courts && (
              <button className="ed__copy-btn" onClick={handleCopy}>
                💬 {copied ? '복사됨' : '카톡 복사'}
              </button>
            )}
          </div>

          {event.courts ? (
            <>
              {myCourt && (
                <p className="ed__my-court">내 코트: <strong>{myCourt}번</strong></p>
              )}
              <ul className="ed__court-list">
                {Object.entries(event.courts).map(([num, members]) => (
                  <li key={num} className={myCourt === num ? 'highlight' : ''}>
                    <strong>{num}번</strong> {members.join(', ')}
                  </li>
                ))}
              </ul>
              {isAdmin && (
                <button className="ed__assign-btn" onClick={() => updateEvent(eventId, 'assignCourts')}>
                  다시 배정
                </button>
              )}
            </>
          ) : isAdmin ? (
            <button className="ed__assign-btn" onClick={() => updateEvent(eventId, 'assignCourts')}>
              코트 배정하기
            </button>
          ) : (
            <p className="ed__pending">운영진이 배정 중이에요</p>
          )}
        </section>

        {/* 모임 삭제 (운영진) */}
        {isAdmin && (
          <section className="ed__section">
            <button
              className="ed__delete-btn"
              onClick={() => { deleteEvent(eventId); onClose() }}
            >
              모임 삭제
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
