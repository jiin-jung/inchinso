import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './NoticePage.css'

export default function NoticePage({ noticeId, onBack }) {
  const { notices, isAdmin, updateNotice, deleteNotice } = useApp()
  const notice = notices.find(n => n.id === noticeId)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  if (!notice) return <p className="np__not-found">공지를 찾을 수 없어요</p>

  const handleEdit = () => {
    setDraft(notice.text)
    setEditing(true)
  }

  const handleSave = () => {
    if (!draft.trim()) return
    updateNotice(noticeId, draft.trim())
    setEditing(false)
  }

  const handleDelete = () => {
    deleteNotice(noticeId)
    onBack()
  }

  return (
    <div className="np">
      {editing ? (
        <div className="np__edit">
          <textarea
            className="np__edit-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
            rows={6}
          />
          <div className="np__edit-btns">
            <button className="np__edit-btn np__edit-btn--cancel" onClick={() => setEditing(false)}>취소</button>
            <button className="np__edit-btn np__edit-btn--save" onClick={handleSave} disabled={!draft.trim()}>저장</button>
          </div>
        </div>
      ) : (
        <>
          <div className="np__body">
            <p className="np__date">{notice.createdAt}</p>
            <p className="np__text">{notice.text}</p>
          </div>

          {isAdmin && (
            <div className="np__actions">
              <button className="np__action-btn np__action-btn--edit" onClick={handleEdit}>수정</button>
              <button className="np__action-btn np__action-btn--delete" onClick={handleDelete}>삭제</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
