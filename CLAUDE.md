@AGENTS.md

# SALTGRASS — Project Context

## Tech Stack
- **Framework**: Next.js App Router (no `output: 'export'` — API routes run on Vercel)
- **Database**: Supabase (PostgreSQL + RLS + realtime)
- **Auth**: Supabase Auth (email/password + magic link)
- **Payments**: Stripe (subscriptions, PaymentIntents, Stripe Identity)
- **SMS**: Twilio (phone verification codes)
- **Email**: Resend (transactional)
- **Mobile**: Capacitor — loads live Vercel URL via `server.url`, no static export needed
- **Deployment**: Vercel (web) + Capacitor Android/iOS (mobile)

## Brand & Design System
- **Colors**: bg `#2C3025`, surf `#3D4535`, card `#333B2C`, sil `#1A1E14`
- **Text**: sun `#E8DFC8`, sub `#B8B49A`, dust `#8A866E`
- **Accent**: `#D4982E` (gold), green `#7AE07A`
- **Fonts**: Oswald (headers, labels), Inter (body)
- **Border**: `rgba(232,223,200,0.10)`
- All inline styles — no Tailwind, no CSS modules

## App Sections (Nav)
- **The Board** — community feed (post_board requires L2)
- **The Rundown** — NOAA buoy, tides, moon, weather
- **The Wall** — photo/media wall (view requires L2)
- **The Market** — gear buy/sell (buy/sell requires L3)
- **Guides** — fishing/hunting guide directory + booking (book requires L3)
- **Crew Up** — find fishing partners (join/post requires L3)

## User Level System
| Level | Name | How | Unlocks |
|-------|------|-----|---------|
| L1 | Member | Free signup | Browse all sections |
| L2 | Verified Member | Phone verify (Twilio SMS, free) | Post to Board, message members, see guide contacts |
| L3 | Trusted Member | ID verify ($2.99 Stripe Identity) | Market buy/sell, book guides, join/post Crew Up |

- Level auto-set by DB trigger when `phone_verified` or `id_verified` flips
- Phone verification: `phone_verifications` table, 6-digit code, 10min TTL
- ID verification: Stripe Identity session, $2.99 one-time charge

## Monetization
| Revenue | Amount | Who pays |
|---------|--------|----------|
| Guide Pro subscription | $19.99/mo | Guides |
| Guide Elite subscription | $99/yr | Guides |
| Guide booking fee | 10% of trip | Members (added to total) |
| ID verification | $2.99 one-time | Members |
| Market featured listing | $4.99/7 days | Sellers |
| Crew Up convenience fee | $2/booking | Crew members |

## Supabase Tables
- `profiles` — `id`, `level`, `phone`, `phone_verified`, `phone_verified_at`, `id_verified`, `id_verified_at`, `name`, `email`
- `guides` — `id`, `user_id`, `name`, `email`, `business_name`, `guide_type`, `plan`, `is_verified`, `is_founding`, `verification_status`, `fwc_verified`, `uscg_verified`, `fwc_license_number`, `uscg_credential_number`, `stripe_customer_id`, `stripe_subscription_id`, `trial_started_at`, `trial_ends_at`, `verified_at`, `revenue_cents`
- `guide_bookings` — `id`, `guide_id`, `user_id`, `date`, `party_size`, `notes`, `trip_price_cents`, `platform_fee_cents`, `total_cents`, `status`, `stripe_payment_intent`, `confirmed_at`, `completed_at`
- `phone_verifications` — `id`, `user_id`, `phone`, `code`, `expires_at`, `used`
- `fwc_license_cache` — `cache_key`, `content`, `fetched_at`
- `board_posts` — community feed posts
- `wall_posts` — photo wall
- `listings` — market gear listings
- `crew_bookings` — crew up bookings
- `feedback` — `type`, `message`, `page`, `user_id`
- `payment_events` — payment failure dunning log
- `reports` — content reports

## DB Triggers
- `on_profile_phone_verified` — when `phone_verified` becomes true, set `level = 2` (if level < 2)
- `on_profile_id_verified` — when `id_verified` becomes true, set `level = 3`

## Environment Variables
```
# Public (client-safe)
NEXT_PUBLIC_APP_URL=https://saltgrass-3scu.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://fsbeppsrcmfmashhzesl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_ADMIN_EMAIL=...

# Server-only
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
RESEND_API_KEY=...
```

## Critical Rules

### API calls — ALWAYS use NEXT_PUBLIC_APP_URL
All `fetch()` calls to internal API routes must be:
```ts
fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/...`)
```
Relative paths (`/api/...`) do not work in Capacitor mobile context.

### No output: 'export'
`next.config.ts` must NOT have `output: 'export'` — it breaks all API routes.
Capacitor uses `server.url` pointing at the live Vercel deployment.

### Supabase clients
- Browser components: `import { createClient } from '@/lib/supabase'`
- API routes / server: `import { createAdminSupabase } from '@/lib/supabase-server'`

### Stripe webhook verification
Manual HMAC — no Stripe library:
```ts
const expected = crypto.createHmac('sha256', STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${body}`).digest('hex')
```

### Guide booking escrow
PaymentIntents use `capture_method: 'manual'` — hold funds until trip complete, then PATCH to `/api/guides/booking` captures.

## Founding Guide Program
- 50 slots total, permanent badge
- 90 days free trial (card collected at signup)
- After trial: Pro $19.99/mo or Elite $99/yr
- All founding guides get `is_founding: true` in DB

## Capacitor Mobile Strategy
- `webDir: 'out'` — only used for local dev builds
- `server.url: 'https://saltgrass-3scu.vercel.app'` — production app loads live site
- No native plugins needed beyond standard Capacitor core
- Android keystore: `saltgrass-release.keystore`, alias `saltgrass`

## Deployment
1. `git push` → Vercel auto-deploys
2. For mobile: `npx cap sync android` → `npx cap open android` → build APK/AAB in Android Studio
