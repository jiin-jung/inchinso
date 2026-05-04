import { useApp } from '../context/AppContext'
import './Profile.css'

export default function Profile() {
  const { currentUser, isAdmin } = useApp()

  return (
    <div className="profile">
      <div className="profile__avatar">{currentUser.name[0]}</div>
      <h2 className="profile__name">{currentUser.name}</h2>
      <p className="profile__badge">{isAdmin ? '운영진' : '일반 회원'}</p>

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
