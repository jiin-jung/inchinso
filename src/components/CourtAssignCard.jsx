import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './CourtAssignCard.css'

export default function CourtAssignCard() {
  const { courts, assignCourts, setCourts, isAdmin, participants, currentUser } = useApp()
  const [copied, setCopied] = useState(false)
  const confirmedCount = participants.filter((p) => p.status === 'confirmed').length

  const myCourt = courts
    ? Object.entries(courts).find(([, members]) => members.includes(currentUser.name))?.[0]
    : null

  const handleCopy = () => {
    if (!courts) return
    const text = Object.entries(courts)
      .map(([num, members]) => `${num}번 코트: ${members.join(', ')}`)
      .join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="court-card">
      <h2 className="court-card__title">코트 배정</h2>

      {courts ? (
        <>
          {myCourt && (
            <div className="court-card__my-court">
              <span className="court-card__my-label">내 코트</span>
              <span className="court-card__my-num">{myCourt}번</span>
            </div>
          )}
          <ul className="court-card__result">
            {Object.entries(courts).map(([num, members]) => (
              <li key={num} className={myCourt === num ? 'highlight' : ''}>
                <strong>{num}번 코트</strong>
                <span>{members.join(', ')}</span>
              </li>
            ))}
          </ul>
          {isAdmin && (
            <button className="court-card__btn" onClick={assignCourts}>
              다시 배정
            </button>
          )}
        </>
      ) : (
        <>
          <div className="court-card__icon">🏸</div>
          <p className="court-card__desc">
            확정 <strong>{confirmedCount}명</strong> 배정 대기
          </p>
          {isAdmin ? (
            <button className="court-card__btn" onClick={assignCourts}>
              코트 배정하기
            </button>
          ) : (
            <p className="court-card__pending">운영진이 배정 중이에요</p>
          )}
        </>
      )}

      <button className="court-card__copy" onClick={handleCopy} disabled={!courts}>
        💬 {copied ? '복사 완료!' : '카톡 복사'}
      </button>
    </div>
  )
}
