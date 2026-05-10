import { getLoginUrl } from '../lib/api'
import './Login.css'

export default function Login() {
  const handleLogin = () => {
    window.location.href = getLoginUrl()
  }

  return (
    <div className="login">
      <div className="login__hero">
        <div className="login__shuttle">🏸</div>
        <h1 className="login__title">인친소</h1>
        <p className="login__subtitle">인천대 배드민턴 소모임</p>
      </div>

      <div className="login__sheet">
        <p className="login__welcome">반가워요!</p>
        <button className="login__submit-btn" type="button" onClick={handleLogin}>
          Google로 시작하기
        </button>
      </div>
    </div>
  )
}
