'use client'
// src/components/FeedbackWidget.tsx — v2

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { usePathname } from 'next/navigation'

const O = { fontFamily: "'Oswald', sans-serif" }
const B = {
  card: '#333B2C', surf: '#3D4535', sun: '#E8DFC8',
  sil: '#1A1E14', sub: '#B8B49A', dust: '#8A866E',
  border: 'rgba(232,223,200,0.10)', accent: '#D4982E',
}

const TYPES = [
  { id: 'bug',   label: 'Bug',    placeholder: "What broke? Where were you when it happened?" },
  { id: 'idea',  label: 'Idea',   placeholder: "What feature or improvement would help?" },
  { id: 'love',  label: 'Love',   placeholder: "What do you love about Saltgrass?" },
  { id: 'other', label: 'Other',  placeholder: "What's on your mind..." },
]

export default function FeedbackWidget() {
  const pathname = usePathname()
  const supabase = createClient()
  const [open,    setOpen]    = useState(false)
  const [type,    setType]    = useState('idea')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [userId,  setUserId]  = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const currentType = TYPES.find(t => t.id === type) ?? TYPES[1]

  async function submit() {
    if (!message.trim()) return
    setSending(true)
    await supabase.from('feedback').insert({
      type,
      message: message.trim(),
      page: pathname,
      user_id: userId,
    })
    setSending(false)
    setSent(true)
    setMessage('')
    setTimeout(() => { setSent(false); setOpen(false) }, 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 80, right: 16, zIndex: 500,
          background: B.accent, color: B.sil, border: 'none',
          borderRadius: 4, padding: '8px 14px',
          ...O, fontSize: 11, letterSpacing: 2, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        FEEDBACK
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 124, right: 16, zIndex: 500,
          background: B.card, border: `1px solid ${B.border}`,
          borderRadius: 8, padding: 18, width: 290,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>+</div>
              <div style={{ ...O, fontSize: 13, letterSpacing: 2, color: B.sun }}>THANKS!</div>
              <div style={{ fontSize: 12, color: B.sub, marginTop: 4 }}>We read every one.</div>
            </div>
          ) : (
            <>
              <div style={{ ...O, fontSize: 12, letterSpacing: 2, color: B.sun, marginBottom: 12 }}>SEND FEEDBACK</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 12 }}>
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} style={{
                    padding: '7px 8px', borderRadius: 4, cursor: 'pointer',
                    border: `1.5px solid ${type === t.id ? B.accent : B.border}`,
                    background: type === t.id ? 'rgba(212,152,46,0.12)' : 'transparent',
                    color: type === t.id ? B.accent : B.sub,
                    fontFamily: 'Inter, sans-serif', fontSize: 11,
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder={currentType.placeholder}
                style={{
                  background: B.surf, border: `1.5px solid ${B.border}`,
                  borderRadius: 4, color: B.sun, fontSize: 13,
                  padding: '9px 11px', width: '100%', outline: 'none',
                  resize: 'none', boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
                  marginBottom: 10,
                }}
              />

              <button onClick={submit} disabled={sending || !message.trim()} style={{
                width: '100%', background: message.trim() ? B.accent : B.border,
                color: message.trim() ? B.sil : B.dust,
                border: 'none', borderRadius: 4, padding: '10px',
                ...O, fontSize: 12, letterSpacing: 2,
                cursor: message.trim() ? 'pointer' : 'not-allowed',
              }}>
                {sending ? 'SENDING...' : 'SEND'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
