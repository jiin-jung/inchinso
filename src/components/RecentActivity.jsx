import './RecentActivity.css'

const DEFAULT_ACTIVITY = [
  { court: 'A', members: ['김철수', '이영희', '박민수', '최지우'] },
  { court: 'B', members: ['정민준', '한소영', '오태양', '윤지수'] },
]

export default function RecentActivity({ activity = DEFAULT_ACTIVITY }) {
  return (
    <section className="activity">
      <h2 className="activity__title">최근 활동</h2>
      <ul className="activity__list">
        {activity.map(({ court, members }) => (
          <li key={court} className="activity__item">
            <span className="activity__court">{court}코트</span>
            <span className="activity__members">{members.join(', ')}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
