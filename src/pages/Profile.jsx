import { useApp } from '../context/AppContext'
import './Profile.css'

const STATUS_LABEL = {
  confirmed: '✅ 확정',
  waiting: '⏳ 대기',
  null: '미신청',
}

export default function Profile() {
  const { currentUser, myStatus, isAdmin, courts } = useApp()
  const myCourt = courts
    ? Object.entries(courts).find(([, members]) => members.includes(currentUser.name))?.[0]
    : null

  return (
    <div className="profile">
      <div className="profile__avatar">{currentUser.name[0]}</div>
      <h2 className="profile__name">{currentUser.name}</h2>
      <p className="profile__badge">{isAdmin ? '운영진' : '일반 회원'}</p>

      <div className="profile__card">
        <div className="profile__row">
          <span className="profile__label">참가 상태</span>
          <span className={`profile__val status-${myStatus ?? 'none'}`}>
            {STATUS_LABEL[myStatus] ?? '미신청'}
          </span>
        </div>
        <div className="profile__divider" />
        <div className="profile__row">
          <span className="profile__label">배정 코트</span>
          <span className="profile__val">
            {myCourt ? `${myCourt}번 코트` : '—'}
          </span>
        </div>
      </div>

      <div className="profile__stats">
        <div className="profile__stat">
          <span className="profile__stat-value">12</span>
          <span className="profile__stat-label">참여 횟수</span>
        </div>
        <div className="profile__stat-divider" />
        <div className="profile__stat">
          <span className="profile__stat-value">3</span>
          <span className="profile__stat-label">이번 달</span>
        </div>
      </div>
    </div>
  )
}
