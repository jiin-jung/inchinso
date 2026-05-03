import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import './Settings.css'

const NOTICE_LABELS = {
  time: '모임 시간',
  location: '장소',
  fee: '회비',
  rule: '수칙',
}

const GENERAL_SETTINGS = [
  { label: '알림 설정', desc: '모임 알림 받기' },
  { label: '언어', desc: '한국어' },
  { label: '앱 버전', desc: 'v0.1.0' },
  { label: '개인정보 처리방침', desc: '' },
]

export default function Settings() {
  const { isAdmin, setIsAdmin, maxCapacity, updateMaxCapacity, notice, setNotice } = useApp()
  const [draft, setDraft] = useState({ ...notice })

  const handleSignOut = () => supabase.auth.signOut()

  const handleSave = () => setNotice({ ...draft })

  return (
    <div className="settings">
      <div className="settings__section">
        <div className="settings__admin-row">
          <div>
            <p className="settings__admin-title">운영진 모드</p>
            <p className="settings__admin-sub">공지·정원·코트 배정 권한</p>
          </div>
          <button
            className={`settings__toggle${isAdmin ? ' on' : ''}`}
            onClick={() => setIsAdmin((v) => !v)}
            aria-label="운영진 모드 토글"
          >
            <span className="settings__toggle-thumb" />
          </button>
        </div>
      </div>

      {isAdmin && (
        <>
          <div className="settings__section">
            <h3 className="settings__section-title">정원 설정</h3>
            <div className="settings__capacity">
              <button
                className="settings__cap-btn"
                onClick={() => updateMaxCapacity(Math.max(4, maxCapacity - 2))}
              >
                −
              </button>
              <span className="settings__cap-num">{maxCapacity}명</span>
              <button
                className="settings__cap-btn"
                onClick={() => updateMaxCapacity(Math.min(24, maxCapacity + 2))}
              >
                +
              </button>
            </div>
          </div>

          <div className="settings__section">
            <h3 className="settings__section-title">공지 수정</h3>
            {Object.entries(draft).map(([key, val]) => (
              <div key={key} className="settings__notice-field">
                <label className="settings__notice-label">{NOTICE_LABELS[key] || key}</label>
                <input
                  className="settings__notice-input"
                  value={val}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
            <button className="settings__save-btn" onClick={handleSave}>
              저장
            </button>
          </div>
        </>
      )}

      <div className="settings__section">
        <ul className="settings__list">
          {GENERAL_SETTINGS.map(({ label, desc }) => (
            <li key={label} className="settings__item">
              <span className="settings__label">{label}</span>
              {desc ? <span className="settings__desc">{desc}</span> : <span className="settings__arrow">›</span>}
            </li>
          ))}
          <li className="settings__item danger" onClick={handleSignOut}>
            <span className="settings__label">로그아웃</span>
            <span className="settings__arrow">›</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
