'use client'
// src/app/messages/page.tsx
// DM inbox + thread. Handles ?to=<userId>&listing=<id>&label=<text> to start/open
// a conversation from "Message Seller" (Market) or guide/trip contacts.

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

function MessagesInner() {
  const supabase = createClient()
  const params = useSearchParams()
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [convos, setConvos] = useState<any[]>([])
  const [active, setActive] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  const toUser = params.get('to')
  const ctxListing = params.get('listing')
  const ctxTrip = params.get('trip')
  const ctxGuide = params.get('guide')
  const ctxLabel = params.get('label')

  useEffect(()=>{ init() },[])
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) },[messages])

  async function init() {
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setMe(user)
    await loadConvos(user.id)
    // If we arrived with ?to=, open/create that conversation
    if (toUser && toUser !== user.id) {
      await openOrCreate(user.id, toUser)
    }
    setLoading(false)
  }

  async function loadConvos(uid:string) {
    const { data } = await supabase.from('conversations').select('*')
      .or(`user_a.eq.${uid},user_b.eq.${uid}`).order('last_at',{ascending:false})
    setConvos(data ?? [])
    return data ?? []
  }

  async function openOrCreate(myId:string, otherId:string) {
    const ctxType = ctxListing ? 'listing' : ctxTrip ? 'trip' : ctxGuide ? 'guide' : null
    const ctxId = ctxListing || ctxTrip || ctxGuide || null
    // look for existing
    const { data:existing } = await supabase.from('conversations').select('*')
      .or(`and(user_a.eq.${myId},user_b.eq.${otherId}),and(user_a.eq.${otherId},user_b.eq.${myId})`)
      .limit(1)
    let convo = existing?.[0]
    if (!convo) {
      const { data:created } = await supabase.from('conversations').insert({
        user_a: myId, user_b: otherId,
        context_type: ctxType, context_id: ctxId, context_label: ctxLabel || null,
      }).select().single()
      convo = created
      await loadConvos(myId)
    }
    if (convo) openConvo(convo)
  }

  async function openConvo(convo:any) {
    setActive(convo)
    const { data } = await supabase.from('messages').select('*').eq('conversation_id',convo.id).order('created_at',{ascending:true})
    setMessages(data ?? [])
  }

  async function send() {
    if (!draft.trim() || !active) return
    const body = draft.trim(); setDraft('')
    const { data } = await supabase.from('messages').insert({
      conversation_id: active.id, sender_id: me.id, body,
    }).select().single()
    if (data) setMessages(m=>[...m, data])
    loadConvos(me.id)
  }

  if (loading) return <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING...</div>

  return (
    <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'260px 1fr', gap:10, height:'calc(100vh - 120px)' }}>
      {/* Conversation list */}
      <div style={{ background:B.forest, borderRadius:8, border:'1px solid #243824', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 14px', borderBottom:'1px solid #243824', ...O, fontSize:12, letterSpacing:2, color:B.bone }}>MESSAGES</div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {convos.length===0 ? <div style={{ padding:20, fontSize:12, color:B.dust, textAlign:'center' }}>No conversations yet.</div> :
            convos.map(c=>(
              <button key={c.id} onClick={()=>openConvo(c)} style={{ width:'100%', textAlign:'left', background:active?.id===c.id?B.moss:'transparent', border:'none', borderBottom:'1px solid #1C2E1C', padding:'12px 14px', cursor:'pointer' }}>
                <div style={{ fontSize:13, color:B.bone, fontWeight:600 }}>{c.context_label || 'Conversation'}</div>
                <div style={{ fontSize:11, color:B.dust, marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.last_message || 'Start the conversation'}</div>
              </button>
            ))}
        </div>
      </div>

      {/* Thread */}
      <div style={{ background:B.forest, borderRadius:8, border:'1px solid #243824', display:'flex', flexDirection:'column' }}>
        {!active ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:B.dust, fontSize:13 }}>Select a conversation</div>
        ) : (
          <>
            {active.context_label && (
              <div style={{ padding:'10px 16px', borderBottom:'1px solid #243824', fontSize:12, color:B.copper }}>
                Re: {active.context_label}
              </div>
            )}
            <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
              {messages.map(m=>{
                const mine = m.sender_id === me.id
                return (
                  <div key={m.id} style={{ alignSelf:mine?'flex-end':'flex-start', maxWidth:'72%', background:mine?B.copper:B.moss, color:mine?B.midnight:B.bone, borderRadius:10, padding:'8px 12px', fontSize:14, lineHeight:1.5 }}>
                    {m.body}
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
            <div style={{ padding:'12px 14px', borderTop:'1px solid #243824', display:'flex', gap:8 }}>
              <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send() }} placeholder="Type a message..." style={{ flex:1, background:B.midnight, border:'1px solid rgba(255,255,255,0.15)', borderRadius:20, color:B.bone, padding:'10px 16px', fontSize:14, outline:'none', fontFamily:'Inter,sans-serif' }} />
              <button onClick={send} style={{ background:B.copper, color:B.midnight, border:'none', borderRadius:20, padding:'10px 18px', ...O, fontSize:12, letterSpacing:1, cursor:'pointer' }}>SEND</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return <Suspense fallback={<div style={{ padding:40, textAlign:'center', color:B.dust }}>Loading...</div>}><MessagesInner /></Suspense>
}
