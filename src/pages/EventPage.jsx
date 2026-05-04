import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './EventPage.css'

export default function EventPage({ eventId }) {
  const { events, currentUser, isAdmin, updateEvent, deleteEvent } = useApp()
  const event = events.find(e => e.id === eventId)

  const [editMode, setEditMode] = useState(false)
  const [newName, setNewName] = useState('')
  const [copied, setCopied] = useState(false)

  if (!event) return <p className="ep__not-found">모임을 찾을 수 없어요</p>

  const confirmed = event.participants.filter(p => p.status === 'confirmed')
  const waiting   = event.participants.filter(p => p.status === 'waiting')
  const myStatus  = event.participants.find(p => p.id === currentUser.id)?.status ?? null
  const isFull    = confirmed.length >= event.maxCapacity
  const pct       = Math.min((confirmed.length / event.maxCapacity) * 100, 100)

  const myCourt = event.courts
    ? Object.entries(event.courts).find(([, m]) => m.includes(currentUser.name))?.[0]
    : null

  const handleAdd = () => {
    if (!newName.trim()) return
    updateEvent(eventId, 'add', { name: newName.trim() })
    setNewName('')
  }

  const handleCopy = () => {
    if (!event.courts) return
    const text = Object.entries(event.courts)
      .map(([n, members]) => `${n}번 코트: ${members.join(', ')}`)
      .join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="ep">
      {/* 장소·수칙 요약 */}
      <div className="ep__hero">
        <p className="ep__time">⏰ {event.time}</p>
        <p className="ep__location">📍 {event.location}</p>
        {event.rule && <p className="ep__rule">📌 {event.rule}</p>}
      </div>

      {/* 정원 + 참가 신청 */}
      <section className="ep__section">
        <div className="ep__cap-row">
          <div>
            <span className="ep__cap-num">{confirmed.length}</span>
            <span className="ep__cap-max"> / {event.maxCapacity}명</span>
          </div>
          {isAdmin && (
            <div className="ep__cap-ctrl">
              <button onClick={() => updateEvent(eventId, 'updateCapacity', { newMax: Math.max(4, event.maxCapacity - 2) })}>−</button>
              <span>정원</span>
              <button onClick={() => updateEvent(eventId, 'updateCapacity', { newMax: Math.min(24, event.maxCapacity + 2) })}>+</button>
            </div>
          )}
        </div>

        <div className="ep__bar">
          <div className="ep__bar-fill" style={{ width: `${pct}%` }} />
        </div>

        {waiting.length > 0 && <p className="ep__waiting-msg">대기 {waiting.length}명</p>}

        {myStatus && (
          <span className={`ep__my-status ${myStatus}`}>
            {myStatus === 'confirmed' ? '✓ 확정' : '⏳ 대기중'}
          </span>
        )}

        <button
          className={`ep__join-btn${myStatus ? ' leave' : ''}`}
          onClick={() => myStatus
            ? updateEvent(eventId, 'leave', { userId: currentUser.id })
            : updateEvent(eventId, 'join', { user: currentUser })
          }
        >
          {myStatus ? '신청 취소' : isFull ? '대기 신청' : '참가 신청'}
        </button>
      </section>

      {/* 참가 현황 */}
      <section className="ep__section">
        <div className="ep__section-header">
          <h3 className="ep__section-title">참가 현황</h3>
          {isAdmin && (
            <button
              className={`ep__edit-btn${editMode ? ' active' : ''}`}
              onClick={() => { setEditMode(v => !v); setNewName('') }}
            >
              {editMode ? '완료' : '편집'}
            </button>
          )}
        </div>

        <p className="ep__chips-label">확정 {confirmed.length}명</p>
        <div className="ep__chips">
          {confirmed.map(p => (
            <div key={p.id} className={`ep__chip${p.id === currentUser.id ? ' me' : ''}`}>
              {p.name}
              {editMode && (
                <button className="ep__chip-remove" onClick={() => updateEvent(eventId, 'remove', { participantId: p.id })}>×</button>
              )}
            </div>
          ))}
        </div>

        {waiting.length > 0 && (
          <>
            <p className="ep__chips-label waiting">대기 {waiting.length}명</p>
            <div className="ep__chips">
              {waiting.map((p, i) => (
                <div key={p.id} className={`ep__chip waiting${p.id === currentUser.id ? ' me' : ''}`}>
                  {i + 1}. {p.name}
                  {editMode && (
                    <button className="ep__chip-remove" onClick={() => updateEvent(eventId, 'remove', { participantId: p.id })}>×</button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {editMode && (
          <div className="ep__add-row">
            <input
              className="ep__add-input"
              placeholder="이름 직접 추가"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button className="ep__add-btn" onClick={handleAdd} disabled={!newName.trim()}>추가</button>
          </div>
        )}
      </section>

      {/* 코트 배정 */}
      <section className="ep__section">
        <div className="ep__section-header">
          <h3 className="ep__section-title">코트 배정</h3>
          {event.courts && (
            <button className="ep__copy-btn" onClick={handleCopy}>
              💬 {copied ? '복사됨' : '카톡 복사'}
            </button>
          )}
        </div>

        {event.courts ? (
          <>
            {myCourt && (
              <div className="ep__my-court">
                내 코트 <strong>{myCourt}번</strong>
              </div>
            )}
            <ul className="ep__court-list">
              {Object.entries(event.courts).map(([num, members]) => (
                <li key={num} className={myCourt === num ? 'highlight' : ''}>
                  <strong>{num}번</strong>
                  <span>{members.join(', ')}</span>
                </li>
              ))}
            </ul>
            {isAdmin && (
              <button className="ep__action-btn" onClick={() => updateEvent(eventId, 'assignCourts')}>
                다시 배정
              </button>
            )}
          </>
        ) : isAdmin ? (
          <button className="ep__action-btn" onClick={() => updateEvent(eventId, 'assignCourts')}>
            코트 배정하기
          </button>
        ) : (
          <p className="ep__pending">운영진이 배정 중이에요</p>
        )}
      </section>

      {/* 삭제 (운영진) */}
      {isAdmin && (
        <section className="ep__section">
          <button className="ep__delete-btn" onClick={() => deleteEvent(eventId)}>
            모임 삭제
          </button>
        </section>
      )}
    </div>
  )
}
