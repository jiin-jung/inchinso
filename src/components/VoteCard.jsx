import { useApp } from '../context/AppContext'
import './VoteCard.css'

export default function VoteCard() {
  const { participants, maxCapacity, myStatus, joinSession, leaveSession } = useApp()
  const confirmedCount = participants.filter((p) => p.status === 'confirmed').length
  const waitingCount = participants.filter((p) => p.status === 'waiting').length
  const pct = Math.min((confirmedCount / maxCapacity) * 100, 100)
  const isFull = confirmedCount >= maxCapacity

  return (
    <div className="vote-card">
      <h2 className="vote-card__title">참가 신청</h2>
      <div className="vote-card__count">
        <span className="vote-card__num">{confirmedCount}</span>
        <span className="vote-card__max"> / {maxCapacity}명</span>
      </div>
      <div className="vote-card__bar-wrap">
        <div className="vote-card__bar">
          <div className="vote-card__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {waitingCount > 0 && (
        <p className="vote-card__waiting">대기 {waitingCount}명</p>
      )}
      {myStatus && (
        <p className={`vote-card__status ${myStatus}`}>
          {myStatus === 'confirmed' ? '✓ 확정' : '⏳ 대기중'}
        </p>
      )}
      <button
        className={`vote-card__btn${myStatus ? ' active' : ''}`}
        onClick={myStatus ? leaveSession : joinSession}
      >
        {myStatus ? '신청 취소' : isFull ? '대기 신청' : '참가 신청'}
      </button>
    </div>
  )
}
