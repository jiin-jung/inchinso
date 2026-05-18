import { useApp } from '../context/AppContext'
import './ParticipantList.css'

export default function ParticipantList() {
  const { participants, currentUser } = useApp()
  const confirmed = participants.filter((p) => p.status === 'confirmed')

  return (
    <section className="plist">
      <div className="plist__section">
        <h3 className="plist__sub">
          확정 <span className="plist__count confirmed">{confirmed.length}명</span>
        </h3>
        <div className="plist__chips">
          {confirmed.map((p) => (
            <span key={p.id} className={`plist__chip${p.id === currentUser.id ? ' me' : ''}`}>
              {p.name}
            </span>
          ))}
        </div>
      </div>

    </section>
  )
}
