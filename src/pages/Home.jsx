import NoticeCard from '../components/NoticeCard'
import VoteCard from '../components/VoteCard'
import CourtAssignCard from '../components/CourtAssignCard'
import ParticipantList from '../components/ParticipantList'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      <NoticeCard />
      <div className="home__cards">
        <VoteCard />
        <CourtAssignCard />
      </div>
      <div className="home__section-title">참가 현황</div>
      <ParticipantList />
    </div>
  )
}
