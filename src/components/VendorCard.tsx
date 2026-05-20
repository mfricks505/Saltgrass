'use client'
// src/components/VendorCard.tsx

import { useState } from 'react'
import Link from 'next/link'
import { REGIONS } from '@/lib/types'
import type { VendorFull } from '@/lib/vendor-types'

interface Props {
  vendor: VendorFull
  compact?: boolean
}

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span style={{ fontSize: 13 }}>
      <span style={{ color: '#D4A832' }}>
        {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      </span>
      <span style={{ color: '#aaa', marginLeft: 5 }}>
        {rating.toFixed(1)} ({count} review{count !== 1 ? 's' : ''})
      </span>
    </span>
  )
}

export default function VendorCard({ vendor: v, compact }: Props) {
  const [showPhone, setShowPhone] = useState(false)
  const region = REGIONS.find(r => r.id === v.region_id)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      border: `1.5px solid ${v.tier_color}33`,
      marginBottom: 12,
      boxShadow: v.tier_id === 'pro'
        ? `0 4px 20px ${v.tier_color}22`
        : '0 2px 10px rgba(28,58,42,0.06)',
    }}>
      <div style={{ height: 4, background: v.tier_color }} />
      <div style={{ padding: compact ? '14px 16px' : '18px 20px 20px' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

          {/* Icon */}
          <div style={{
            width: compact ? 48 : 58, height: compact ? 48 : 58,
            borderRadius: 14, background: `${v.tier_color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: compact ? 24 : 28,
            border: `2px solid ${v.tier_color}33`,
            flexShrink: 0, overflow: 'hidden',
          }}>
            {v.photos?.[0]
              ? <img src={v.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : v.category_icon
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <Link href={`/vendors/${v.id}`} style={{ fontWeight: 900, fontSize: compact ? 14 : 16, color: '#1A2015', textDecoration: 'none' }}>
                {v.business_name}
              </Link>
              <span style={{ background: `${v.tier_color}22`, color: v.tier_color, border: `1px solid ${v.tier_color}55`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {v.tier_badge}
              </span>
            </div>

            {/* Category + region */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#888' }}>{v.category_icon} {v.category_label}</span>
              {region && (
                <span style={{ background: `${region.color}18`, color: region.color, borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
                  {region.icon} {region.label}
                </span>
              )}
              {v.city && <span style={{ fontSize: 12, color: '#aaa' }}>📍 {v.city}, FL</span>}
            </div>

            {/* Rating */}
            {v.review_count > 0 && (
              <div style={{ marginBottom: 6 }}>
                <StarDisplay rating={Number(v.average_rating)} count={v.review_count} />
              </div>
            )}

            {/* Bio */}
            {!compact && v.bio && (
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                {v.bio}
              </div>
            )}

            {/* Tags */}
            {!compact && v.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                {v.tags.slice(0, 4).map(tag => (
                  <span key={tag} style={{ background: '#2E5D3E15', color: '#2E5D3E', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 600 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href={`/vendors/${v.id}`} style={{ background: '#1C3A2A', color: '#fff', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                View Profile
              </Link>
              {v.phone && (
                <button onClick={() => setShowPhone(!showPhone)} style={{ background: '#fff', color: '#1C3A2A', border: '1.5px solid #E8DFC8', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {showPhone ? `📞 ${v.phone}` : '📞 Show Number'}
                </button>
              )}
              {v.website && (
                <a href={v.website} target="_blank" rel="noopener noreferrer" style={{ background: '#fff', color: '#2E5D3E', border: '1.5px solid #E8DFC8', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                  🌐 Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
