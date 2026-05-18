import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './EventForm.css'

const KR_DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function formatDisplayDate(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${parseInt(m)}월 ${parseInt(d)}일`
}

export default function EventForm({ date, onClose }) {
  const { createEvent } = useApp()
  const dayName = KR_DAYS[new Date(date).getDay()]
  const displayDate = formatDisplayDate(date)

  const [form, setForm] = useState({
    time: '18:00',
    location: '인천대 21호 체육관',
    rule: '10분 전 도착',
    maxCapacity: 16,
    openAt: '',
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = () => {
    createEvent({ date, displayDate, day: dayName, ...form, maxCapacity: Number(form.maxCapacity) })
    onClose()
  }

  return (
    <div className="ef__overlay" onClick={onClose}>
      <div className="ef__sheet" onClick={e => e.stopPropagation()}>
        <div className="ef__handle" />

        <div className="ef__header">
          <h2 className="ef__title">새 모임 추가</h2>
          <button className="ef__close" onClick={onClose}>✕</button>
        </div>

        <div className="ef__date-badge">{displayDate} ({dayName})</div>

        {[
          { key: 'time',     label: '시간', placeholder: '18:00' },
          { key: 'location', label: '장소', placeholder: '인천대 21호 체육관' },
          { key: 'rule',     label: '수칙', placeholder: '10분 전 도착' },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="ef__field">
            <label className="ef__label">{label}</label>
            <input
              className="ef__input"
              value={form[key]}
              placeholder={placeholder}
              onChange={e => set(key, e.target.value)}
            />
          </div>
        ))}

        <div className="ef__field">
          <label className="ef__label">오픈</label>
          <input
            className="ef__input"
            type="datetime-local"
            value={form.openAt}
            onChange={e => set('openAt', e.target.value)}
          />
        </div>

        <div className="ef__field">
          <label className="ef__label">정원</label>
          <div className="ef__capacity">
            <button type="button" onClick={() => set('maxCapacity', Math.max(4, form.maxCapacity - 2))}>−</button>
            <span>{form.maxCapacity}명</span>
            <button type="button" onClick={() => set('maxCapacity', Math.min(24, form.maxCapacity + 2))}>+</button>
          </div>
        </div>

        <button className="ef__submit" onClick={handleSubmit}>모임 생성</button>
      </div>
    </div>
  )
}
