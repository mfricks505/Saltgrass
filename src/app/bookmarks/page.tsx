'use client'
// src/app/bookmarks/page.tsx — Saved items (posts, listings, guides, trips)

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const O = { fontFamily: "'Oswald', sans-serif" }
const B = { surface:'var(--surface)', sun:'var(--sun)', sub:'var(--sub)', dust:'var(--dust)', accent:'var(--accent)', border:'var(--border)' }

const TYPE_META: Record<string, { icon: string; route: (id: string) => string; label: string }> = {
  post:    { icon: '📋', route: id => `/report/${id}`,   label: 'Board Post' },
  listing: { icon: '🏷️', route: id => `/market/${id}`,   label: 'Listing' },
  guide:   { icon: '🔭', route: id => `/guides/${id}`,   label: 'Guide' },
  trip:    { icon: '⛵', route: id => `/crewup`,          label: 'Trip' },
}

export default function BookmarksPage() {
  const supabase = createClient()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'post'|'listing'|'guide'|'trip'>('all')

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data } = await supabase.from('bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  async function remove(item: any) {
    await supabase.from('bookmarks').delete().match({ user_id: item.user_id, item_type: item.item_type, item_id: item.item_id })
    load()
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.item_type === filter)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ ...O, fontSize: 24, letterSpacing: 1, color: B.sun, margin: '8px 0 14px' }}>SAVED</div>

      <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14 }}>
        {(['all','post','listing','guide','trip'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 4, ...O, fontSize: 10, letterSpacing: 2, cursor: 'pointer', border: `2px solid ${filter===f?B.accent:'var(--border)'}`, background: filter===f?'rgba(212,152,46,0.12)':'transparent', color: filter===f?B.accent:B.sub }}>
            {f === 'all' ? 'ALL' : f.toUpperCase() + 'S'}
          </button>
        ))}
      </div>

      {loading ? <div style={{ ...O, color: B.dust, letterSpacing: 2, padding: 40, textAlign: 'center' }}>LOADING...</div> :
       filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', borderRadius: 8, padding: 44, textAlign: 'center', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔖</div>
          <div style={{ color: B.dust, fontSize: 13 }}>Nothing saved yet. Tap the bookmark icon on posts, listings, or guides to save them here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(item => {
            const meta = TYPE_META[item.item_type] ?? { icon: '🔖', route: () => '/', label: 'Item' }
            return (
              <div key={`${item.item_type}-${item.item_id}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{meta.icon}</span>
                <Link href={meta.route(item.item_id)} style={{ flex: 1, textDecoration: 'none', minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: B.sun }}>{item.label || meta.label}</div>
                  <div style={{ ...O, fontSize: 9, letterSpacing: 1, color: B.dust, marginTop: 2 }}>{meta.label.toUpperCase()}</div>
                </Link>
                <button onClick={() => remove(item)} style={{ background: 'none', border: 'none', color: B.dust, cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
