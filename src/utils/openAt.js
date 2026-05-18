export function getOpenAtDate(openAt) {
  if (!openAt) return null
  const date = new Date(openAt)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isBeforeOpen(openAt) {
  const date = getOpenAtDate(openAt)
  return Boolean(date && date.getTime() > Date.now())
}

export function formatOpenAt(openAt) {
  const date = getOpenAtDate(openAt)
  if (!date) return ''
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}시 오픈`
}
