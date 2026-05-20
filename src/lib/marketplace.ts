// src/lib/marketplace-types.ts

export type Condition = 'like_new' | 'excellent' | 'good' | 'fair' | 'parts'
export type ListingType = 'fixed' | 'auction' | 'offer'
export type ShippingOption = 'seller_pays' | 'buyer_pays' | 'local_only'
export type ListingStatus = 'draft' | 'active' | 'sold' | 'expired' | 'removed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'disputed'
export type EscrowStatus = 'holding' | 'released' | 'refunded'

export type GearCategory = {
  id: string
  label: string
  icon: string
  parent_id?: string
}

export type Listing = {
  id: string
  seller_id: string
  category_id: string
  region_id: string | null
  title: string
  description: string
  condition: Condition
  photos: string[]
  tags: string[]
  listing_type: ListingType
  price_cents: number
  buy_now_price_cents: number | null
  reserve_price_cents: number | null
  shipping_option: ShippingOption
  ships_to: string
  estimated_shipping_cents: number | null
  auction_ends_at: string | null
  status: ListingStatus
  is_firearm: boolean
  commission_rate: number
  view_count: number
  watcher_count: number
  created_at: string
  updated_at: string
  sold_at: string | null
}

// Listing joined with category, region, seller profile, bid info
export type ListingFull = Listing & {
  category_label: string
  category_icon: string
  region_label: string | null
  region_icon: string | null
  region_color: string | null
  seller_username: string
  seller_name: string | null
  seller_avatar: string | null
  highest_bid_cents: number | null
  bid_count: number
  commission_cents: number
  seller_payout_cents: number
  // Client-side
  is_watching?: boolean
}

export type Bid = {
  id: string
  listing_id: string
  bidder_id: string
  amount_cents: number
  is_winning: boolean
  created_at: string
  // Joined
  bidder_username?: string
}

export type Offer = {
  id: string
  listing_id: string
  buyer_id: string
  amount_cents: number
  message: string | null
  status: 'pending' | 'accepted' | 'declined' | 'countered' | 'expired'
  counter_amount_cents: number | null
  expires_at: string
  created_at: string
}

export type Transaction = {
  id: string
  listing_id: string
  seller_id: string
  buyer_id: string
  item_price_cents: number
  shipping_cents: number
  commission_cents: number
  payout_cents: number
  total_charged_cents: number
  stripe_payment_intent_id: string | null
  payment_status: PaymentStatus
  escrow_status: EscrowStatus
  shipped_at: string | null
  tracking_number: string | null
  carrier: string | null
  delivered_at: string | null
  buyer_confirmed_at: string | null
  created_at: string
}

// Static data
export const GEAR_CATEGORIES: GearCategory[] = [
  { id: 'firearms_archery', label: 'Firearms & Archery', icon: '🏹' },
  { id: 'fishing',          label: 'Fishing',            icon: '🎣' },
  { id: 'optics',           label: 'Optics',             icon: '🔭' },
  { id: 'clothing_boots',   label: 'Clothing & Boots',   icon: '🥾' },
  { id: 'vehicles_atv',     label: 'Vehicles & ATVs',    icon: '🚜' },
  { id: 'camping_survival', label: 'Camping & Survival', icon: '⛺' },
  { id: 'calls_decoys',     label: 'Calls & Decoys',     icon: '🦆' },
  { id: 'boats_kayaks',     label: 'Boats & Kayaks',     icon: '🛶' },
  { id: 'electronics',      label: 'Electronics',        icon: '📡' },
  { id: 'dogs_training',    label: 'Dogs & Training',    icon: '🐕' },
  { id: 'other',            label: 'Other',              icon: '🏕️' },
]

export const CONDITION_CONFIG: Record<Condition, { label: string; color: string }> = {
  like_new:  { label: 'Like New',  color: '#5C8C5A' },
  excellent: { label: 'Excellent', color: '#38A89D' },
  good:      { label: 'Good',      color: '#D4A832' },
  fair:      { label: 'Fair',      color: '#C8522A' },
  parts:     { label: 'For Parts', color: '#6B7280' },
}

export const COMMISSION_RATE = 0.08

export function centsToDisplay(cents: number): string {
  if (cents >= 100000) return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

export function calcCommission(priceCents: number) {
  const commission = Math.round(priceCents * COMMISSION_RATE)
  const payout = priceCents - commission
  return { commission, payout }
}

export function timeLeft(endsAt: string): string {
  const ms = new Date(endsAt).getTime() - Date.now()
  if (ms <= 0) return 'Ended'
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const mins = Math.floor((ms % 3600000) / 60000)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}