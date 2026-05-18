export function getEventStats(event, userId) {
  const confirmed = event.participants.filter(p => p.status === 'confirmed')
  const myStatus  = confirmed.find(p => p.id === userId)?.status ?? null
  const isFull    = confirmed.length >= event.maxCapacity
  const pct       = Math.min((confirmed.length / event.maxCapacity) * 100, 100)
  return { confirmed, myStatus, isFull, pct }
}
