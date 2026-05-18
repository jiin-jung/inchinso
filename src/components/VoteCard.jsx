import { useApp } from '../context/AppContext'
import './VoteCard.css'

export default function VoteCard() {
  const { participants, maxCapacity, myStatus, joinSession, leaveSession } = useApp()
  const confirmedCount = participants.filter((p) => p.status === 'confirmed').length
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
      {myStatus && (
        <p className={`vote-card__status ${myStatus}`}>
          ✓ 확정
        </p>
      )}
      <button
        className={`vote-card__btn${myStatus ? ' active' : ''}`}
        onClick={myStatus ? leaveSession : joinSession}
        disabled={!myStatus && isFull}
      >
        {myStatus ? '신청 취소' : isFull ? '마감' : '참가 신청'}
      </button>
    </div>
  )
}
