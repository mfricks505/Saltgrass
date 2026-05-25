'use client'
// src/app/admin/page.tsx
// Admin dashboard — everything you need to manage Saltgrass in one screen
// Protected: only accessible to your email address
// Shows: pending reports, guide verifications, payment failures, flagged content

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'mfricks505@gmail.com'

const B = {
  bg:'#4A5240', surf:'#3D4535', card:'#333B2C',
  sun:'#E8DFC8', sil:'#1A1E14', sub:'#B8B49A',
  dust:'#8A866E', border:'rgba(232,223,200,0.10)',
  accent:'#D4982E', danger:'#C8452A', go:'#7AE07A',
}
const O = { fontFamily:"'Oswald', sans-serif" }

type Tab = 'overview' | 'reports' | 'guides' | 'payments' | 'feedback'

export default function AdminPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [tab,     setTab]     = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [stats,   setStats]   = useState<any>({})
  const [reports, setReports] = useState<any[]>([])
  const [guides,  setGuides]  = useState<any[]>([])
  const [payments,setPayments]= useState<any[]>([])
  const [feedback,setFeedback]= useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      loadAll()
    })
  }, [])

  async function loadAll() {
    setLoading(true)

    const [statsRes, reportsRes, guidesRes, payRes, feedRes] = await Promise.all([
      // Overview stats
      Promise.all([
        supabase.from('profiles').select('*', { count:'exact', head:true }),
        supabase.from('profiles').select('*', { count:'exact', head:true }).eq('phone_verified', true),
        supabase.from('profiles').select('*', { count:'exact', head:true }).eq('id_verified', true),
        supabase.from('guides').select('*', { count:'exact', head:true }).eq('is_verified', true),
        supabase.from('reports').select('*', { count:'exact', head:true }).eq('status', 'pending'),
        supabase.from('guides').select('*', { count:'exact', head:true }).eq('verification_status', 'manual_review'),
        supabase.from('feedback').select('*', { count:'exact', head:true }),
      ]),
      // Pending reports
      supabase.from('reports').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(50),
      // Guides needing manual review
      supabase.from('guides').select('*').in('verification_status', ['manual_review', 'license_issue']).order('created_at', { ascending: false }).limit(50),
      // Payment failures
      supabase.from('payment_events').select('*').eq('event_type', 'payment_failed').order('created_at', { ascending: false }).limit(20),
      // Recent feedback
      supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(100),
    ])

    const [total, l2, l3, verifiedGuides, pendingReports, manualGuides, feedbackCount] = statsRes
    setStats({
      total_users: total.count ?? 0,
      level2_users: l2.count ?? 0,
      level3_users: l3.count ?? 0,
      verified_guides: verifiedGuides.count ?? 0,
      pending_reports: pendingReports.count ?? 0,
      manual_guide_reviews: manualGuides.count ?? 0,
      total_feedback: feedbackCount.count ?? 0,
    })
    setReports(reportsRes.data ?? [])
    setGuides(guidesRes.data ?? [])
    setPayments(payRes.data ?? [])
    setFeedback(feedRes.data ?? [])
    setLoading(false)
  }

  async function dismissReport(id: string) {
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', id)
    setReports(r => r.filter(x => x.id !== id))
  }

  async function actionReport(id: string, targetType: string, targetId: string) {
    // Hide the content
    if (targetType === 'post') await supabase.from('posts').update({ is_hidden: true }).eq('id', targetId)
    if (targetType === 'listing') await supabase.from('listings').update({ is_active: false }).eq('id', targetId)
    // Mark resolved
    await supabase.from('reports').update({ status: 'actioned', auto_actioned: false }).eq('id', id)
    setReports(r => r.filter(x => x.id !== id))
  }

  async function approveGuide(id: string) {
    await supabase.from('guides').update({ is_verified: true, verification_status: 'verified', verified_at: new Date().toISOString() }).eq('id', id)
    setGuides(g => g.filter(x => x.id !== id))
  }

  async function rejectGuide(id: string, reason: string) {
    await supabase.from('guides').update({ verification_status: 'rejected', verification_errors: [reason] }).eq('id', id)
    setGuides(g => g.filter(x => x.id !== id))
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px', color:'var(--sub)' }}>
      <div style={{ ...O, fontSize:14, letterSpacing:3, color:'var(--accent)' }}>LOADING ADMIN...</div>
    </div>
  )

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id:'overview',  label:'OVERVIEW' },
    { id:'reports',   label:'REPORTS',  badge: reports.length },
    { id:'guides',    label:'GUIDES',   badge: guides.length },
    { id:'payments',  label:'PAYMENTS', badge: payments.length },
    { id:'feedback',  label:'FEEDBACK', badge: feedback.length },
  ]

  return (
    <div style={{ maxWidth:1000, margin:'0 auto' }}>

      <div style={{ marginBottom:20 }}>
        <div style={{ ...O, fontSize:10, letterSpacing:4, color:B.accent, marginBottom:4 }}>SALTGRASS</div>
        <h1 style={{ ...O, fontSize:28, color:B.sun, margin:'0 0 4px' }}>ADMIN DASHBOARD</h1>
        <div style={{ fontSize:12, color:B.dust }}>Private — {ADMIN_EMAIL}</div>
      </div>

      {/* Tab nav */}
      <div style={{ display:'flex', gap:6, marginBottom:16, borderBottom:`1px solid ${B.border}`, paddingBottom:0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...O, fontSize:11, letterSpacing:2, padding:'9px 16px', background:'transparent', border:'none', borderBottom: tab===t.id ? `3px solid ${B.accent}` : '3px solid transparent', color: tab===t.id ? B.accent : B.dust, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            {t.label}
            {t.badge && t.badge > 0 ? <span style={{ background:B.danger, color:'#fff', borderRadius:'50%', width:18, height:18, fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{t.badge > 9?'9+':t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==='overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
            {[
              { label:'TOTAL USERS',       val:stats.total_users,         note:'all signups' },
              { label:'PHONE VERIFIED',     val:stats.level2_users,        note:'Level 2' },
              { label:'ID VERIFIED',        val:stats.level3_users,        note:'Level 3 — paying' },
              { label:'ACTIVE GUIDES',      val:stats.verified_guides,     note:'verified' },
              { label:'PENDING REPORTS',    val:stats.pending_reports,     note:'need action', alert:stats.pending_reports>0 },
              { label:'GUIDE REVIEWS',      val:stats.manual_guide_reviews,note:'manual needed', alert:stats.manual_guide_reviews>0 },
              { label:'FEEDBACK ITEMS',     val:stats.total_feedback,      note:'unread' },
              { label:'CONVERSION RATE',    val: stats.total_users > 0 ? Math.round((stats.level3_users/stats.total_users)*100)+'%' : '0%', note:'L1→L3' },
            ].map(s => (
              <div key={s.label} style={{ background:B.card, borderRadius:6, padding:'14px 16px', border:`1px solid ${s.alert ? B.danger+'66' : B.border}` }}>
                <div style={{ ...O, fontSize:9, letterSpacing:3, color:s.alert?B.danger:B.dust, marginBottom:6 }}>{s.label}</div>
                <div style={{ ...O, fontSize:28, color:s.alert?B.danger:B.accent, lineHeight:1, marginBottom:3 }}>{s.val}</div>
                <div style={{ fontSize:10, color:B.dust }}>{s.note}</div>
              </div>
            ))}
          </div>

          <div style={{ background:B.card, borderRadius:6, padding:'14px 16px', border:`1px solid ${B.border}` }}>
            <div style={{ ...O, fontSize:9, letterSpacing:3, color:B.accent, marginBottom:10 }}>QUICK ACTIONS</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setTab('reports')} style={{ ...O, fontSize:10, letterSpacing:2, background:reports.length>0?B.danger:B.surf, color:B.sun, border:'none', borderRadius:4, padding:'9px 16px', cursor:'pointer' }}>
                {reports.length} PENDING REPORTS
              </button>
              <button onClick={() => setTab('guides')} style={{ ...O, fontSize:10, letterSpacing:2, background:guides.length>0?B.accent:B.surf, color:B.sil, border:'none', borderRadius:4, padding:'9px 16px', cursor:'pointer' }}>
                {guides.length} GUIDE REVIEWS
              </button>
              <button onClick={() => loadAll()} style={{ ...O, fontSize:10, letterSpacing:2, background:B.surf, color:B.sun, border:`1px solid ${B.border}`, borderRadius:4, padding:'9px 16px', cursor:'pointer' }}>
                ↺ REFRESH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS */}
      {tab==='reports' && (
        <div>
          {reports.length === 0 ? (
            <div style={{ background:B.card, borderRadius:6, padding:'40px', textAlign:'center', border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
              <div style={{ ...O, fontSize:14, letterSpacing:2, color:B.sun }}>NO PENDING REPORTS</div>
            </div>
          ) : reports.map(r => (
            <div key={r.id} style={{ background:B.card, borderRadius:6, border:`1px solid ${B.border}`, padding:'14px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <span style={{ ...O, fontSize:10, letterSpacing:2, color:B.danger, marginRight:10 }}>{r.target_type.toUpperCase()}</span>
                  <span style={{ ...O, fontSize:10, letterSpacing:1, color:B.accent }}>{r.reason.toUpperCase()}</span>
                </div>
                <div style={{ fontSize:10, color:B.dust }}>{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              {r.detail && <div style={{ fontSize:12, color:B.sub, lineHeight:1.6, marginBottom:10 }}>"{r.detail}"</div>}
              <div style={{ fontSize:11, color:B.dust, marginBottom:10 }}>Target ID: {r.target_id}</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => actionReport(r.id, r.target_type, r.target_id)} style={{ ...O, fontSize:10, letterSpacing:1, background:B.danger, color:'#fff', border:'none', borderRadius:4, padding:'7px 14px', cursor:'pointer' }}>
                  REMOVE CONTENT
                </button>
                <button onClick={() => dismissReport(r.id)} style={{ ...O, fontSize:10, letterSpacing:1, background:B.surf, color:B.sub, border:`1px solid ${B.border}`, borderRadius:4, padding:'7px 14px', cursor:'pointer' }}>
                  DISMISS
                </button>
                <a href={`/post/${r.target_id}`} target="_blank" rel="noopener noreferrer" style={{ ...O, fontSize:10, letterSpacing:1, color:B.accent, border:`1px solid ${B.accent}44`, borderRadius:4, padding:'7px 14px', textDecoration:'none' }}>
                  VIEW →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GUIDES */}
      {tab==='guides' && (
        <div>
          {guides.length === 0 ? (
            <div style={{ background:B.card, borderRadius:6, padding:'40px', textAlign:'center', border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
              <div style={{ ...O, fontSize:14, letterSpacing:2, color:B.sun }}>NO GUIDES PENDING REVIEW</div>
            </div>
          ) : guides.map(g => (
            <div key={g.id} style={{ background:B.card, borderRadius:6, border:`1px solid ${B.border}`, padding:'16px 18px', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <div style={{ ...O, fontSize:14, color:B.sun, marginBottom:3 }}>{g.business_name}</div>
                  <div style={{ fontSize:11, color:B.dust }}>{g.name} · {g.email} · {g.city}</div>
                </div>
                <span style={{ ...O, fontSize:9, letterSpacing:2, color:B.danger, background:`${B.danger}22`, borderRadius:3, padding:'2px 8px' }}>
                  {g.verification_status?.replace('_',' ').toUpperCase()}
                </span>
              </div>
              {g.fwc_license_number && (
                <div style={{ background:B.surf, borderRadius:4, padding:'8px 12px', marginBottom:8, fontSize:11, color:B.sub }}>
                  FWC License: <strong style={{ color:g.fwc_license_valid?B.go:'#E07A7A' }}>{g.fwc_license_number}</strong>
                  {g.fwc_license_valid ? ' ✓ Valid' : ' ✗ Could not verify'}
                  {g.fwc_license_expires && ` · Expires ${g.fwc_license_expires}`}
                </div>
              )}
              {g.uscg_license_number && (
                <div style={{ background:B.surf, borderRadius:4, padding:'8px 12px', marginBottom:8, fontSize:11, color:B.sub }}>
                  USCG Credential: <strong style={{ color:g.uscg_license_valid?B.go:'#E07A7A' }}>{g.uscg_license_number}</strong>
                  {g.uscg_license_valid ? ' ✓ Valid' : ' ✗ Could not verify'}
                  {g.uscg_license_type && ` · ${g.uscg_license_type}`}
                </div>
              )}
              {g.verification_errors?.length > 0 && (
                <div style={{ background:'rgba(200,69,42,0.1)', border:`1px solid ${B.danger}44`, borderRadius:4, padding:'8px 12px', marginBottom:8, fontSize:11, color:'#E07A7A' }}>
                  {g.verification_errors.join(' · ')}
                </div>
              )}
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => approveGuide(g.id)} style={{ ...O, fontSize:10, letterSpacing:1, background:'rgba(61,122,61,0.3)', color:B.go, border:`1px solid rgba(122,224,122,0.3)`, borderRadius:4, padding:'8px 16px', cursor:'pointer' }}>
                  ✓ APPROVE & VERIFY
                </button>
                <button onClick={() => rejectGuide(g.id, 'License could not be verified after manual review')} style={{ ...O, fontSize:10, letterSpacing:1, background:'rgba(200,69,42,0.2)', color:'#E07A7A', border:`1px solid ${B.danger}44`, borderRadius:4, padding:'8px 16px', cursor:'pointer' }}>
                  ✗ REJECT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAYMENTS */}
      {tab==='payments' && (
        <div>
          {payments.length === 0 ? (
            <div style={{ background:B.card, borderRadius:6, padding:'40px', textAlign:'center', border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
              <div style={{ ...O, fontSize:14, letterSpacing:2, color:B.sun }}>NO PAYMENT FAILURES</div>
            </div>
          ) : payments.map(p => (
            <div key={p.id} style={{ background:B.card, borderRadius:6, border:`1px solid ${B.danger}44`, padding:'14px 16px', marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div style={{ ...O, fontSize:10, letterSpacing:2, color:B.danger }}>{p.event_type.replace('_',' ').toUpperCase()}</div>
                <div style={{ fontSize:10, color:B.dust }}>{new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ fontSize:12, color:B.sub, marginTop:6 }}>
                Amount: ${((p.amount ?? 0)/100).toFixed(2)} · User: {p.user_id?.slice(0,8)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FEEDBACK */}
      {tab==='feedback' && (
        <div>
          {/* Group by type */}
          {['bug','idea','love','other'].map(type => {
            const items = feedback.filter(f => f.type === type)
            if (items.length === 0) return null
            const icons: Record<string,string> = { bug:'🐛', idea:'💡', love:'❤️', other:'💬' }
            return (
              <div key={type} style={{ marginBottom:16 }}>
                <div style={{ ...O, fontSize:10, letterSpacing:3, color:B.accent, marginBottom:8 }}>
                  {icons[type]} {type.toUpperCase()} ({items.length})
                </div>
                {items.map(f => (
                  <div key={f.id} style={{ background:B.card, borderRadius:6, border:`1px solid ${B.border}`, padding:'12px 14px', marginBottom:6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:10, color:B.dust }}>Page: {f.page}</span>
                      <span style={{ fontSize:10, color:B.dust }}>{new Date(f.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize:13, color:B.sub, lineHeight:1.7 }}>{f.message}</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
