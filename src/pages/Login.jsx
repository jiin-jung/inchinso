import { useState } from 'react'
import './Login.css'

export default function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('user')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onLogin({ name: name.trim(), isAdmin: role === 'admin' })
  }

  return (
    <div className="login">
      <div className="login__hero">
        <div className="login__shuttle">🏸</div>
        <h1 className="login__title">인친소</h1>
        <p className="login__subtitle">인천대 배드민턴 소모임</p>
      </div>

      <form className="login__sheet" onSubmit={handleSubmit}>
        <p className="login__welcome">반가워요!</p>

        <div className="login__field">
          <label className="login__field-label">이름</label>
          <input
            className="login__input"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="login__field">
          <label className="login__field-label">직책</label>
          <div className="login__role-btns">
            <button
              type="button"
              className={`login__role-btn${role === 'user' ? ' active' : ''}`}
              onClick={() => setRole('user')}
            >
              회원
            </button>
            <button
              type="button"
              className={`login__role-btn${role === 'admin' ? ' active' : ''}`}
              onClick={() => setRole('admin')}
            >
              운영진
            </button>
          </div>
        </div>

        <button className="login__submit-btn" type="submit" disabled={!name.trim()}>
          시작하기
        </button>
      </form>
    </div>
  )
}
