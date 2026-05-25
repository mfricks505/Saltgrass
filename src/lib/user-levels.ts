// src/lib/user-levels.ts

export type UserLevel = 1 | 2 | 3

export const LEVEL_CONFIG = {
  1: {
    name: 'Member',
    badge: null,
    color: '#8A866E',
    features: [
      'Browse The Board',
      'Read fishing & hunting reports',
      'Check The Rundown',
      'Browse The Wall',
      'Browse The Market listings',
      'Browse Guides directory',
    ],
    locked: [
      'Post to The Board',
      'Buy or sell on The Market',
      'Book a guide',
      'Join a Crew Up trip',
    ],
  },
  2: {
    name: 'Verified Member',
    badge: 'Phone Verified',
    color: '#D4982E',
    features: [
      'Everything in Level 1',
      'Post to The Board',
      'View The Wall',
      'Browse all gear listings',
      'See guide contact info',
    ],
    locked: [
      'Buy or sell on The Market',
      'Book a guide',
      'Join or post a Crew Up trip',
    ],
  },
  3: {
    name: 'Trusted Member',
    badge: 'ID Verified',
    color: '#7AE07A',
    features: [
      'Everything in Level 2',
      'Buy & sell on The Market',
      'Book guides through the app',
      'Join & post Crew Up trips',
      'Trusted badge on profile',
    ],
    locked: [],
  },
}

export const FEATURE_REQUIREMENTS: Record<string, UserLevel> = {
  post_board:   2,
  market_buy:   3,
  market_sell:  3,
  book_guide:   3,
  crewup_join:  3,
  crewup_post:  3,
  message_user: 2,
}

export function canAccess(userLevel: UserLevel, feature: string): boolean {
  const required = FEATURE_REQUIREMENTS[feature] ?? 1
  return userLevel >= required
}

export function getUpgradeTarget(feature: string): UserLevel {
  return FEATURE_REQUIREMENTS[feature] ?? 1
}
