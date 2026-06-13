'use client'
// src/app/admin/page.tsx
// Private admin dashboard — metrics, guide approvals, feedback, moderation, spend tracking.
// Gated to ADMIN_EMAIL. Reads live from Supabase; degrades gracefully if a table is empty.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const ADMIN_EMAIL = 'mfricks@gmail.com'   // <-- your admin email
const O = { fontFamily: 'Oswald, sans-serif' }
const B = { surface:'var(--surface)', card:'var(--card)', sun:'var(--sun)', sub:'var(--sub)', dust:'var(--dust)', accent:'var(--accent)', border:'var(--border)', go:'#7AE07A', warn:'#E0C06A', bad:'#E07A7A' }

type Tab = 'overview' | 'guides' | 'feedback' | 'reports'

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)

  // metrics
  const [m, setM] = useState<any>({})
  const [pendingGuides, setPendingGuides] = useState<any[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [spend, setSpend] = useState('')
  const [regionBreakdown, setRegionBreakdown] = useState<any[]>([])
  const [sourceBreakdown, setSourceBreakdown] = useState<any[]>([])

  useEffect(() => { init() }, [])
  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) { setAuthed(false); return }
    setAuthed(true)
    await loadAll(user.id)
  }

  // safe count helper — returns 0 if table missing/empty
  async function count(table: string, filters?: (q: any) => any) {
    try {
      let q = supabase.from(table).select('*', { count: 'exact', head: true })
      if (filters) q = filters(q)
      const { count } = await q
      return count ?? 0
    } catch { return 0 }
  }

  async function loadAll(uid: string) {
    setLoading(true)
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString()

    const [
      totalUsers, newUsers, totalGuides, payingGuides, totalListings, activeListings,
      totalBookings, totalTrips, totalCatches, totalPosts,
    ] = await Promise.all([
      count('profiles'),
      count('profiles', q => q.gte('created_at', weekAgo)),
      count('guides'),
      count('guides', q => q.eq('plan', 'pro')),  // approximate "paying"
      count('listings'),
      count('listings', q => q.eq('status', 'active')),
      count('guide_bookings'),
      count('trips'),
      count('catch_log'),
      count('posts'),
    ])

    // revenue + commission from bookings (best-effort)
    let commission = 0, bookingValue = 0
    try {
      const { data: b } = await supabase.from('guide_bookings').select('total, platform_fee, status')
      if (b) { bookingValue = b.reduce((s, x) => s + (x.total ?? 0), 0); commission = b.reduce((s, x) => s + (x.platform_fee ?? 0), 0) }
    } catch {}

    setM({
      totalUsers, newUsers, totalGuides, payingGuides, totalListings, activeListings,
      totalBookings, totalTrips, totalCatches, totalPosts,
      bookingValue, commission,
    })

    // pending guide approvals
    try {
      const { data } = await supabase.from('guides').select('*')
        .or('is_active.eq.false,verification_status.in.(submitted,manual_review,license_issue,identity_pending)')
        .order('created_at', { ascending: false })
      setPendingGuides(data ?? [])
    } catch {}

    // feedback
    try {
      const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(50)
      setFeedback(data ?? [])
    } catch {}

    // reports (moderation)
    try {
      const { data } = await supabase.from('reports').select('*').eq('status', 'open').order('created_at', { ascending: false })
      setReports(data ?? [])
    } catch {}

    // region breakdown
    try {
      const { data } = await supabase.from('profiles').select('home_region')
      if (data) {
        const counts: Record<string, number> = {}
        data.forEach((p: any) => { const r = p.home_region || 'unknown'; counts[r] = (counts[r] || 0) + 1 })
        setRegionBreakdown(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([region, n]) => ({ region, n })))
      }
    } catch {}

    // utm source breakdown (if you store signup_source on profiles)
    try {
      const { data } = await supabase.from('profiles').select('signup_source')
      if (data) {
        const counts: Record<string, number> = {}
        data.forEach((p: any) => { const s = p.signup_source || 'direct'; counts[s] = (counts[s] || 0) + 1 })
        setSourceBreakdown(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([source, n]) => ({ source, n })))
      }
    } catch {}

    setLoading(false)
  }

  async function approveGuide(id: string) {
    await supabase.from('guides').update({ is_active: true, is_verified: true, verification_status: 'verified', verified_at: new Date().toISOString() }).eq('id', id)
    init()
  }
  async function rejectGuide(id: string) {
    await supabase.from('guides').update({ is_active: false, verification_status: 'rejected' }).eq('id', id)
    init()
  }
  async function resolveReport(id: string, status: string) {
    await supabase.from('reports').update({ status }).eq('id', id)
    init()
  }

  if (authed === null) return <div style={{ ...O, color: B.dust, letterSpacing: 2, padding: 40, textAlign: 'center' }}>CHECKING ACCESS...</div>
  if (authed === false) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <div style={{ ...O, fontSize: 18, color: B.sun, letterSpacing: 1 }}>ADMIN ONLY</div>
      <Link href="/" style={{ color: B.accent, fontSize: 13, textDecoration: 'none', marginTop: 12, display: 'inline-block' }}>← Home</Link>
    </div>
  )

  // CAC calc
  const spendNum = parseFloat(spend) || 0
  const newPaying = m.payingGuides || 0
  const costPerGuide = newPaying > 0 && spendNum > 0 ? (spendNum / newPaying) : null
  const guideLTV = 240  // ~$19.99/mo annualized; adjust as you learn real retention
  const ltvCac = costPerGuide ? (guideLTV / costPerGuide) : null

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div style={{ ...O, fontSize: 26, letterSpacing: 1, color: B.sun, margin: '8px 0 4px' }}>ADMIN</div>
      <div style={{ fontSize: 12, color: B.dust, marginBottom: 16 }}>Saltgrass control room</div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {([
          ['overview', 'OVERVIEW'],
          ['guides', `GUIDE APPROVALS (${pendingGuides.length})`],
          ['feedback', `FEEDBACK (${feedback.length})`],
          ['reports', `REPORTS (${reports.length})`],
        ] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', borderRadius: 6, ...O, fontSize: 10, letterSpacing: 1, cursor: 'pointer', border: `2px solid ${tab===t?B.accent:B.border}`, background: tab===t?'rgba(212,152,46,0.12)':'transparent', color: tab===t?B.accent:B.sub }}>{label}</button>
        ))}
      </div>

      {loading ? <div style={{ ...O, color: B.dust, letterSpacing: 2, padding: 40, textAlign: 'center' }}>LOADING...</div> : (
        <>
          {tab === 'overview' && (
            <>
              <Grid>
                <Metric label="USERS" value={m.totalUsers} sub={`+${m.newUsers} this week`} />
                <Metric label="GUIDES" value={m.totalGuides} sub={`${m.payingGuides} on Pro`} />
                <Metric label="LISTINGS" value={m.activeListings} sub={`${m.totalListings} all-time`} />
                <Metric label="BOOKINGS" value={m.totalBookings} sub={`$${((m.bookingValue||0)/100).toFixed(0)} value`} />
                <Metric label="YOUR COMMISSION" value={`$${((m.commission||0)/100).toFixed(0)}`} sub="from bookings" />
                <Metric label="TRIPS" value={m.totalTrips} sub="Crew Up" />
                <Metric label="CATCHES LOGGED" value={m.totalCatches} sub="engagement" />
                <Metric label="BOARD POSTS" value={m.totalPosts} sub="engagement" />
              </Grid>

              {/* CAC tracker */}
              <Panel title="COST PER GUIDE (enter your ad spend)">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input value={spend} onChange={e => setSpend(e.target.value)} placeholder="Total ad spend $" inputMode="decimal" style={{ background: 'var(--silhouette)', border: '1px solid var(--border)', borderRadius: 6, color: B.sun, padding: '10px 12px', fontSize: 14, outline: 'none', width: 160, fontFamily: 'Inter,sans-serif' }} />
                  <div style={{ fontSize: 13, color: B.sub }}>
                    {costPerGuide ? <>≈ <strong style={{ color: B.accent }}>${costPerGuide.toFixed(0)}</strong> per paying guide · LTV:CAC <strong style={{ color: ltvCac && ltvCac >= 3 ? B.go : B.warn }}>{ltvCac?.toFixed(1)}:1</strong></> : 'Enter spend to calculate (needs paying guides)'}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: B.dust, marginTop: 8 }}>Healthy is LTV:CAC ≥ 3:1. Guide LTV assumed ~$240/yr — adjust as you learn real retention.</div>
              </Panel>

              {/* breakdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Panel title="USERS BY REGION">
                  {regionBreakdown.length === 0 ? <Empty /> : regionBreakdown.map(r => (
                    <Row key={r.region} l={r.region} v={r.n} />
                  ))}
                </Panel>
                <Panel title="SIGNUP SOURCE (UTM)">
                  {sourceBreakdown.length === 0 ? <div style={{ fontSize: 11, color: B.dust }}>No source data yet. Add a `signup_source` column to profiles + capture utm_source at signup to populate this.</div> : sourceBreakdown.map(s => (
                    <Row key={s.source} l={s.source} v={s.n} />
                  ))}
                </Panel>
              </div>
            </>
          )}

          {tab === 'guides' && (
            <Panel title={`GUIDES AWAITING APPROVAL (${pendingGuides.length})`}>
              {pendingGuides.length === 0 ? <div style={{ fontSize: 13, color: B.dust }}>No guides pending. 🎣</div> :
                pendingGuides.map(g => (
                  <div key={g.id} style={{ borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...O, fontSize: 15, color: B.sun }}>{g.business_name} <span style={{ fontSize: 11, color: B.dust }}>· {g.name}</span></div>
                        <div style={{ fontSize: 12, color: B.sub, marginTop: 4 }}>{g.category} · {g.region}{g.city?` · ${g.city}`:''} · {g.plan}</div>
                        <div style={{ fontSize: 12, color: B.dust, marginTop: 4 }}>
                          Status: <strong style={{ color: g.verification_status==='identity_pending'?B.go:B.warn }}>{g.verification_status || 'submitted'}</strong>
                          {g.fwc_license_number ? ` · FWC: ${g.fwc_license_number} ${g.fwc_verified?'✓':'⚠'}` : ''}
                          {g.uscg_credential_number ? ` · USCG: ${g.uscg_credential_number} ${g.uscg_verified?'✓':'⚠'}` : ''}
                        </div>
                        {g.bio && <div style={{ fontSize: 12, color: B.sub, marginTop: 6, lineHeight: 1.5 }}>{g.bio.slice(0, 160)}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => approveGuide(g.id)} style={{ ...O, background: 'rgba(122,224,122,0.12)', color: B.go, border: `1px solid ${B.go}44`, borderRadius: 5, padding: '8px 14px', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>APPROVE</button>
                        <button onClick={() => rejectGuide(g.id)} style={{ background: 'transparent', color: B.dust, border: '1px solid var(--border)', borderRadius: 5, padding: '8px 14px', fontSize: 11, cursor: 'pointer' }}>Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
            </Panel>
          )}

          {tab === 'feedback' && (
            <Panel title={`FEEDBACK (${feedback.length})`}>
              {feedback.length === 0 ? <Empty /> :
                feedback.map((fb, i) => (
                  <div key={fb.id || i} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                    <div style={{ fontSize: 14, color: B.sun, lineHeight: 1.5 }}>{fb.message || fb.body || fb.text || JSON.stringify(fb)}</div>
                    <div style={{ fontSize: 11, color: B.dust, marginTop: 4 }}>{fb.created_at ? new Date(fb.created_at).toLocaleString() : ''}{fb.email ? ` · ${fb.email}` : ''}</div>
                  </div>
                ))}
            </Panel>
          )}

          {tab === 'reports' && (
            <Panel title={`OPEN REPORTS (${reports.length})`}>
              {reports.length === 0 ? <div style={{ fontSize: 13, color: B.dust }}>No open reports. Clean house. ✓</div> :
                reports.map(r => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: B.sun }}>{r.item_type} · <span style={{ color: B.bad }}>{r.reason}</span></div>
                      {r.detail && <div style={{ fontSize: 12, color: B.sub, marginTop: 4 }}>{r.detail}</div>}
                      <div style={{ fontSize: 11, color: B.dust, marginTop: 4 }}>item: {r.item_id} · {new Date(r.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => resolveReport(r.id, 'actioned')} style={{ ...O, background: 'rgba(224,122,122,0.12)', color: B.bad, border: `1px solid ${B.bad}44`, borderRadius: 5, padding: '7px 12px', fontSize: 10, letterSpacing: 1, cursor: 'pointer' }}>ACTIONED</button>
                      <button onClick={() => resolveReport(r.id, 'dismissed')} style={{ background: 'transparent', color: B.dust, border: '1px solid var(--border)', borderRadius: 5, padding: '7px 12px', fontSize: 10, cursor: 'pointer' }}>Dismiss</button>
                    </div>
                  </div>
                ))}
            </Panel>
          )}
        </>
      )}
    </div>
  )
}

function Grid({ children }: { children: any }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 14 }}>{children}</div>
}
function Metric({ label, value, sub }: { label: string; value: any; sub?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
      <div style={{ ...O, fontSize: 9, letterSpacing: 2, color: 'var(--dust)' }}>{label}</div>
      <div style={{ ...O, fontSize: 26, color: 'var(--sun)', margin: '4px 0 2px' }}>{value ?? 0}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--dust)' }}>{sub}</div>}
    </div>
  )
}
function Panel({ title, children }: { title: string; children: any }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 18px', marginBottom: 12 }}>
      <div style={{ ...O, fontSize: 11, letterSpacing: 2, color: 'var(--accent)', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}
function Row({ l, v }: { l: string; v: number }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--sub)' }}><span style={{ textTransform: 'capitalize' }}>{l}</span><span style={{ color: 'var(--sun)' }}>{v}</span></div>
}
function Empty() { return <div style={{ fontSize: 12, color: 'var(--dust)' }}>Nothing yet.</div> }
