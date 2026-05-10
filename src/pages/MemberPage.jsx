import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import './MemberPage.css'

export default function MemberPage() {
  const { members, events, isAdmin, toggleRole } = useApp()

  const attendance = useMemo(() => {
    const map = {}
    events.forEach(event => {
      event.participants.forEach(p => {
        if (!map[p.id]) map[p.id] = { confirmed: 0 }
        if (p.status === 'confirmed') map[p.id].confirmed++
      })
    })
    return map
  }, [events])

  const totalEvents = events.length
  const adminCount = members.filter(m => m.role === 'admin').length

  return (
    <div className="mp">
      <div className="mp__summary">
        <div className="mp__summary-item">
          <span className="mp__summary-num">{members.length}</span>
          <span className="mp__summary-label">전체 회원</span>
        </div>
        <div className="mp__summary-divider" />
        <div className="mp__summary-item">
          <span className="mp__summary-num">{adminCount}</span>
          <span className="mp__summary-label">운영진</span>
        </div>
        <div className="mp__summary-divider" />
        <div className="mp__summary-item">
          <span className="mp__summary-num">{totalEvents}</span>
          <span className="mp__summary-label">총 모임</span>
        </div>
      </div>

      <div className="mp__list">
        {members.map(m => {
          const confirmed = attendance[m.id]?.confirmed ?? 0
          const rate = totalEvents > 0 ? Math.round((confirmed / totalEvents) * 100) : 0
          return (
            <div key={m.id} className="mp__card">
              <div className="mp__avatar">
                <span>{m.name[0]}</span>
              </div>
              <div className="mp__info">
                <div className="mp__name-row">
                  <span className="mp__name">{m.name}</span>
                  <span className={`mp__role-badge ${m.role}`}>
                    {m.role === 'admin' ? '운영진' : '회원'}
                  </span>
                </div>
                <div className="mp__bar-wrap">
                  <div className="mp__bar">
                    <div className="mp__bar-fill" style={{ width: `${rate}%` }} />
                  </div>
                  <span className="mp__rate">{rate}%</span>
                </div>
                <p className="mp__stat">출석 {confirmed}/{totalEvents}회</p>
              </div>
              {isAdmin && (
                <button
                  className={`mp__toggle ${m.role}`}
                  onClick={() => toggleRole(m.id)}
                >
                  {m.role === 'admin' ? '회원으로' : '운영진으로'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
