// src/lib/slams.ts
// Florida slams + life-list collections. Read against the catch log (the moat).
// A slam = a defined set of species. Personal bests = biggest of each species.

export interface Slam {
  id: string
  name: string
  icon: string
  blurb: string
  species: string[]          // species names (lowercase match against catch log)
  tier: 'classic' | 'challenge' | 'legend'
}

// Species matching is case-insensitive and substring-friendly
// (so "Slot Redfish" or "Redfish" both count toward "redfish").
export const SLAMS: Slam[] = [
  {
    id:'inshore', name:'Inshore Slam', icon:'🎣', tier:'classic',
    blurb:'The classic Florida inshore trifecta.',
    species:['redfish','snook','trout'],
  },
  {
    id:'inshore_grand', name:'Grand Inshore Slam', icon:'🏆', tier:'challenge',
    blurb:'Add a flounder to the classic three.',
    species:['redfish','snook','trout','flounder'],
  },
  {
    id:'flats', name:'Flats Slam', icon:'🌊', tier:'challenge',
    blurb:'The skinny-water sight-fishing crown.',
    species:['redfish','tarpon','bonefish','permit'],
  },
  {
    id:'offshore', name:'Offshore Slam', icon:'⚓', tier:'challenge',
    blurb:'Bluewater pelagics.',
    species:['mahi','wahoo','tuna','kingfish'],
  },
  {
    id:'reef', name:'Reef Slam', icon:'🐠', tier:'classic',
    blurb:'Bottom-fishing the structure.',
    species:['grouper','snapper','hogfish'],
  },
  {
    id:'panhandle', name:'Panhandle Slam', icon:'🏖️', tier:'challenge',
    blurb:'Northwest Florida specialties.',
    species:['redfish','spanish mackerel','pompano','flounder'],
  },
  {
    id:'big5', name:'Florida Big Five', icon:'⭐', tier:'legend',
    blurb:'Five trophy gamefish. The lifetime flex.',
    species:['tarpon','snook','redfish','grouper','mahi'],
  },
]

// Notable species worth tracking on a life list even outside a slam
export const LIFE_LIST_SPECIES = [
  'redfish','snook','trout','flounder','tarpon','bonefish','permit',
  'mahi','wahoo','tuna','kingfish','sailfish','grouper','snapper',
  'hogfish','cobia','pompano','spanish mackerel','sheepshead','jack crevalle',
  'black drum','tripletail','amberjack','mangrove snapper','gag grouper',
]

// Given a list of caught species (strings), compute slam progress.
export function computeSlamProgress(caughtSpecies: string[]) {
  const caughtLower = caughtSpecies.map(s => s.toLowerCase().trim())
  const has = (target: string) =>
    caughtLower.some(c => c.includes(target) || target.includes(c))

  return SLAMS.map(slam => {
    const got = slam.species.filter(has)
    return {
      ...slam,
      caught: got,
      missing: slam.species.filter(s => !has(s)),
      complete: got.length === slam.species.length,
      progress: got.length / slam.species.length,
    }
  })
}
