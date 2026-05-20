// src/lib/vendor-types.ts

export type VendorCategory = { id: string; label: string; icon: string }

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'
export type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected'

export type Vendor = {
  id: string; user_id: string; business_name: string; category_id: string; region_id: string
  bio: string | null; phone: string | null; email: string | null; website: string | null
  address: string | null; city: string | null; state: string; years_in_business: number | null
  license_number: string | null; insurance_verified: boolean; photos: string[]; tags: string[]
  tier_id: string; stripe_customer_id: string | null; stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus; subscription_ends_at: string | null
  verification_status: VerificationStatus; verification_submitted_at: string | null
  verification_approved_at: string | null; review_count: number; average_rating: number
  view_count: number; is_active: boolean; created_at: string; updated_at: string
}

export type VendorFull = Vendor & {
  category_label: string; category_icon: string; region_label: string; region_icon: string
  region_color: string; tier_label: string; tier_badge: string; tier_color: string
  monthly_price_cents: number; username: string; full_name: string | null; avatar_url: string | null
}

export type VendorReview = {
  id: string; vendor_id: string; user_id: string; rating: number; title: string | null
  body: string; trip_date: string | null; species_targeted: string[]; would_recommend: boolean
  vendor_response: string | null; vendor_responded_at: string | null; helpful_count: number
  is_verified_purchase: boolean; created_at: string
  username?: string; full_name?: string | null; avatar_url?: string | null
}

export type SubscriptionTier = {
  id: 'verified' | 'featured' | 'pro'
  label: string
  monthly_price_cents: number
  annual_price_cents: number
  badge: string
  color: string
  features: string[]
}

export const VENDOR_CATEGORIES: VendorCategory[] = [
  { id: 'fishing_guide',  label: 'Fishing Guide',        icon: '🎣' },
  { id: 'hunting_guide',  label: 'Hunting Guide',         icon: '🏹' },
  { id: 'outfitter',      label: 'Outfitter',             icon: '🎒' },
  { id: 'taxidermist',    label: 'Taxidermist',           icon: '🦌' },
  { id: 'boat_repair',    label: 'Boat Repair',           icon: '⚙️' },
  { id: 'fly_shop',       label: 'Fly Shop',              icon: '🪰' },
  { id: 'bait_tackle',    label: 'Bait & Tackle',         icon: '🐛' },
  { id: 'kayak_rentals',  label: 'Kayak & Canoe Rental',  icon: '🛶' },
  { id: 'rv_camping',     label: 'RV & Camping',          icon: '⛺' },
  { id: 'wildlife_tours', label: 'Wildlife Tours',        icon: '🦅' },
  { id: 'photography',    label: 'Outdoor Photography',   icon: '📷' },
  { id: 'other',          label: 'Other',                 icon: '🏕️' },
]

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'verified', label: 'Verified',
    monthly_price_cents: 900, annual_price_cents: 8900,
    badge: '✓ Verified', color: '#5C8C5A',
    features: [
      'Verified badge on profile',
      'Searchable by region & category',
      'Basic profile listing',
      'Customer reviews enabled',
      'Contact form',
    ],
  },
  {
    id: 'featured', label: 'Featured',
    monthly_price_cents: 2900, annual_price_cents: 27900,
    badge: '✦ Featured', color: '#38A89D',
    features: [
      'Everything in Verified',
      'Featured badge & highlighted card',
      'Priority in search results',
      'Monthly performance stats',
      'Up to 10 photos in gallery',
    ],
  },
  {
    id: 'pro', label: 'Pro Partner',
    monthly_price_cents: 7900, annual_price_cents: 74900,
    badge: '⭐ Pro Partner', color: '#D4A832',
    features: [
      'Everything in Featured',
      'Banner in regional feeds',
      'Monthly spotlight post',
      'Full analytics dashboard',
      'Direct booking link',
      'Unlimited photos',
      'Priority support',
    ],
  },
]

export const TIER_ORDER = ['pro', 'featured', 'verified']

export function getTierConfig(tierId: string) {
  return SUBSCRIPTION_TIERS.find(t => t.id === tierId) ?? SUBSCRIPTION_TIERS[0]
}

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatPriceShort(cents: number) {
  return `$${cents / 100}`
}
