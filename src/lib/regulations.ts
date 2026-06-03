// src/lib/regulations.ts
// Florida saltwater fishing regulations — quick reference.
//
// ⚠️ IMPORTANT: Regulations change. These are seeded from FWC rules but MUST
// be verified against myfwc.com/fishing/saltwater/recreational before relying on them.
// The UI shows a "verify with FWC" link on every result. Update seasonally.
//
// Data structure supports: size limits, bag limits, season open/close, region notes.

export interface Regulation {
  species: string
  aka?: string[]                       // alternate names for search
  category: 'inshore' | 'offshore' | 'both'
  minSize?: number                     // inches
  maxSize?: number                     // inches (for slot limits)
  slotMin?: number
  slotMax?: number
  bagLimit?: number | string           // per harvester per day
  season: {
    status: 'open-year-round' | 'seasonal' | 'closed'
    openMonths?: number[]              // 1-12 if seasonal
    note?: string
  }
  gulf?: { minSize?: number; bag?: number | string; seasonNote?: string }
  atlantic?: { minSize?: number; bag?: number | string; seasonNote?: string }
  notes?: string
}

// Month helper
const M = { JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12 }

export const FL_REGULATIONS: Regulation[] = [
  {
    species: 'Redfish', aka: ['red drum','red','spottail'],
    category: 'inshore',
    slotMin: 18, slotMax: 27,
    bagLimit: 1,
    season: { status: 'open-year-round' },
    notes: 'Slot limit 18"–27". 1 per harvester per day. Regional bag rules vary — NE, NW, and South zones differ. Verify your zone.',
  },
  {
    species: 'Snook', aka: ['linesider','robalo'],
    category: 'inshore',
    slotMin: 28, slotMax: 32,           // Gulf slot
    bagLimit: 1,
    season: { status: 'seasonal', openMonths: [M.MAR,M.APR,M.SEP,M.OCT,M.NOV], note: 'Gulf: open Mar 1–Apr 30 & Sep 1–Nov 30. Closed otherwise.' },
    gulf: { minSize: 28, bag: 1, seasonNote: 'Slot 28–32". Closed Dec–Feb, May–Aug.' },
    atlantic: { minSize: 28, bag: 1, seasonNote: 'Slot 28–32". Closed Dec 15–Jan 31, Jun–Aug.' },
    notes: 'Snook permit required in addition to saltwater license. Slot and season differ Gulf vs Atlantic.',
  },
  {
    species: 'Speckled Trout', aka: ['spotted seatrout','trout','specks'],
    category: 'inshore',
    slotMin: 15, slotMax: 19,
    bagLimit: 3,
    season: { status: 'open-year-round', note: 'Bag limits vary by zone (3–5). One over 19" allowed in some zones.' },
    notes: 'Slot 15"–19". One fish over 19" per vessel allowed in most zones. Check your management zone.',
  },
  {
    species: 'Flounder', aka: ['fluke','southern flounder'],
    category: 'inshore',
    minSize: 14,
    bagLimit: 5,
    season: { status: 'seasonal', note: 'Closed Oct 15–Nov 30 statewide for spawning run.' },
    notes: '14" minimum. 5 per harvester. Closed mid-Oct to end of Nov.',
  },
  {
    species: 'Sheepshead', aka: ['convict fish','bait stealer'],
    category: 'inshore',
    minSize: 12,
    bagLimit: 8,
    season: { status: 'open-year-round', note: 'During March: 15 fish vessel limit max during spawning aggregation.' },
    notes: '12" minimum, 8 per harvester.',
  },
  {
    species: 'Gag Grouper', aka: ['gag','grouper','grey grouper'],
    category: 'offshore',
    minSize: 24,
    bagLimit: 2,
    season: { status: 'seasonal', openMonths: [M.SEP,M.OCT,M.NOV,M.DEC], note: 'Gulf state waters: typically Sep 1–Dec 31. Dates shift yearly — VERIFY.' },
    gulf: { minSize: 24, bag: 2, seasonNote: 'Season dates set annually by FWC. Often Sep–Dec.' },
    notes: '24" minimum in Gulf. Season is set yearly and changes — always verify current dates with FWC before keeping.',
  },
  {
    species: 'Red Snapper', aka: ['snapper','american red snapper','ars'],
    category: 'offshore',
    minSize: 16,
    bagLimit: 2,
    season: { status: 'seasonal', note: 'Gulf recreational season is short — set annually (often summer weekends + holidays). VERIFY current open days.' },
    gulf: { minSize: 16, bag: 2, seasonNote: 'Very limited season, announced yearly by FWC.' },
    notes: '16" minimum Gulf. The season is tightly regulated and changes every year — do not keep without confirming open days.',
  },
  {
    species: 'Mangrove Snapper', aka: ['gray snapper','mango'],
    category: 'both',
    minSize: 10,
    bagLimit: 5,
    season: { status: 'open-year-round' },
    notes: '10" minimum, 5 per harvester (within 10-snapper aggregate).',
  },
  {
    species: 'Cobia', aka: ['ling','lemonfish'],
    category: 'nearshore' as any,
    minSize: 36,
    bagLimit: 1,
    season: { status: 'open-year-round', note: 'Gulf: 1 per person, 2 per vessel max.' },
    notes: '36" fork length minimum. Gulf limit reduced — 1 per person / 2 per vessel.',
  },
  {
    species: 'Spanish Mackerel', aka: ['spanish','macks'],
    category: 'nearshore' as any,
    minSize: 12,
    bagLimit: 15,
    season: { status: 'open-year-round' },
    notes: '12" fork length, 15 per harvester.',
  },
  {
    species: 'King Mackerel', aka: ['kingfish','king','smoker'],
    category: 'offshore',
    minSize: 24,
    bagLimit: 2,
    season: { status: 'open-year-round' },
    notes: '24" fork length minimum, 2 per harvester.',
  },
  {
    species: 'Tripletail', aka: ['blackfish'],
    category: 'nearshore' as any,
    minSize: 18,
    bagLimit: 2,
    season: { status: 'open-year-round' },
    notes: '18" minimum, 2 per harvester.',
  },
  {
    species: 'Pompano', aka: ['florida pompano'],
    category: 'inshore',
    minSize: 11,
    bagLimit: 6,
    season: { status: 'open-year-round' },
    notes: '11" minimum, 6 per harvester.',
  },
  {
    species: 'Black Drum', aka: ['drum'],
    category: 'inshore',
    slotMin: 14, slotMax: 24,
    bagLimit: 5,
    season: { status: 'open-year-round' },
    notes: 'Slot 14"–24", 5 per harvester. One over 24" allowed per harvester.',
  },
  {
    species: 'Tarpon', aka: ['silver king','poon'],
    category: 'inshore',
    bagLimit: 'Catch & release only',
    season: { status: 'open-year-round', note: 'No harvest. Tarpon tag required only for pursuit of state/world record.' },
    notes: 'Catch and release only. Fish over 40" must remain in water. No harvest without a $50 tag (record pursuit only).',
  },
]

export function isInSeason(reg: Regulation, date = new Date()): { open: boolean; label: string } {
  const month = date.getMonth() + 1
  if (reg.season.status === 'open-year-round') return { open: true, label: 'Open year-round' }
  if (reg.season.status === 'closed') return { open: false, label: 'Closed' }
  if (reg.season.openMonths?.length) {
    const open = reg.season.openMonths.includes(month)
    return { open, label: open ? 'Open now' : 'Closed now' }
  }
  return { open: true, label: 'Check dates' }
}

export function searchRegs(query: string): Regulation[] {
  const q = query.toLowerCase().trim()
  if (!q) return FL_REGULATIONS
  return FL_REGULATIONS.filter(r =>
    r.species.toLowerCase().includes(q) ||
    r.aka?.some(a => a.toLowerCase().includes(q))
  )
}
