'use client'
// src/app/today/page.tsx
// "Today at a Glance" — every saved route with a colored dot.
// This is the landing page when a user taps the 5am push notification.

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const B = {
  midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', copper:'#C8922A',
  bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358',
  go:'#1A3A1A', caution:'#2A2210', nogo:'#2A1010',
  goText:'#7AE07A', cautionText:'#E0C06A', nogoText:'#E07A7A',
  goBorder:'#3D7A3D', cautionBorder:'#8A6A1A', nogoBorder:'#8A1A1A',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }
const V = {
  'GO':      { dot:'🟢', bg:B.go,      border:B.goBorder,      text:B.goText },
  'CAUTION': { dot:'🟡', bg:B.caution, border:B.cautionBorder, text:B.cautionText },
  'NO-GO':   { dot:'🔴', bg:B.nogo,    border:B.nogoBorder,    text:B.nogoText },
}

export default function TodayPage() {
  const supabase = createClient()
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 11 ? 'Good morning' : h < 17 ? 'Afternoon' : 'Evening')
    loadRoutes()
  }, [])

  async function loadRoutes() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Saved routes + today's cached verdict
    const today = new Date().toISOString().slice(0,10)
    const { data: saved } = await supabase
      .from('saved_routes')
      .select('*, route_verdicts(*)')
      .eq('user_id', user.id)

    const withVerdicts = (saved ?? []).map((r: any) => {
      const todayVerdict = (r.route_verdicts ?? []).find((v: any) => v.computed_for === today)
      return { ...r, todayVerdict }
    })
    // Sort: GO first, then CAUTION, then NO-GO
    const order: any = { 'GO':1, 'CAUTION':2, 'NO-GO':3 }
    withVerdicts.sort((a: any, b: any) =>
      (order[a.todayVerdict?.verdict] ?? 4) - (order[b.todayVerdict?.verdict] ?? 4))

    setRoutes(withVerdicts)
    setLoading(false)
  }

  const goCount = routes.filter(r => r.todayVerdict?.verdict === 'GO').length

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ padding:'8px 4px 16px' }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.copper }}>{greeting.toUpperCase()}</div>
        <div style={{ ...O, fontSize:28, color:B.bone, letterSpacing:1, lineHeight:1.1, marginTop:2 }}>
          TODAY ON THE WATER
        </div>
        {!loading && routes.length > 0 && (
          <div style={{ fontSize:13, color:B.parchment, marginTop:6 }}>
            {goCount > 0
              ? `${goCount} of your ${routes.length} ${routes.length===1?'run':'runs'} ${goCount===1?'is':'are'} a GO today.`
              : 'Tough conditions across your runs today — check the details.'}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ background:B.forest, borderRadius:8, padding:40, textAlign:'center', color:B.dust, ...O, letterSpacing:2 }}>
          LOADING YOUR RUNS...
        </div>
      ) : routes.length === 0 ? (
        <div style={{ background:B.forest, borderRadius:8, padding:'28px 22px', textAlign:'center', border:`1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ fontSize:34, marginBottom:10 }}>📍</div>
          <div style={{ ...O, fontSize:16, color:B.bone, letterSpacing:1, marginBottom:8 }}>NO SAVED RUNS YET</div>
          <div style={{ fontSize:13, color:B.parchment, lineHeight:1.7, marginBottom:16 }}>
            Plan a route in The Rundown and save it. We'll check it every morning and ping you when it's a GO.
          </div>
          <Link href="/analyzer" style={{ display:'inline-block', background:B.copper, color:'#1A1208', borderRadius:6, padding:'12px 22px', ...O, fontSize:12, letterSpacing:2, textDecoration:'none' }}>
            PLAN A RUN →
          </Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {routes.map(r => {
            const v = r.todayVerdict ? V[r.todayVerdict.verdict as keyof typeof V] : null
            return (
              <Link key={r.id} href={`/analyzer?route=${r.id}`} style={{ textDecoration:'none' }}>
                <div style={{ background:v?.bg ?? B.forest, borderRadius:8, padding:'16px 18px', border:`1px solid ${v?.border ?? 'rgba(255,255,255,0.05)'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ ...O, fontSize:17, color:B.bone, letterSpacing:1 }}>{r.name.toUpperCase()}</div>
                      <div style={{ fontSize:12, color:B.parchment, marginTop:4 }}>
                        {r.todayVerdict?.summary ?? 'Tap to check conditions'}
                      </div>
                      {r.todayVerdict?.best_window && (
                        <div style={{ fontSize:11, color:B.copper, marginTop:3 }}>
                          Best window: {r.todayVerdict.best_window}
                          {r.todayVerdict.turns_bad_at && ` · back by ${r.todayVerdict.turns_bad_at}`}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:30, lineHeight:1 }}>{v?.dot ?? '⚪'}</div>
                      {v && <div style={{ ...O, fontSize:11, letterSpacing:1, color:v.text, marginTop:2 }}>{r.todayVerdict.verdict}</div>}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          <Link href="/analyzer" style={{ textDecoration:'none' }}>
            <div style={{ border:`1px dashed rgba(255,255,255,0.15)`, borderRadius:8, padding:'14px', textAlign:'center', color:B.dust, ...O, fontSize:12, letterSpacing:2 }}>
              + PLAN ANOTHER RUN
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
