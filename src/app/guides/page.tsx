'use client'
// src/app/guides/page.tsx — Verified Guides & Services

import { useState } from 'react'
import Link from 'next/link'
import { REGIONS } from '@/lib/types'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }

const CATEGORIES = [
  { id: 'all',            label: 'ALL',             icon: '🔭' },
  { id: 'fishing_guide',  label: 'FISHING GUIDES',  icon: '🎣' },
  { id: 'hunting_guide',  label: 'HUNTING GUIDES',  icon: '🏹' },
  { id: 'outfitter',      label: 'OUTFITTERS',       icon: '🎒' },
  { id: 'taxidermist',    label: 'TAXIDERMISTS',     icon: '🦌' },
  { id: 'boat_repair',    label: 'BOAT REPAIR',      icon: '⚙️' },
  { id: 'fly_shop',       label: 'FLY SHOPS',        icon: '🪰' },
]

const MOCK_GUIDES = [
  { id: 1, name: 'Pensacola Bay Charters', category: 'fishing_guide', region: 'panhandle', region_icon: '🏖️', region_label: 'Panhandle', rating: 4.9, reviews: 87, city: 'Pensacola', bio: 'Full-time inshore guide targeting redfish, speckled trout, and flounder in Pensacola Bay and surrounding waters. 15 years on these flats.', tags: ['Redfish', 'Speckled Trout', 'Inshore', 'Fly Fishing'], tier: 'pro', verified: true, price_from: 350, icon: '🎣' },
  { id: 2, name: 'Osceola Hunting Outfitters', category: 'hunting_guide', region: 'northfl', region_icon: '🌲', region_label: 'North Florida', rating: 5.0, reviews: 43, city: 'Gainesville', bio: 'Private land access for whitetail, turkey, and hog hunts across 6,000 acres in North Florida. All-inclusive packages available.', tags: ['Whitetail', 'Turkey', 'Hog', 'Private Land'], tier: 'featured', verified: true, price_from: 500, icon: '🏹' },
  { id: 3, name: 'Keys Flats Co.', category: 'fishing_guide', region: 'keys', region_icon: '🦐', region_label: 'The Keys', rating: 4.8, reviews: 122, city: 'Islamorada', bio: 'Permit, bonefish, and tarpon on fly. Backcountry and flats fishing in the Florida Keys. USCG licensed captain with 20 years experience.', tags: ['Permit', 'Tarpon', 'Bonefish', 'Fly Fishing', 'Flats'], tier: 'pro', verified: true, price_from: 600, icon: '🎣' },
  { id: 4, name: 'Gulf Coast Trophy Taxidermy', category: 'taxidermist', region: 'swfl', region_icon: '🐚', region_label: 'SW Florida', rating: 4.7, reviews: 31, city: 'Fort Myers', bio: 'Full-service fish and game taxidermy. Specializing in fish mounts, shoulder mounts, and European mounts. Average 4-month turnaround.', tags: ['Fish Mounts', 'Shoulder Mounts', 'European Mounts'], tier: 'verified', verified: true, price_from: 150, icon: '🦌' },
]

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  pro:      { label: '⭐ PRO PARTNER', color: '#D4A832' },
  featured: { label: '✦ FEATURED',    color: '#38A89D' },
  verified: { label: '✓ VERIFIED',    color: '#5C8A4A' },
}

function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <span>
      <span style={{ color: B.copper }}>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}</span>
      <span style={{ color: B.dust, fontSize: 11, marginLeft: 5 }}>{rating} ({count} reviews)</span>
    </span>
  )
}

