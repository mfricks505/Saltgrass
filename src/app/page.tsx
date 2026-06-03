'use client'
// src/app/page.tsx — The Board (v2)
// - Logged-in users land straight in the feed (marketing hero hidden)
// - Post-type filter bar + type badges
// - Recipe posts render with ingredients/steps
// - Conditions tags show on reports

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { REGIONS, type PostWithProfile } from '@/lib/types'
import { POST_TYPES, getPostType } from '@/lib/post-types'
import PostCard from '@/components/Postcard'
import Link from 'next/link'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

export default function HomePage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [regionFilter, setRegionFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [user, setUser] = useState<any>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setCheckedAuth(true)
    })
  }, [])
  useEffect(() => { loadPosts() }, [regionFilter, typeFilter])

  async function loadPosts() {
    setLoading(true)
    let query = supabase.from('posts_with_profiles').select('*').order('created_at', { ascending: false }).limit(40)
    if (regionFilter !== 'all') query = query.eq('region_id', regionFilter)
    const { data, error } = await query
    let rows = (!error && data) ? data as any[] : []
    if (typeFilter !== 'all') rows = rows.filter(p => (p.post_type ?? 'report') === typeFilter)
    setPosts(rows)
    setLoading(false)
  }

  return (
    <div>
      {/* Marketing hero — ONLY for logged-out visitors */}
      {checkedAuth && !user && (
        <>
          <div style={{ background:'linear-gradient(160deg, #0F1A0F, #141F14)', border:'1px solid #243824', borderRadius:8, padding:'52px 44px 48px', marginBottom:10, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:-60, top:-60, width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle, rgba(200,146,42,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'relative', maxWidth:640 }}>
              <div style={{ ...O, fontSize:11, letterSpacing:4, color:B.copper, marginBottom:14 }}>BUILT FOR FLORIDA OUTDOORSMEN</div>
              <h1 style={{ ...O, fontSize:50, lineHeight:1.0, letterSpacing:1, color:B.bone, margin:'0 0 20px', textTransform:'uppercase' }}>
                THE PEOPLE YOU TRUST.<br />THE GEAR YOU NEED.<br /><span style={{ color:B.copper }}>THE SPOTS YOU'VE EARNED.</span>
              </h1>
              <p style={{ fontSize:16, lineHeight:1.8, color:B.parchment, margin:'0 0 10px', maxWidth:560 }}>
                Real names. Real reviews. Real reports. No algorithms, no bots, no political garbage.
              </p>
              <p style={{ fontSize:14, lineHeight:1.7, color:B.dust, margin:'0 0 32px', maxWidth:540 }}>
                Florida hunters, anglers, and boaters — sharing intel, finding vetted guides, buying gear from people they trust, and sharing the ride out.
              </p>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <Link href="/auth/signup" style={{ background:B.copper, color:'#0A0C08', padding:'13px 30px', borderRadius:4, ...O, fontSize:14, letterSpacing:2, textDecoration:'none' }}>JOIN FREE</Link>
                <Link href="/auth/login" style={{ background:'transparent', color:B.parchment, padding:'13px 22px', borderRadius:4, border:'2px solid #243824', ...O, fontSize:13, letterSpacing:2, textDecoration:'none' }}>LOG IN</Link>
              </div>
            </div>
          </div>

          {/* 5 pillars — logged out only */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8, marginBottom:10 }}>
            {[
              { href:'/',        icon:'📋', title:'THE BOARD',   desc:'Reports, intel, and forum posts from guys who were actually out this morning.' },
              { href:'/wall',    icon:'🏆', title:'THE WALL',    desc:'Trophies, big catches, and personal bests. Instagram for outdoorsmen.' },
              { href:'/market',  icon:'🏕️', title:'THE MARKET',  desc:'Buy and sell gear locally. Real accounts. No scammers. No lowballers.' },
              { href:'/guides',  icon:'🔭', title:'GUIDES',      desc:'Verified guides and outfitters. Reviews from members who actually booked them.' },
              { href:'/crewup',  icon:'⛵', title:'CREW UP',     desc:'Empty seat in the boat? Split fuel costs with a verified member going your way.' },
            ].map(p => (
              <Link key={p.title} href={p.href} style={{ textDecoration:'none' }}>
                <div style={{ background:B.forest, border:'1px solid #243824', borderRadius:8, padding:'20px 16px', height:'100%', cursor:'pointer' }}>
                  <div style={{ fontSize:26, marginBottom:10 }}>{p.icon}</div>
                  <div style={{ ...O, fontSize:12, letterSpacing:2, color:B.copper, marginBottom:8 }}>{p.title}</div>
                  <div style={{ fontSize:12, color:B.parchment, lineHeight:1.7 }}>{p.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Trust bar */}
          <div style={{ background:B.forest, border:'1px solid #243824', borderRadius:8, padding:'16px 20px', marginBottom:10, display:'flex', alignItems:'center' }}>
            {[
              { val:'ZERO', label:'Anonymous Accounts' }, { val:'ZERO', label:'Paid Ads' },
              { val:'ZERO', label:'Political Posts' }, { val:'ZERO', label:'AI Bots' },
              { val:'100%', label:'Real People' }, { val:'100%', label:'Verified Vendors' },
              { val:'FREE', label:'Always' },
            ].map((s, i) => (
              <div key={s.label} style={{ flex:1, textAlign:'center', borderRight:i<6 ? '1px solid #243824' : 'none', padding:'0 8px' }}>
                <div style={{ ...O, fontSize:16, color:B.copper, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:9, color:B.dust, textTransform:'uppercase', letterSpacing:1, marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Logged-in greeting bar — straight to the feed */}
      {checkedAuth && user && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, padding:'4px 2px' }}>
          <div>
            <div style={{ ...O, fontSize:22, letterSpacing:1, color:B.bone }}>THE BOARD</div>
            <div style={{ fontSize:12, color:B.dust, marginTop:2 }}>Latest intel from Florida</div>
          </div>
          <Link href="/post/new" style={{ background:B.copper, color:'#0A0C08', padding:'11px 20px', borderRadius:6, ...O, fontSize:12, letterSpacing:2, textDecoration:'none' }}>+ POST</Link>
        </div>
      )}

      {/* Rundown strip — always */}
      <Link href="/analyzer" style={{ textDecoration:'none', display:'block', marginBottom:10 }}>
        <div style={{ background:B.forest, border:'1px solid #243824', borderLeft:`4px solid ${B.copper}`, borderRadius:8, padding:'14px 20px', display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:24 }}>🌤️</span>
          <div style={{ flex:1 }}>
            <div style={{ ...O, fontSize:12, letterSpacing:2, color:B.bone }}>THE RUNDOWN — CONDITIONS & TOOLS</div>
            <div style={{ fontSize:11, color:B.dust, marginTop:2 }}>Wind, tide, weather — check before you load the truck</div>
          </div>
          <div style={{ ...O, fontSize:11, letterSpacing:2, color:B.copper }}>CHECK NOW →</div>
        </div>
      </Link>

      {/* Feed + Sidebar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:10, alignItems:'start' }}>
        <div>
          {/* Type filter bar */}
          <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:8 }}>
            <button onClick={() => setTypeFilter('all')} style={{ flexShrink:0, padding:'6px 14px', borderRadius:4, ...O, fontSize:9, letterSpacing:2, cursor:'pointer', border:`2px solid ${typeFilter==='all' ? B.copper : '#243824'}`, background:typeFilter==='all' ? B.copper : 'transparent', color:typeFilter==='all' ? '#0A0C08' : B.parchment }}>
              ALL
            </button>
            {POST_TYPES.map(t => (
              <button key={t.id} onClick={() => setTypeFilter(t.id)} style={{ flexShrink:0, padding:'6px 12px', borderRadius:4, ...O, fontSize:9, letterSpacing:1, cursor:'pointer', border:`2px solid ${typeFilter===t.id ? t.color : '#243824'}`, background:typeFilter===t.id ? `${t.color}22` : 'transparent', color:typeFilter===t.id ? t.color : B.parchment, display:'flex', alignItems:'center', gap:5 }}>
                <span>{t.icon}</span><span>{t.label.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Region filter */}
          <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:10 }}>
            <button onClick={() => setRegionFilter('all')} style={{ flexShrink:0, padding:'6px 14px', borderRadius:4, ...O, fontSize:9, letterSpacing:2, cursor:'pointer', border:`2px solid ${regionFilter==='all' ? B.copper : '#243824'}`, background:regionFilter==='all' ? 'rgba(200,146,42,0.15)' : 'transparent', color:regionFilter==='all' ? B.copper : B.parchment }}>
              ALL FLORIDA
            </button>
            {REGIONS.map(r => (
              <button key={r.id} onClick={() => setRegionFilter(r.id)} style={{ flexShrink:0, padding:'6px 12px', borderRadius:4, ...O, fontSize:9, letterSpacing:1, cursor:'pointer', border:`2px solid ${regionFilter===r.id ? B.copper : '#243824'}`, background:regionFilter===r.id ? 'rgba(200,146,42,0.15)' : 'transparent', color:regionFilter===r.id ? B.copper : B.parchment, display:'flex', alignItems:'center', gap:5 }}>
                <span>{r.icon}</span><span>{r.label.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:240, borderRadius:8, marginBottom:10 }} />) :
           posts.length === 0 ? (
            <div style={{ background:B.forest, borderRadius:8, padding:48, textAlign:'center', border:'1px solid #243824' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>🎣</div>
              <div style={{ ...O, fontSize:16, letterSpacing:2, color:B.bone, marginBottom:8 }}>NO POSTS YET</div>
              <div style={{ color:B.dust, fontSize:13, marginBottom:20 }}>Be the first to post {typeFilter !== 'all' ? `a ${getPostType(typeFilter).label.toLowerCase()}` : 'a report'}.</div>
              <Link href={user ? '/post/new' : '/auth/signup'} style={{ background:B.copper, color:'#0A0C08', padding:'11px 22px', borderRadius:4, ...O, fontSize:12, letterSpacing:2, textDecoration:'none' }}>
                {user ? 'POST NOW' : 'JOIN & POST'}
              </Link>
            </div>
          ) : posts.map(post => (
            <BoardPost key={post.id} post={post} onUpdate={loadPosts} />
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ position:'sticky', top:72, display:'flex', flexDirection:'column', gap:10 }}>
          {!user && checkedAuth && (
            <div style={{ background:B.forest, borderRadius:8, padding:18, border:'1px solid #243824' }}>
              <div style={{ ...O, fontSize:13, letterSpacing:2, color:B.bone, marginBottom:8 }}>JOIN THE COMMUNITY</div>
              <p style={{ fontSize:12, color:B.parchment, lineHeight:1.7, margin:'0 0 14px' }}>Free. No ads. No subscription. Saltgrass makes money when vendors list and gear sells — not from you.</p>
              <Link href="/auth/signup" style={{ display:'block', textAlign:'center', background:B.copper, color:'#0A0C08', padding:'11px', borderRadius:4, ...O, fontSize:12, letterSpacing:2, textDecoration:'none' }}>JOIN FREE</Link>
            </div>
          )}
          <div style={{ background:B.forest, borderRadius:8, overflow:'hidden', border:'1px solid #243824' }}>
            <div style={{ padding:'10px 14px', borderBottom:'1px solid #243824' }}>
              <div style={{ ...O, fontSize:10, letterSpacing:3, color:B.copper }}>FLORIDA REGIONS</div>
            </div>
            {REGIONS.map((r, i) => (
              <Link key={r.id} href={`/regions/${r.id}`} style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10, textDecoration:'none', borderBottom:i<REGIONS.length-1 ? '1px solid #1C2E1C' : 'none' }}>
                <span style={{ fontSize:15 }}>{r.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ ...O, fontSize:10, letterSpacing:1, color:B.bone }}>{r.label.toUpperCase()}</div>
                  <div style={{ fontSize:9, color:B.dust, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.sub}</div>
                </div>
                <span style={{ color:'#243824' }}>›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Wraps PostCard with a type badge, conditions tag, and recipe rendering
function BoardPost({ post, onUpdate }: { post: any; onUpdate: () => void }) {
  const pt = getPostType(post.post_type ?? 'report')
  const conditions = post.conditions
  const recipe = post.recipe_data

  return (
    <div style={{ position:'relative', marginBottom:10 }}>
      {/* Type badge */}
      <div style={{ position:'absolute', top:12, right:12, zIndex:2, background:`${pt.color}22`, border:`1px solid ${pt.color}66`, color:pt.color, borderRadius:4, padding:'3px 10px', ...O, fontSize:9, letterSpacing:1 }}>
        {pt.icon} {pt.label.toUpperCase()}
      </div>

      <PostCard post={post} onUpdate={onUpdate} />

      {/* Conditions tag */}
      {conditions && (
        <div style={{ background:'rgba(30,42,64,0.4)', border:'1px solid rgba(74,142,194,0.25)', borderRadius:6, padding:'8px 12px', margin:'-4px 0 0', fontSize:11, color:'#9BB8D8', display:'flex', gap:12, flexWrap:'wrap' }}>
          <span style={{ ...O, fontSize:8, letterSpacing:1, color:'#4A8EC2' }}>CONDITIONS:</span>
          {conditions.wind && <span>💨 {conditions.wind}</span>}
          {conditions.waves && <span>🌊 {conditions.waves}</span>}
          {conditions.water_temp && <span>🌡 {conditions.water_temp}</span>}
          {conditions.tide && <span>🌊 {conditions.tide}</span>}
          {conditions.moon && <span>🌙 {conditions.moon}</span>}
        </div>
      )}

      {/* Recipe rendering */}
      {recipe && (recipe.ingredients?.length || recipe.steps?.length) && (
        <div style={{ background:'rgba(212,152,46,0.08)', border:'1px solid rgba(212,152,46,0.25)', borderRadius:6, padding:'12px 14px', margin:'-4px 0 0' }}>
          {recipe.ingredients?.length > 0 && (
            <>
              <div style={{ ...O, fontSize:9, letterSpacing:2, color:'#D4982E', marginBottom:6 }}>🍳 INGREDIENTS</div>
              <ul style={{ margin:'0 0 10px', paddingLeft:18, fontSize:13, color:'#C8BEA8', lineHeight:1.7 }}>
                {recipe.ingredients.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
              </ul>
            </>
          )}
          {recipe.steps?.length > 0 && (
            <>
              <div style={{ ...O, fontSize:9, letterSpacing:2, color:'#D4982E', marginBottom:6 }}>STEPS</div>
              <ol style={{ margin:0, paddingLeft:18, fontSize:13, color:'#C8BEA8', lineHeight:1.7 }}>
                {recipe.steps.map((s: string, i: number) => <li key={i} style={{ marginBottom:4 }}>{s}</li>)}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  )
}
