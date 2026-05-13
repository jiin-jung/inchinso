import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { api } from '../lib/api'
import './Profile.css'

export default function Profile() {
  const { currentUser, isAdmin } = useApp()
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState(currentUser.name?.trim() || '')
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const displayName = currentUser.name?.trim() || '이름 미등록'

  const handleSaveName = async () => {
    if (!editName.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    setUpdating(true)
    setError('')
    try {
      await api.updateUser({ name: editName.trim() })
      setEditMode(false)
      window.location.reload()
    } catch (err) {
      setError(err.message || '이름 수정을 실패했습니다.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="profile">
      <div className="profile__avatar">{displayName[0]}</div>

      {editMode ? (
        <div className="profile__edit">
          <input
            className="profile__edit-input"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            autoFocus
            maxLength={50}
          />
          <div className="profile__edit-actions">
            <button
              className="profile__edit-btn save"
              onClick={handleSaveName}
              disabled={updating || !editName.trim()}
            >
              {updating ? '저장 중...' : '저장'}
            </button>
            <button
              className="profile__edit-btn cancel"
              onClick={() => {
                setEditMode(false)
                setEditName(currentUser.name?.trim() || '')
                setError('')
              }}
              disabled={updating}
            >
              취소
            </button>
          </div>
          {error && <p className="profile__error">{error}</p>}
        </div>
      ) : (
        <>
          <h2 className="profile__name">{displayName}</h2>
          <button
            className="profile__edit-trigger"
            onClick={() => setEditMode(true)}
          >
            이름 수정
          </button>
        </>
      )}

      <p className="profile__badge">{isAdmin ? '운영진' : '일반 회원'}</p>

      <div className="profile__stats">
        <div className="profile__stat">
          <span className="profile__stat-value">{currentUser.totalParticipations}</span>
          <span className="profile__stat-label">참여 횟수</span>
        </div>
        <div className="profile__stat-divider" />
        <div className="profile__stat">
          <span className="profile__stat-value">{currentUser.monthlyParticipations}</span>
          <span className="profile__stat-label">이번 달</span>
        </div>
      </div>
    </div>
  )
}
