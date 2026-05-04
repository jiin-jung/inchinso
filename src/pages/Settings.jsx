import { useApp } from '../context/AppContext'
import './Settings.css'

const GENERAL_SETTINGS = [
  { label: '알림 설정', desc: '모임 알림 받기' },
  { label: '언어', desc: '한국어' },
  { label: '앱 버전', desc: 'v0.1.0' },
  { label: '개인정보 처리방침', desc: '' },
]

export default function Settings() {
  const { isAdmin, setIsAdmin, signOut } = useApp()

  return (
    <div className="settings">
      <div className="settings__section">
        <div className="settings__admin-row">
          <div>
            <p className="settings__admin-title">운영진 모드</p>
            <p className="settings__admin-sub">모임 생성·코트 배정·인원 편집 권한</p>
          </div>
          <button
            className={`settings__toggle${isAdmin ? ' on' : ''}`}
            onClick={() => setIsAdmin(v => !v)}
            aria-label="운영진 모드 토글"
          >
            <span className="settings__toggle-thumb" />
          </button>
        </div>
      </div>

      <div className="settings__section">
        <ul className="settings__list">
          {GENERAL_SETTINGS.map(({ label, desc }) => (
            <li key={label} className="settings__item">
              <span className="settings__label">{label}</span>
              {desc ? <span className="settings__desc">{desc}</span> : <span className="settings__arrow">›</span>}
            </li>
          ))}
          <li className="settings__item danger" onClick={signOut} style={{ cursor: 'pointer' }}>
            <span className="settings__label">로그아웃</span>
            <span className="settings__arrow">›</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
