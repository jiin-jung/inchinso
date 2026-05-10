export function getEventStats(event, userId) {
  const confirmed = event.participants.filter(p => p.status === 'confirmed')
  const waiting   = event.participants.filter(p => p.status === 'waiting')
  const myStatus  = event.participants.find(p => p.id === userId)?.status ?? null
  const isFull    = confirmed.length >= event.maxCapacity
  const pct       = Math.min((confirmed.length / event.maxCapacity) * 100, 100)
  return { confirmed, waiting, myStatus, isFull, pct }
}
