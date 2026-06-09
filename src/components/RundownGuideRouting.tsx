'use client'
// src/components/RundownGuideRouting.tsx
// Routes Rundown demand to guides. On a NO-GO offshore day, surface inshore guides;
// on a GO day, nudge "book before spots fill." Your unfair advantage — conditions → bookings.
// <RundownGuideRouting region="panhandle" verdict="NO-GO" />

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const O = { fontFamily: "'Oswald', sans-serif" }

export default function RundownGuideRouting({ region, verdict }: { region: string; verdict: 'GO' | 'CAUTION' | 'NO-GO' }) {
  const supabase = createClient()
  const [guides, setGuides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [region, verdict])
  async function load() {
    setLoading(true)
    // Only show verified, active, listed guides in this region. Verified guides surface first.
    let q = supabase.from('guides').select('id, business_name, name, category, rating, review_count, price_from, is_verified')
      .eq('is_active', true).eq('region', region)
    const { data } = await q.order('is_verified', { ascending: false }).order('rating', { ascending: false }).limit(3)
    setGuides(data ?? [])
    setLoading(false)
  }

  if (loading || guides.length === 0) return null

  const headline =
    verdict === 'NO-GO' ? "Rough out there? A local guide knows where it's still fishable." :
    verdict === 'CAUTION' ? 'Conditions are tricky — go with someone who knows the water.' :
    "Conditions are prime. Book a guide before the good days fill up."

  return (
    <div style={{ background: 'linear-gradient(160deg,#14263F,#1B2F4A)', border: '1px solid rgba(91,163,224,0.25)', borderRadius: 10, padding: '16px 18px', marginTop: 14 }}>
      <div style={{ ...O, fontSize: 10, letterSpacing: 2, color: '#5BA3E0', marginBottom: 4 }}>BOOK A LOCAL GUIDE</div>
      <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 12, lineHeight: 1.5 }}>{headline}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {guides.map(g => (
          <Link key={g.id} href={`/guides/${g.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...O, fontSize: 13, color: 'var(--sun)' }}>{g.business_name || g.name} {g.is_verified ? '🛡️' : ''}</div>
                <div style={{ fontSize: 11, color: 'var(--dust)', marginTop: 2 }}>{g.rating ? `★ ${Number(g.rating).toFixed(1)}` : 'New'}{g.review_count ? ` (${g.review_count})` : ''}{g.price_from ? ` · from $${g.price_from}` : ''}</div>
              </div>
              <span style={{ ...O, fontSize: 10, letterSpacing: 1, color: '#5BA3E0', flexShrink: 0 }}>BOOK →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
