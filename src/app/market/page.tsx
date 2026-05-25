'use client'
// src/app/market/page.tsx

import { useState } from 'react'
import { REGIONS } from '@/lib/types'

const B = {
  bg:'#4A5240', surf:'#3D4535', card:'#333B2C',
  sun:'#E8DFC8', sil:'#1A1E14', sub:'#B8B49A',
  dust:'#8A866E', border:'rgba(232,223,200,0.10)',
  accent:'#D4982E', danger:'#C8452A',
}
const O = { fontFamily:"'Oswald', sans-serif" }

const CATEGORIES = [
  { id:'all',         label:'ALL GEAR',     icon:'🏕️' },
  { id:'rods_reels',  label:'RODS & REELS', icon:'🎣' },
  { id:'firearms',    label:'FIREARMS',     icon:'🔫' },
  { id:'archery',     label:'ARCHERY',      icon:'🏹' },
  { id:'boats',       label:'BOATS',        icon:'⛵' },
  { id:'optics',      label:'OPTICS',       icon:'🔭' },
  { id:'clothing',    label:'CLOTHING',     icon:'🥾' },
  { id:'electronics', label:'ELECTRONICS',  icon:'📡' },
  { id:'other',       label:'OTHER',        icon:'📦' },
]

const LISTINGS = [
  { id:1, title:'Shimano Stradic 3000 FL — Like New', price:185, category:'rods_reels', condition:'Like New', region:'panhandle', region_icon:'🏖️', region_label:'Panhandle', user:'RiverRoller88', verified:true, rating:4.9, sales:12, is_firearm:false, icon:'🎣', days:2, featured:true,  payment:'Cash or Venmo',   meetup:'Pensacola area' },
  { id:2, title:'Ruger 10/22 Takedown — Excellent',   price:420, category:'firearms',   condition:'Excellent', region:'northfl', region_icon:'🌲', region_label:'North Florida', user:'SwampBuck',    verified:true, rating:5.0, sales:6,  is_firearm:true,  icon:'🔫', days:1, featured:false, payment:'Cash only',       meetup:'Gainesville area' },
  { id:3, title:'17ft Tracker Pro 170 + 60hp Mercury', price:8500, category:'boats',    condition:'Good',      region:'swfl',    region_icon:'🐚', region_label:'SW Florida',   user:'GulfCoastGary',verified:true, rating:4.8, sales:3,  is_firearm:false, icon:'⛵', days:5, featured:true,  payment:'Cash or Zelle',   meetup:'Fort Myers' },
  { id:4, title:'Leupold VX-3HD 4-12x40 — New in Box',price:550, category:'optics',    condition:'New',       region:'centralfl',region_icon:'🐊', region_label:'Central FL',   user:'CentralFLHunter',verified:false,rating:0,  sales:0,  is_firearm:false, icon:'🔭', days:3, featured:false, payment:'Cash or Venmo',   meetup:'Orlando area' },
  { id:5, title:'Simms G3 Guide Waders — Size Large',  price:280, category:'clothing',  condition:'Good',      region:'keys',    region_icon:'🦐', region_label:'The Keys',     user:'FlatsDrifter', verified:true, rating:4.7, sales:8,  is_firearm:false, icon:'🥾', days:7, featured:false, payment:'Venmo or PayPal', meetup:'Islamorada' },
  { id:6, title:'Hoyt Carbon RX-7 Bow + Full Kit',     price:1800,category:'archery',   condition:'Like New',  region:'northfl', region_icon:'🌲', region_label:'North Florida', user:'ArcherMike',   verified:true, rating:4.9, sales:4,  is_firearm:false, icon:'🏹', days:1, featured:false, payment:'Cash only',       meetup:'Ocala area' },
]

const COND_COLOR: Record<string,string> = {
  'New':'#7AE07A','Like New':'#7AE07A','Excellent':B.accent,'Good':B.accent,'Fair':B.sub,'For Parts':B.dust,
}

