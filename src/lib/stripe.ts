// src/lib/stripe.ts
// Run first: npm install stripe @stripe/stripe-js @stripe/react-stripe-js

import Stripe from 'stripe'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'sk_test_REPLACE_ME',
  { apiVersion: '2026-04-22.dahlia' }
)

export const STRIPE_PRICES = {
  vendor: {
    verified: {
      monthly: process.env.STRIPE_PRICE_VENDOR_VERIFIED_MONTHLY ?? 'price_REPLACE',
      annual:  process.env.STRIPE_PRICE_VENDOR_VERIFIED_ANNUAL  ?? 'price_REPLACE',
    },
    featured: {
      monthly: process.env.STRIPE_PRICE_VENDOR_FEATURED_MONTHLY ?? 'price_REPLACE',
      annual:  process.env.STRIPE_PRICE_VENDOR_FEATURED_ANNUAL  ?? 'price_REPLACE',
    },
    pro: {
      monthly: process.env.STRIPE_PRICE_VENDOR_PRO_MONTHLY ?? 'price_REPLACE',
      annual:  process.env.STRIPE_PRICE_VENDOR_PRO_ANNUAL  ?? 'price_REPLACE',
    },
  },
  promotedListing: process.env.STRIPE_PRICE_PROMOTED_LISTING ?? 'price_REPLACE',
}

export const COMMISSION_RATE = 0.08

export function calcFees(priceCents: number) {
  const commission = Math.round(priceCents * COMMISSION_RATE)
  const stripeFee  = Math.round(priceCents * 0.029) + 30
  const payout     = priceCents - commission - stripeFee
  return { commission, stripeFee, payout, total: priceCents }
}
