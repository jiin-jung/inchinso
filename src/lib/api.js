const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://inchinso.up.railway.app'
const CLUB_ID = import.meta.env.VITE_CLUB_ID ?? '1'

export const AUTH_STORAGE_KEY = 'inchinso.auth'

export function getLoginUrl() {
  return `${API_BASE_URL}/oauth2/authorization/google`
}

export function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeAuth(auth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

async function parseResponse(response) {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest(path, options = {}, retry = true) {
  const auth = readStoredAuth()
  const headers = new Headers(options.headers)

  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth?.accessToken) {
    headers.set('Authorization', `Bearer ${auth.accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body instanceof FormData ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (response.status === 401 && retry && auth?.refreshToken) {
    const reissued = await reissueToken(auth.refreshToken)
    if (reissued?.accessToken) {
      storeAuth(reissued)
      return apiRequest(path, options, false)
    }
  }

  const data = await parseResponse(response)

  if (!response.ok) {
    const message = data?.message ?? '요청을 처리하지 못했습니다.'
    const error = new Error(message)
    error.code = data?.code
    error.status = response.status
    throw error
  }

  return data
}

export async function reissueToken(refreshToken) {
  const response = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) return null
  return parseResponse(response)
}

export const api = {
  me: () => apiRequest('/api/users/me'),
  users: () => apiRequest('/api/users'),
  updateUser: (body) => apiRequest('/api/users/me', { method: 'PATCH', body }),
  grantAdmin: (id) => apiRequest(`/api/users/${id}/grant-admin`, { method: 'POST' }),
  revokeAdmin: (id) => apiRequest(`/api/users/${id}/revoke-admin`, { method: 'POST' }),
  onboarding: (name) => apiRequest('/api/auth/onboarding', { method: 'POST', body: { name } }),
  logout: (refreshToken) => apiRequest('/api/auth/logout', { method: 'POST', body: { refreshToken } }),

  sessions: (year, month) => apiRequest(`/api/clubs/${CLUB_ID}/sessions?year=${year}&month=${month}`),
  session: (sessionId) => apiRequest(`/api/clubs/${CLUB_ID}/sessions/${sessionId}`),
  createSession: (body) => apiRequest(`/api/clubs/${CLUB_ID}/sessions`, { method: 'POST', body }),
  deleteSession: (sessionId) => apiRequest(`/api/clubs/${CLUB_ID}/sessions/${sessionId}`, { method: 'DELETE' }),
  updateCapacity: (sessionId, max) => apiRequest(`/api/clubs/${CLUB_ID}/sessions/${sessionId}/max-participants?max=${max}`, { method: 'PATCH' }),
  participants: (sessionId) => apiRequest(`/api/clubs/${CLUB_ID}/sessions/${sessionId}/participants`),

  apply: (sessionId) => apiRequest(`/api/sessions/${sessionId}/participations`, { method: 'POST' }),
  cancelApply: (sessionId) => apiRequest(`/api/sessions/${sessionId}/participations`, { method: 'DELETE' }),
  myParticipation: (sessionId) => apiRequest(`/api/sessions/${sessionId}/participations/me`),
  publicParticipations: (sessionId) => apiRequest(`/api/sessions/${sessionId}/participations/public`),

  notices: () => apiRequest(`/api/clubs/${CLUB_ID}/notices`),
  notice: (noticeId) => apiRequest(`/api/clubs/${CLUB_ID}/notices/${noticeId}`),
  createNotice: (formData) => apiRequest(`/api/clubs/${CLUB_ID}/notices`, { method: 'POST', body: formData }),
  updateNotice: (noticeId, formData) => apiRequest(`/api/clubs/${CLUB_ID}/notices/${noticeId}`, { method: 'PUT', body: formData }),
  deleteNotice: (noticeId) => apiRequest(`/api/clubs/${CLUB_ID}/notices/${noticeId}`, { method: 'DELETE' }),

  courts: (sessionId) => apiRequest(`/api/sessions/${sessionId}/courts`),
  saveCourts: (sessionId, body) => apiRequest(`/api/sessions/${sessionId}/courts`, { method: 'POST', body }),
  resetCourts: (sessionId) => apiRequest(`/api/sessions/${sessionId}/courts`, { method: 'DELETE' }),
}