export default function GuidesPage() {
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('all')

  const filtered = MOCK_GUIDES
    .filter(g => category === 'all' || g.category === category)
    .filter(g => region === 'all' || g.region === region)

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0F1A0F, #141F14)', border: '1px solid #243824', borderRadius: 8, padding: '44px 40px 40px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,146,42,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 620 }}>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 4, color: B.copper, marginBottom: 8 }}>SALTGRASS</div>
          <h1 style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 44, letterSpacing: 1, color: B.bone, margin: '0 0 14px', textTransform: 'uppercase', lineHeight: 1 }}>GUIDES</h1>
          <p style={{ fontSize: 15, color: B.parchment, margin: '0 0 6px', lineHeight: 1.7, maxWidth: 540 }}>
            Verified fishing guides, hunting outfitters, and outdoor services across Florida.
          </p>
          <p style={{ fontSize: 13, color: B.dust, margin: '0 0 28px', lineHeight: 1.6 }}>
            Every guide is verified before listing. Reviews only from members who actually booked them — not Yelp tourists.
          </p>
          <Link href="/guides/join" style={{ background: B.copper, color: '#0A0C08', padding: '12px 26px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, letterSpacing: 2, textDecoration: 'none' }}>
            LIST YOUR BUSINESS
          </Link>
        </div>
      </div>

      {/* Category filter */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 2, cursor: 'pointer', border: `2px solid ${category === c.id ? B.copper : B.canopy}`, background: category === c.id ? 'rgba(200,146,42,0.12)' : 'transparent', color: category === c.id ? B.copper : B.parchment }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 10, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(g => {
            const tier = TIER_BADGE[g.tier]
            return (
              <div key={g.id} style={{ background: B.forest, borderRadius: 8, overflow: 'hidden', border: `1px solid ${B.canopy}` }}>
                <div style={{ height: 3, background: tier.color }} />
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 24 }}>{g.icon}</span>
                        <div>
                          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 16, color: B.bone }}>{g.name}</div>
                          <div style={{ fontSize: 11, color: B.dust }}>{g.region_icon} {g.region_label} · {g.city}, FL</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 8 }}><Stars rating={g.rating} count={g.reviews} /></div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ background: `${tier.color}22`, color: tier.color, border: `1px solid ${tier.color}55`, borderRadius: 4, padding: '3px 10px', fontSize: 9, fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: 1, marginBottom: 6 }}>
                        {tier.label}
                      </div>
                      <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 18, color: B.copper }}>From ${g.price_from}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: B.parchment, lineHeight: 1.7, marginBottom: 10 }}>{g.bio}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {g.tags.map(t => (
                      <span key={t} style={{ background: B.moss, color: B.parchment, borderRadius: 4, padding: '2px 8px', fontSize: 10 }}>#{t}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 2, background: B.copper, color: '#0A0C08', border: 'none', borderRadius: 4, padding: '10px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>
                      VIEW PROFILE & BOOK
                    </button>
                    <button style={{ flex: 1, background: 'transparent', color: B.parchment, border: `1.5px solid ${B.canopy}`, borderRadius: 4, padding: '10px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, cursor: 'pointer' }}>
                      READ REVIEWS
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ background: B.forest, borderRadius: 8, padding: 48, textAlign: 'center', border: '1px solid #243824' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔭</div>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 18, letterSpacing: 2, color: B.bone, marginBottom: 8 }}>NO GUIDES LISTED YET</div>
              <div style={{ color: B.dust, fontSize: 13, marginBottom: 20 }}>Be the first to list your guide service in this area.</div>
              <Link href="/guides/join" style={{ background: B.copper, color: '#0A0C08', padding: '11px 22px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 2, textDecoration: 'none' }}>LIST YOUR BUSINESS</Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 72, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: B.forest, borderRadius: 8, padding: 16, border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>FILTER BY REGION</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => setRegion('all')} style={{ padding: '8px 10px', borderRadius: 4, border: `1.5px solid ${region === 'all' ? B.copper : B.canopy}`, background: region === 'all' ? 'rgba(200,146,42,0.1)' : 'transparent', color: region === 'all' ? B.copper : B.parchment, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, cursor: 'pointer', textAlign: 'left' }}>
                🌴 ALL FLORIDA
              </button>
              {REGIONS.map(r => (
                <button key={r.id} onClick={() => setRegion(r.id)} style={{ padding: '8px 10px', borderRadius: 4, border: `1.5px solid ${region === r.id ? B.copper : B.canopy}`, background: region === r.id ? 'rgba(200,146,42,0.1)' : 'transparent', color: region === r.id ? B.copper : B.parchment, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, cursor: 'pointer', textAlign: 'left' }}>
                  {r.icon} {r.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: B.forest, borderRadius: 8, padding: 16, border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>ARE YOU A GUIDE?</div>
            <p style={{ fontSize: 12, color: B.parchment, lineHeight: 1.7, margin: '0 0 12px' }}>
              Get verified and reach thousands of Florida outdoorsmen looking for exactly what you offer.
            </p>
            <Link href="/guides/join" style={{ display: 'block', textAlign: 'center', background: 'transparent', color: B.copper, padding: '10px', borderRadius: 4, border: `2px solid ${B.copper}`, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 2, textDecoration: 'none' }}>
              LIST YOUR BUSINESS
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
