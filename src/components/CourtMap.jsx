import './CourtMap.css'

export default function CourtMap({ courts, activeCourts = [], myCourt = null }) {
  // 배정 완료 상태면 실제 사용 코트만, 피커 미리보기면 전체 5개 표시
  const isPreview = !courts || Object.keys(courts).length === 0
  const courtsToShow = isPreview
    ? [1, 2, 3, 4, 5]
    : Object.keys(courts).map(Number).sort((a, b) => a - b)

  // 대기 인원 유무 통일 → NET 높이를 모든 코트에서 같은 위치에 맞춤
  const anyWaiting = courtsToShow.some(n => (courts?.[n]?.waiting?.length ?? 0) > 0)

  return (
    <div className="cmap">
      <div className="cmap__gym">
        {courtsToShow.map(n => {
          const court = courts?.[n]
          const playing = court?.playing ?? []
          const waiting = court?.waiting ?? []
          const isActive = activeCourts.includes(n) || playing.length > 0
          const isMine = myCourt !== null && String(n) === String(myCourt)
          const half = Math.ceil(playing.length / 2)
          return (
            <div
              key={n}
              className={`cmap__court${isActive ? ' active' : ''}${isMine ? ' mine' : ''}`}
            >
              <span className="cmap__num">{n}번</span>
              <div className="cmap__half">
                {playing.slice(0, half).map((name, i) => (
                  <span key={i} className="cmap__chip">{name}</span>
                ))}
              </div>
              <div className="cmap__net"><span>NET</span></div>
              <div className="cmap__half">
                {playing.slice(half).map((name, i) => (
                  <span key={i} className="cmap__chip">{name}</span>
                ))}
              </div>
              {/* anyWaiting이면 모든 코트에 동일 높이 공간 확보 → NET 정렬 유지 */}
              {anyWaiting && (
                <div className={`cmap__waiting${waiting.length === 0 ? ' cmap__waiting--empty' : ''}`}>
                  {waiting.map((name, i) => (
                    <span key={i} className="cmap__chip cmap__chip--wait">{name}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        <div className="cmap__wall">
          <div className="cmap__door"><span>출</span></div>
          <div className="cmap__door"><span>입</span></div>
        </div>
      </div>
    </div>
  )
}
