// src/lib/badges.ts
// Reputation badges — computed from data you already store. No new tables.
// Reinforces the "real people, real history" culture.

export interface Badge {
  id: string
  label: string
  icon: string
  desc: string
  earned: boolean
}

export interface BadgeInputs {
  userLevel?: number          // 1=signup, 2=verified email, 3=ID verified
  catchCount?: number
  speciesCount?: number
  slamsComplete?: number
  reportsPosted?: number
  completedSales?: number
  sellerRating?: number | null
  ratingCount?: number
  memberSince?: string        // ISO date
}

export function computeBadges(i: BadgeInputs): Badge[] {
  const monthsActive = i.memberSince
    ? (Date.now() - new Date(i.memberSince).getTime()) / (1000*60*60*24*30)
    : 0

  const all: Badge[] = [
    { id:'verified', label:'Verified', icon:'🛡️', desc:'ID-verified member', earned:(i.userLevel ?? 1) >= 3 },
    { id:'email_verified', label:'Confirmed', icon:'✓', desc:'Verified account', earned:(i.userLevel ?? 1) >= 2 },
    { id:'first_catch', label:'First Catch', icon:'🎣', desc:'Logged your first catch', earned:(i.catchCount ?? 0) >= 1 },
    { id:'logbook', label:'Logbook Keeper', icon:'📖', desc:'Logged 25+ catches', earned:(i.catchCount ?? 0) >= 25 },
    { id:'centurion', label:'Centurion', icon:'💯', desc:'Logged 100+ catches', earned:(i.catchCount ?? 0) >= 100 },
    { id:'diverse', label:'Versatile', icon:'🌈', desc:'Caught 10+ species', earned:(i.speciesCount ?? 0) >= 10 },
    { id:'slammer', label:'Slammer', icon:'🏆', desc:'Completed a Florida slam', earned:(i.slamsComplete ?? 0) >= 1 },
    { id:'grand_slammer', label:'Grand Slammer', icon:'👑', desc:'Completed 3+ slams', earned:(i.slamsComplete ?? 0) >= 3 },
    { id:'reporter', label:'Reporter', icon:'📋', desc:'Posted 10+ reports', earned:(i.reportsPosted ?? 0) >= 10 },
    { id:'trusted_seller', label:'Trusted Seller', icon:'⭐', desc:'5+ sales, 4.5+ rating', earned:(i.completedSales ?? 0) >= 5 && (i.sellerRating ?? 0) >= 4.5 },
    { id:'first_sale', label:'Dealer', icon:'🤝', desc:'Completed your first sale', earned:(i.completedSales ?? 0) >= 1 },
    { id:'veteran', label:'Salt Veteran', icon:'🧭', desc:'Member for 1+ year', earned:monthsActive >= 12 },
  ]
  return all
}

// A simple level/title from total activity — the "rep" headline
export function reputationTitle(i: BadgeInputs): { title: string; icon: string } {
  const score = (i.catchCount ?? 0) + (i.reportsPosted ?? 0)*2 + (i.completedSales ?? 0)*3 + (i.slamsComplete ?? 0)*10
  if (score >= 200) return { title:'Saltgrass Legend', icon:'👑' }
  if (score >= 100) return { title:'Old Salt', icon:'🧭' }
  if (score >= 40)  return { title:'Regular', icon:'⚓' }
  if (score >= 10)  return { title:'Getting Wet', icon:'🌊' }
  return { title:'Greenhorn', icon:'🌱' }
}
