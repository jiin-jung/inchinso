import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './Settings.css'

const KR_DAYS_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
const KR_DAYS_SHORT = ['일', '월', '화', '수', '목', '금', '토']
const DAYS_ROW = ['월', '화', '수', '목', '금', '토', '일']
const DAYS_ROW_FULL = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']

const GENERAL_SETTINGS = [
  { label: '알림 설정', desc: '모임 알림 받기' },
  { label: '언어', desc: '한국어' },
  { label: '앱 버전', desc: 'v0.1.0' },
  { label: '개인정보 처리방침', desc: '' },
]

function DatePickerCard({ date, onSelect }) {
  const [open, setOpen] = useState(false)
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const match = date?.match(/(\d+)월\s*(\d+)일/)
  const selMonth = match ? parseInt(match[1]) - 1 : -1
  const selDay = match ? parseInt(match[2]) : -1

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const handleSelect = (d) => {
    const selected = new Date(viewYear, viewMonth, d)
    onSelect({
      date: `${viewMonth + 1}월 ${d}일`,
      day: KR_DAYS_FULL[selected.getDay()],
    })
    setOpen(false)
  }

  return (
    <div className="picker-card">
      <button className="picker-card__header" onClick={() => setOpen(v => !v)}>
        <span className="picker-card__label">날짜</span>
        <div className="picker-card__right">
          <span className="picker-card__val">{date}</span>
          <span className={`picker-card__chevron${open ? ' open' : ''}`}>›</span>
        </div>
      </button>

      {open && (
        <div className="calendar">
          <div className="calendar__nav">
            <button className="calendar__nav-btn" onClick={prevMonth}>‹</button>
            <span className="calendar__month">{viewYear}년 {viewMonth + 1}월</span>
            <button className="calendar__nav-btn" onClick={nextMonth}>›</button>
          </div>
          <div className="calendar__weekdays">
            {KR_DAYS_SHORT.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="calendar__grid">
            {cells.map((d, i) => (
              <button
                key={i}
                className={[
                  'calendar__day',
                  !d ? 'empty' : '',
                  d && viewMonth === selMonth && d === selDay ? 'selected' : '',
                ].join(' ')}
                onClick={() => d && handleSelect(d)}
                disabled={!d}
              >
                {d || ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DayPickerCard({ day, onChange }) {
  return (
    <div className="picker-card">
      <div className="picker-card__header" style={{ cursor: 'default' }}>
        <span className="picker-card__label">요일</span>
        <span className="picker-card__val">{day}</span>
      </div>
      <div className="day-pills">
        {DAYS_ROW.map((d, i) => (
          <button
            key={d}
            className={`day-pill${day === DAYS_ROW_FULL[i] ? ' active' : ''}`}
            onClick={() => onChange(DAYS_ROW_FULL[i])}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Settings() {
  const { isAdmin, setIsAdmin, maxCapacity, updateMaxCapacity, notice, setNotice } = useApp()
  const [draft, setDraft] = useState({ ...notice })

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
            onClick={() => setIsAdmin(v => !v)}
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
              <button className="settings__cap-btn" onClick={() => updateMaxCapacity(Math.max(4, maxCapacity - 2))}>−</button>
              <span className="settings__cap-num">{maxCapacity}명</span>
              <button className="settings__cap-btn" onClick={() => updateMaxCapacity(Math.min(24, maxCapacity + 2))}>+</button>
            </div>
          </div>

          <div className="settings__section">
            <h3 className="settings__section-title">공지 수정</h3>

            <DatePickerCard
              date={draft.date}
              onSelect={({ date, day }) => setDraft(prev => ({ ...prev, date, day }))}
            />

            <DayPickerCard
              day={draft.day}
              onChange={day => setDraft(prev => ({ ...prev, day }))}
            />

            {[
              { key: 'time', label: '모임 시간' },
              { key: 'location', label: '장소' },
              { key: 'rule', label: '수칙' },
            ].map(({ key, label }) => (
              <div key={key} className="settings__notice-field">
                <label className="settings__notice-label">{label}</label>
                <input
                  className="settings__notice-input"
                  value={draft[key]}
                  onChange={e => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}

            <button className="settings__save-btn" onClick={handleSave}>저장</button>
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
          <li className="settings__item danger">
            <span className="settings__label">로그아웃</span>
            <span className="settings__arrow">›</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
