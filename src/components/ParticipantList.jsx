import { useApp } from '../context/AppContext'
import './ParticipantList.css'

export default function ParticipantList() {
  const { participants, currentUser } = useApp()
  const confirmed = participants.filter((p) => p.status === 'confirmed')
  const waiting = participants.filter((p) => p.status === 'waiting')

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

      {waiting.length > 0 && (
        <div className="plist__section">
          <h3 className="plist__sub">
            대기 <span className="plist__count waiting">{waiting.length}명</span>
          </h3>
          <div className="plist__chips">
            {waiting.map((p, i) => (
              <span key={p.id} className={`plist__chip waiting${p.id === currentUser.id ? ' me' : ''}`}>
                {i + 1}. {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
