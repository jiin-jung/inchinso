import { useApp } from '../context/AppContext'
import './NoticeCard.css'

export default function NoticeCard() {
  const { notice } = useApp()
  const { time, location, fee, rule } = notice

  return (
    <div className="notice-card">
      <h2 className="notice-card__title">공지</h2>
      <ul className="notice-card__list">
        <li><span className="notice-card__label">모임 시간</span><span>: {time}</span></li>
        <li><span className="notice-card__label">장소</span><span>: {location}</span></li>
        <li><span className="notice-card__label">회비</span><span>: {fee}</span></li>
        <li><span className="notice-card__label">수칙</span><span>: {rule}</span></li>
      </ul>
    </div>
  )
}