// ── Post Listing Modal ───────────────────────────────────────
function PostModal({ onClose }: { onClose:()=>void }) {
  const [step,     setStep]     = useState(1)
  const [featured, setFeatured] = useState(false)
  const [stripe,   setStripe]   = useState(false)
  const [form,     setForm]     = useState({ title:'', category:'', condition:'', price:'', description:'', region:'', meetup:'', payment:'', is_firearm:false })
  const [phone,    setPhone]    = useState('')
  const [code,     setCode]     = useState('')
  const [vStep,    setVStep]    = useState(1)
  const set = (k:string,v:any) => setForm(f=>({...f,[k]:v}))

  const listFee     = 4.99
  const featuredFee = 2.99
  const price       = Number(form.price) || 0
  const stripeFee   = stripe ? Math.round(price * 0.05 * 100) / 100 : 0
  const sellerGets  = stripe ? price - stripeFee : price

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:16,overflowY:'auto' }}>
      <div style={{ background:B.surf,borderRadius:8,padding:28,maxWidth:520,width:'100%',border:`1px solid ${B.border}`,maxHeight:'90vh',overflowY:'auto' }}>

        {/* Steps */}
        <div style={{ display:'flex',gap:6,marginBottom:22 }}>
          {['VERIFY','DETAILS','PAYMENT'].map((s,i)=>(
            <div key={s} style={{ flex:1 }}>
              <div style={{ height:3,borderRadius:2,background:i+1<=step?B.accent:B.border,marginBottom:4 }} />
              <div style={{ ...O,fontSize:8,letterSpacing:1,color:i+1<=step?B.accent:B.dust,textAlign:'center' }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Step 1 — Verify */}
        {step===1 && (
          <div>
            <div style={{ ...O,fontSize:18,letterSpacing:2,color:B.sun,marginBottom:6 }}>VERIFY YOUR IDENTITY</div>
            <p style={{ fontSize:12,color:B.sub,lineHeight:1.7,marginBottom:18 }}>All sellers are phone-verified. One-time process.</p>
            {vStep===1 && (
              <div>
                <div style={{ background:B.card,borderRadius:6,padding:'14px 16px',marginBottom:16,border:`1px solid ${B.border}` }}>
                  {[{icon:'📱',l:'Phone verified',d:'Real US number required'},
                    {icon:'⭐',l:'Seller rating',  d:'Visible on every listing'},
                    {icon:'✓',l:'Verified badge', d:'Builds buyer trust'}].map((v,i)=>(
                    <div key={v.l} style={{ display:'flex',gap:10,padding:'7px 0',borderBottom:i<2?`1px solid ${B.border}`:'none' }}>
                      <span style={{ fontSize:16,flexShrink:0 }}>{v.icon}</span>
                      <div><div style={{ ...O,fontSize:10,letterSpacing:1,color:B.sun }}>{v.l}</div><div style={{ fontSize:11,color:B.dust }}>{v.d}</div></div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setVStep(2)} style={{ width:'100%',background:B.accent,color:B.sil,border:'none',borderRadius:4,padding:'12px',...O,fontSize:13,fontWeight:600,letterSpacing:2,cursor:'pointer' }}>VERIFY PHONE →</button>
              </div>
            )}
            {vStep===2 && (
              <div>
                <label style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,display:'block',marginBottom:5 }}>PHONE NUMBER</label>
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(850) 555-0100" type="tel"
                  style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:B.sun,fontSize:15,padding:'11px 14px',width:'100%',outline:'none',boxSizing:'border-box' as any,marginBottom:12 }} />
                <button onClick={()=>setVStep(3)} style={{ width:'100%',background:B.accent,color:B.sil,border:'none',borderRadius:4,padding:'12px',...O,fontSize:13,fontWeight:600,letterSpacing:2,cursor:'pointer' }}>SEND CODE</button>
              </div>
            )}
            {vStep===3 && (
              <div>
                <div style={{ ...O,fontSize:12,letterSpacing:2,color:B.sun,marginBottom:4 }}>ENTER 6-DIGIT CODE</div>
                <div style={{ fontSize:12,color:B.dust,marginBottom:12 }}>Sent to {phone}</div>
                <input value={code} onChange={e=>setCode(e.target.value)} placeholder="000000" maxLength={6}
                  style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:B.accent,fontSize:28,fontWeight:700,padding:'12px',width:'100%',outline:'none',boxSizing:'border-box' as any,textAlign:'center',letterSpacing:10,marginBottom:14 }} />
                <button onClick={()=>{if(code.length===6)setStep(2)}} style={{ width:'100%',background:code.length===6?B.accent:B.border,color:code.length===6?B.sil:B.dust,border:'none',borderRadius:4,padding:'12px',...O,fontSize:13,fontWeight:600,letterSpacing:2,cursor:code.length===6?'pointer':'not-allowed' }}>CONFIRM →</button>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Listing details */}
        {step===2 && (
          <div>
            <div style={{ ...O,fontSize:18,letterSpacing:2,color:B.sun,marginBottom:16 }}>YOUR LISTING</div>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <div>
                <label style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,display:'block',marginBottom:5 }}>ITEM TITLE</label>
                <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Shimano Stradic 3000 FL — Like New"
                  style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:B.sun,fontSize:13,padding:'10px 12px',width:'100%',outline:'none',boxSizing:'border-box' as any }} />
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                <div>
                  <label style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,display:'block',marginBottom:5 }}>CATEGORY</label>
                  <select value={form.category} onChange={e=>set('category',e.target.value)} style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:form.category?B.sun:B.dust,fontSize:12,padding:'10px 12px',width:'100%',outline:'none',cursor:'pointer' }}>
                    <option value="">Select...</option>
                    {CATEGORIES.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,display:'block',marginBottom:5 }}>CONDITION</label>
                  <select value={form.condition} onChange={e=>set('condition',e.target.value)} style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:form.condition?B.sun:B.dust,fontSize:12,padding:'10px 12px',width:'100%',outline:'none',cursor:'pointer' }}>
                    <option value="">Select...</option>
                    {['New','Like New','Excellent','Good','Fair','For Parts'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,display:'block',marginBottom:5 }}>ASKING PRICE ($)</label>
                <input type="number" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="185"
                  style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:B.sun,fontSize:20,fontWeight:700,padding:'10px 12px',width:'100%',outline:'none',boxSizing:'border-box' as any }} />
              </div>

              {/* Stripe Connect toggle */}
              {price > 0 && (
                <div style={{ background:B.card,borderRadius:6,padding:'12px 14px',border:`1px solid ${B.border}` }}>
                  <div style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,marginBottom:10 }}>PAYMENT PROCESSING</div>
                  <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                    <div onClick={()=>setStripe(false)} style={{ padding:'10px 12px',borderRadius:4,border:`2px solid ${!stripe?B.accent:B.border}`,background:!stripe?'rgba(212,152,46,0.08)':'transparent',cursor:'pointer' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <div>
                          <div style={{ ...O,fontSize:11,color:B.sun,letterSpacing:1 }}>HANDLE IT YOURSELF</div>
                          <div style={{ fontSize:11,color:B.dust,marginTop:2 }}>Cash, Venmo, Zelle — you arrange it with the buyer</div>
                        </div>
                        <div style={{ ...O,fontSize:13,color:!stripe?B.accent:B.sub }}>$0 fee</div>
                      </div>
                    </div>
                    <div onClick={()=>setStripe(true)} style={{ padding:'10px 12px',borderRadius:4,border:`2px solid ${stripe?B.accent:B.border}`,background:stripe?'rgba(212,152,46,0.08)':'transparent',cursor:'pointer' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <div>
                          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                            <div style={{ ...O,fontSize:11,color:B.sun,letterSpacing:1 }}>SALTGRASS SECURE PAY</div>
                            <span style={{ background:B.accent,color:B.sil,borderRadius:3,padding:'1px 7px',...O,fontSize:8,letterSpacing:1 }}>STRIPE</span>
                          </div>
                          <div style={{ fontSize:11,color:B.dust,marginTop:2 }}>Buyer pays through the app · Buyer protection · You get ${price>0?(price-stripeFee).toFixed(2):0}</div>
                        </div>
                        <div style={{ ...O,fontSize:13,color:stripe?B.accent:B.sub }}>5% fee</div>
                      </div>
                    </div>
                  </div>
                  {stripe && price > 0 && (
                    <div style={{ marginTop:10,padding:'8px 12px',background:B.surf,borderRadius:4,fontSize:11,color:B.sub,lineHeight:1.6 }}>
                      Buyer pays: <strong style={{ color:B.sun }}>${price}</strong> · Saltgrass fee: <strong style={{ color:B.sun }}>${stripeFee.toFixed(2)}</strong> · You receive: <strong style={{ color:B.accent }}>${sellerGets.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                <div>
                  <label style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,display:'block',marginBottom:5 }}>REGION</label>
                  <select value={form.region} onChange={e=>set('region',e.target.value)} style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:form.region?B.sun:B.dust,fontSize:12,padding:'10px 12px',width:'100%',outline:'none',cursor:'pointer' }}>
                    <option value="">Select...</option>
                    {REGIONS.map(r=><option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,display:'block',marginBottom:5 }}>MEETUP AREA</label>
                  <input value={form.meetup} onChange={e=>set('meetup',e.target.value)} placeholder="Pensacola area"
                    style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:B.sun,fontSize:13,padding:'10px 12px',width:'100%',outline:'none',boxSizing:'border-box' as any }} />
                </div>
              </div>
              {!stripe && (
                <div>
                  <label style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,display:'block',marginBottom:5 }}>PAYMENT YOU ACCEPT</label>
                  <input value={form.payment} onChange={e=>set('payment',e.target.value)} placeholder="Cash, Venmo, Zelle..."
                    style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:B.sun,fontSize:13,padding:'10px 12px',width:'100%',outline:'none',boxSizing:'border-box' as any }} />
                </div>
              )}
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <input type="checkbox" checked={form.is_firearm} onChange={e=>set('is_firearm',e.target.checked)} id="firearm" />
                <label htmlFor="firearm" style={{ fontSize:12,color:B.sub,cursor:'pointer' }}>This is a firearm or regulated item</label>
              </div>
              {form.is_firearm && (
                <div style={{ background:'rgba(200,69,42,0.1)',border:`1px solid ${B.danger}44`,borderRadius:6,padding:'10px 14px',fontSize:11,color:'#E07A7A',lineHeight:1.7 }}>
                  🔫 Firearms must transfer through a licensed FFL dealer. Saltgrass Secure Pay is not available for firearms — cash transaction at FFL only.
                </div>
              )}
              <div>
                <label style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,display:'block',marginBottom:5 }}>DESCRIPTION</label>
                <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={3}
                  placeholder="Condition details, what's included, why you're selling..."
                  style={{ background:B.sil,border:`1.5px solid ${B.border}`,borderRadius:4,color:B.sun,fontSize:13,padding:'10px 12px',width:'100%',outline:'none',resize:'none' as any,boxSizing:'border-box' as any,fontFamily:'Inter,sans-serif',lineHeight:1.6 }} />
              </div>
            </div>
            <div style={{ display:'flex',gap:8,marginTop:18 }}>
              <button onClick={()=>setStep(1)} style={{ flex:1,padding:'11px',background:'transparent',border:`1.5px solid ${B.border}`,borderRadius:4,color:B.sub,...O,fontSize:11,letterSpacing:1,cursor:'pointer' }}>← BACK</button>
              <button onClick={()=>setStep(3)} style={{ flex:2,background:B.accent,color:B.sil,border:'none',borderRadius:4,padding:'11px',...O,fontSize:12,fontWeight:600,letterSpacing:1,cursor:'pointer' }}>CONTINUE →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Pay to post */}
        {step===3 && (
          <div>
            <div style={{ ...O,fontSize:18,letterSpacing:2,color:B.sun,marginBottom:16 }}>POST YOUR LISTING</div>

            <div style={{ background:B.card,borderRadius:6,padding:14,marginBottom:16,border:`1px solid ${B.border}` }}>
              <div style={{ ...O,fontSize:10,letterSpacing:2,color:B.dust,marginBottom:6 }}>SUMMARY</div>
              <div style={{ ...O,fontSize:14,color:B.sun,marginBottom:4 }}>{form.title||'Your item'}</div>
              <div style={{ fontSize:11,color:B.sub }}>{form.condition&&form.condition+' · '}${form.price||'0'} asking · {form.meetup||'Local meetup'} · {stripe?'Saltgrass Secure Pay':'Self-managed payment'}</div>
            </div>

            <div style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,marginBottom:10 }}>LISTING OPTIONS</div>
            <div onClick={()=>setFeatured(false)} style={{ padding:'12px 14px',borderRadius:4,border:`2px solid ${!featured?B.accent:B.border}`,background:!featured?'rgba(212,152,46,0.08)':'transparent',cursor:'pointer',marginBottom:8 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div><div style={{ ...O,fontSize:12,color:B.sun,letterSpacing:1 }}>STANDARD LISTING</div><div style={{ fontSize:11,color:B.dust,marginTop:2 }}>Browse feed · 30 days</div></div>
                <div style={{ ...O,fontSize:18,color:!featured?B.accent:B.sub }}>$4.99</div>
              </div>
            </div>
            <div onClick={()=>setFeatured(true)} style={{ padding:'12px 14px',borderRadius:4,border:`2px solid ${featured?B.accent:B.border}`,background:featured?'rgba(212,152,46,0.08)':'transparent',cursor:'pointer',marginBottom:16 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <div style={{ ...O,fontSize:12,color:B.sun,letterSpacing:1 }}>FEATURED BUMP</div>
                    <span style={{ background:B.accent,color:B.sil,borderRadius:3,padding:'1px 7px',...O,fontSize:8,letterSpacing:1 }}>7 DAYS</span>
                  </div>
                  <div style={{ fontSize:11,color:B.dust,marginTop:2 }}>Pinned to top · Bold copper border · 7 days</div>
                </div>
                <div style={{ ...O,fontSize:18,color:featured?B.accent:B.sub }}>+$2.99</div>
              </div>
            </div>

            <div style={{ background:B.sil,borderRadius:4,padding:'12px 14px',marginBottom:16,border:`1px solid ${B.border}` }}>
              <div style={{ ...O,fontSize:9,letterSpacing:2,color:B.dust,marginBottom:8 }}>WHAT YOU PAY TODAY</div>
              {[
                { label:'Listing fee (30 days)',                          val:'$4.99' },
                ...(featured?[{ label:'Featured bump (7 days)',           val:'$2.99' }]:[]),
                ...(stripe&&form.price?[{ label:`5% transaction fee on sale of $${form.price}`, val:`$${stripeFee.toFixed(2)} when sold` }]:[]),
              ].map((r,i)=>(
                <div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:`1px solid ${B.border}` }}>
                  <span style={{ fontSize:12,color:B.sub }}>{r.label}</span>
                  <span style={{ fontSize:12,color:B.sun,fontWeight:700 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ display:'flex',justifyContent:'space-between',paddingTop:8 }}>
                <span style={{ ...O,fontSize:12,letterSpacing:1,color:B.sun }}>DUE TODAY</span>
                <span style={{ ...O,fontSize:22,color:B.accent }}>${featured?'7.98':'4.99'}</span>
              </div>
              {stripe && form.price && (
                <div style={{ fontSize:10,color:B.dust,marginTop:6,lineHeight:1.6 }}>
                  5% transaction fee (${stripeFee.toFixed(2)}) charged only when item sells. You receive ${sellerGets.toFixed(2)}.
                </div>
              )}
            </div>

            <div style={{ background:'rgba(212,152,46,0.08)',border:`1px solid ${B.accent}33`,borderRadius:6,padding:'10px 14px',marginBottom:16,fontSize:11,color:B.sub,lineHeight:1.7 }}>
              <strong style={{ color:B.sun }}>Meet safely.</strong> Police station parking lots are ideal. Bring a buddy. Never share your home address before meeting.
            </div>

            <div style={{ display:'flex',gap:8 }}>
              <button onClick={()=>setStep(2)} style={{ flex:1,padding:'11px',background:'transparent',border:`1.5px solid ${B.border}`,borderRadius:4,color:B.sub,...O,fontSize:11,letterSpacing:1,cursor:'pointer' }}>← BACK</button>
              <button onClick={onClose} style={{ flex:2,background:B.accent,color:B.sil,border:'none',borderRadius:4,padding:'12px',...O,fontSize:13,fontWeight:600,letterSpacing:2,cursor:'pointer' }}>
                PAY ${featured?'7.98':'4.99'} & POST
              </button>
            </div>
          </div>
        )}
        {step<3 && <button onClick={onClose} style={{ width:'100%',marginTop:12,background:'none',border:'none',color:B.dust,fontSize:12,cursor:'pointer' }}>Cancel</button>}
      </div>
    </div>
  )
}

// ── Listing Card ─────────────────────────────────────────────
function ListingCard({ l }: { l: typeof LISTINGS[0] }) {
  return (
    <div style={{ background:B.card,borderRadius:6,border:l.featured?`2px solid ${B.accent}`:`1px solid ${B.border}`,display:'flex',overflow:'hidden',position:'relative' as any }}>
      {l.featured && <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:B.accent }} />}
      <div style={{ width:130,background:'linear-gradient(160deg,#2A3020,#3A4530)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,flexShrink:0 }}>{l.icon}</div>
      <div style={{ padding:'12px 14px',flex:1,minWidth:0 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5 }}>
          <div style={{ flex:1,marginRight:12 }}>
            {l.featured && <span style={{ ...O,fontSize:9,letterSpacing:2,color:B.accent,marginRight:8 }}>★ FEATURED</span>}
            <div style={{ ...O,fontSize:14,color:B.sun,lineHeight:1.3 }}>{l.title}</div>
          </div>
          <div style={{ ...O,fontSize:20,color:B.accent,flexShrink:0 }}>${l.price.toLocaleString()}</div>
        </div>
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:7,alignItems:'center' }}>
          <span style={{ ...O,fontSize:9,letterSpacing:1,color:COND_COLOR[l.condition]??B.dust }}>{l.condition.toUpperCase()}</span>
          <span style={{ fontSize:10,color:B.dust }}>·</span>
          <span style={{ fontSize:10,color:B.dust }}>{l.region_icon} {l.region_label}</span>
          <span style={{ fontSize:10,color:B.dust }}>·</span>
          <span style={{ fontSize:10,color:B.dust }}>{l.days}d ago</span>
          {l.is_firearm && <span style={{ background:'rgba(200,69,42,0.15)',color:'#E07A7A',borderRadius:3,padding:'1px 7px',...O,fontSize:9,letterSpacing:1 }}>FFL REQUIRED</span>}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
          <span style={{ fontSize:11,color:B.sub }}>@{l.user}</span>
          {l.verified && <span style={{ background:'rgba(212,152,46,0.15)',color:B.accent,borderRadius:3,padding:'1px 6px',...O,fontSize:8,letterSpacing:1 }}>✓ VERIFIED</span>}
          {l.rating>0 && <span style={{ fontSize:10,color:B.dust }}>{'★'.repeat(Math.floor(l.rating))} {l.rating} ({l.sales} sales)</span>}
        </div>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
          <span style={{ background:B.surf,color:B.sub,borderRadius:3,padding:'2px 8px',fontSize:10 }}>📍 {l.meetup}</span>
          <span style={{ background:B.surf,color:B.sub,borderRadius:3,padding:'2px 8px',fontSize:10 }}>💵 {l.payment}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function MarketPage() {
  const [category, setCategory] = useState('all')
  const [region,   setRegion]   = useState('all')
  const [showPost, setShowPost] = useState(false)

  const filtered = LISTINGS
    .filter(l=>category==='all'||l.category===category)
    .filter(l=>region==='all'||l.region===region)
    .sort((a,b)=>(b.featured?1:0)-(a.featured?1:0))

  return (
    <div>
      <div style={{ background:'linear-gradient(160deg,#333B2C,#3D4535)',border:`1px solid ${B.border}`,borderRadius:8,padding:'40px 38px 36px',marginBottom:10,position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',right:-60,top:-60,width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,152,46,0.06) 0%,transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'relative',maxWidth:600 }}>
          <div style={{ ...O,fontSize:10,letterSpacing:4,color:B.accent,marginBottom:8 }}>SALTGRASS</div>
          <h1 style={{ ...O,fontSize:40,letterSpacing:1,color:B.sun,margin:'0 0 12px',textTransform:'uppercase',lineHeight:1 }}>THE MARKET</h1>
          <p style={{ fontSize:14,color:B.sub,margin:'0 0 6px',lineHeight:1.8,maxWidth:520 }}>
            Buy and sell gear with verified Florida outdoorsmen. Meet up locally. No scammers, no lowballers.
          </p>
          <p style={{ fontSize:12,color:B.dust,margin:'0 0 24px',lineHeight:1.7 }}>
            $4.99 to list · Optional 5% Stripe fee if you want secure payment processing · $2.99 to bump to Featured for 7 days
          </p>
          <div style={{ display:'flex',gap:10 }}>
            <button onClick={()=>setShowPost(true)} style={{ background:B.accent,color:B.sil,border:'none',borderRadius:4,padding:'11px 24px',...O,fontSize:13,fontWeight:600,letterSpacing:2,cursor:'pointer' }}>+ LIST GEAR — $4.99</button>
            <button style={{ background:'transparent',color:B.sub,border:`2px solid ${B.border}`,borderRadius:4,padding:'11px 18px',...O,fontSize:12,letterSpacing:2,cursor:'pointer' }}>MY LISTINGS</button>
          </div>
        </div>
      </div>

      <div className="no-scrollbar" style={{ display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:10 }}>
        {CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>setCategory(c.id)} style={{ flexShrink:0,padding:'6px 12px',borderRadius:3,...O,fontSize:10,letterSpacing:2,cursor:'pointer',border:`2px solid ${category===c.id?B.accent:B.border}`,background:category===c.id?'rgba(212,152,46,0.12)':'transparent',color:category===c.id?B.accent:B.sub }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 210px',gap:10,alignItems:'start' }}>
        <div>
          <div style={{ ...O,fontSize:9,letterSpacing:3,color:B.dust,marginBottom:10 }}>{filtered.length} LISTINGS</div>
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {filtered.map(l=><ListingCard key={l.id} l={l} />)}
          </div>
        </div>

        <div style={{ position:'sticky',top:72,display:'flex',flexDirection:'column',gap:10 }}>
          <div style={{ background:B.card,borderRadius:6,border:`1px solid ${B.border}`,overflow:'hidden' }}>
            <div style={{ background:B.surf,padding:'9px 13px',borderBottom:`1px solid ${B.border}` }}><div style={{ ...O,fontSize:9,letterSpacing:3,color:B.accent }}>FILTER BY REGION</div></div>
            <div style={{ padding:'8px 12px',display:'flex',flexDirection:'column',gap:4 }}>
              <button onClick={()=>setRegion('all')} style={{ padding:'7px 10px',borderRadius:3,border:`1.5px solid ${region==='all'?B.accent:B.border}`,background:region==='all'?'rgba(212,152,46,0.1)':'transparent',color:region==='all'?B.accent:B.sub,...O,fontSize:10,letterSpacing:1,cursor:'pointer',textAlign:'left' as any }}>ALL FLORIDA</button>
              {REGIONS.map(r=>(
                <button key={r.id} onClick={()=>setRegion(r.id)} style={{ padding:'7px 10px',borderRadius:3,border:`1.5px solid ${region===r.id?B.accent:B.border}`,background:region===r.id?'rgba(212,152,46,0.1)':'transparent',color:region===r.id?B.accent:B.sub,...O,fontSize:10,letterSpacing:1,cursor:'pointer',textAlign:'left' as any }}>
                  {r.icon} {r.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background:B.card,borderRadius:6,border:`1px solid ${B.border}`,padding:14 }}>
            <div style={{ ...O,fontSize:9,letterSpacing:3,color:B.accent,marginBottom:10 }}>HOW IT WORKS</div>
            {[
              { n:'01',t:'List for $4.99',        d:'30-day standard listing in the browse feed.' },
              { n:'02',t:'Featured bump — $2.99', d:'7 days pinned to top with copper border.' },
              { n:'03',t:'Secure Pay — 5%',        d:'Optional Stripe checkout. 5% fee on completed sale.' },
              { n:'04',t:'Meet up locally',         d:'Public place. Cash or Venmo — your call.' },
              { n:'05',t:'Rate each other',          d:'Builds trust. Bad actors get removed.' },
            ].map(s=>(
              <div key={s.n} style={{ display:'flex',gap:10,padding:'7px 0',borderBottom:`1px solid ${B.border}` }}>
                <span style={{ ...O,fontSize:9,color:B.accent,flexShrink:0,minWidth:18 }}>{s.n}</span>
                <div><div style={{ ...O,fontSize:10,letterSpacing:1,color:B.sun }}>{s.t}</div><div style={{ fontSize:10,color:B.dust,lineHeight:1.5 }}>{s.d}</div></div>
              </div>
            ))}
          </div>

          <button onClick={()=>setShowPost(true)} style={{ background:'transparent',color:B.accent,border:`2px solid ${B.accent}`,borderRadius:4,padding:'11px',...O,fontSize:11,letterSpacing:2,cursor:'pointer',width:'100%' }}>+ LIST YOUR GEAR</button>
        </div>
      </div>
      {showPost && <PostModal onClose={()=>setShowPost(false)} />}
    </div>
  )
}
