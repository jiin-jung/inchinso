import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './NoticePage.css'

export default function NoticePage({ noticeId, onBack }) {
  const { notices, isAdmin, updateNotice, deleteNotice } = useApp()
  const notice = notices.find(n => n.id === noticeId)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [editImages, setEditImages] = useState([])
  const [updating, setUpdating] = useState(false)

  if (!notice) return <p className="np__not-found">공지를 찾을 수 없어요</p>

  const handleEdit = () => {
    setDraft(notice.text)
    setEditImages([])
    setEditing(true)
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    setEditImages(prev => [...prev, ...files])
  }

  const removeEditImage = (index) => {
    setEditImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!draft.trim()) return
    setUpdating(true)
    try {
      await updateNotice(noticeId, draft.trim(), editImages)
      setEditing(false)
    } finally {
      setUpdating(false)
    }
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

          {editImages.length > 0 && (
            <div className="np__edit-images">
              {editImages.map((file, idx) => (
                <div key={idx} className="np__edit-image-item">
                  <span className="np__edit-image-name">{file.name}</span>
                  <button
                    className="np__edit-image-remove"
                    type="button"
                    onClick={() => removeEditImage(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="np__edit-file-label">
            📷 이미지 추가
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>

          <div className="np__edit-btns">
            <button
              className="np__edit-btn np__edit-btn--cancel"
              onClick={() => setEditing(false)}
              disabled={updating}
            >
              취소
            </button>
            <button
              className="np__edit-btn np__edit-btn--save"
              onClick={handleSave}
              disabled={!draft.trim() || updating}
            >
              {updating ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="np__body">
            <p className="np__date">{notice.createdAt}</p>
            <p className="np__text">{notice.text}</p>

            {notice.imageUrls && notice.imageUrls.length > 0 && (
              <div className="np__images">
                {notice.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`공지 이미지 ${idx + 1}`}
                    className="np__image"
                  />
                ))}
              </div>
            )}
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
