import './AppBar.css'

export default function AppBar({ title, isAdmin, onBack }) {
  return (
    <header className="appbar">
      {onBack ? (
        <button className="appbar__back" onClick={onBack} aria-label="뒤로가기">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      ) : (
        <div className="appbar__spacer" />
      )}

      <h1 className="appbar__title">{title}</h1>

      <div className="appbar__right">
        {!onBack && isAdmin && <span className="appbar__admin-badge">운영진</span>}
        {!onBack && (
          <button className="appbar__bell" aria-label="알림">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        )}
        {onBack && <div className="appbar__spacer" />}
      </div>
    </header>
  )
}
