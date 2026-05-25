// src/lib/fwc-verify.ts
// FWC public records + USCG NMC lookup for guide license verification

import { createAdminSupabase } from '@/lib/supabase-server'

const FWC_FILES: Record<string, string> = {
  fishing_guide:  'https://myfwc.com/media/4999/fishing-guide-licenses.csv',
  hunting_guide:  'https://myfwc.com/media/5001/hunting-guide-licenses.csv',
  freshwater:     'https://myfwc.com/media/5003/freshwater-guide-licenses.csv',
}

export interface FWCResult {
  found: boolean
  name?: string
  licenseNumber?: string
  expires?: string
  status?: string
  error?: string
}

export interface USCGResult {
  found: boolean
  name?: string
  credential?: string
  expires?: string
  status?: string
  error?: string
}

async function fetchWithCache(url: string, cacheKey: string): Promise<string | null> {
  const supabase = createAdminSupabase()

  // Check cache (24hr TTL)
  const { data: cached } = await supabase
    .from('fwc_license_cache')
    .select('content, fetched_at')
    .eq('cache_key', cacheKey)
    .single()

  if (cached) {
    const age = Date.now() - new Date(cached.fetched_at).getTime()
    if (age < 24 * 60 * 60 * 1000) return cached.content
  }

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Saltgrass/1.0' } })
    if (!res.ok) return null
    const content = await res.text()

    await supabase.from('fwc_license_cache').upsert({
      cache_key: cacheKey,
      content,
      fetched_at: new Date().toISOString(),
    }, { onConflict: 'cache_key' })

    return content
  } catch {
    return null
  }
}

export async function verifyFWCLicense(
  lastName: string,
  licenseNumber: string | undefined,
  guideType: keyof typeof FWC_FILES = 'fishing_guide'
): Promise<FWCResult> {
  const url = FWC_FILES[guideType]
  if (!url) return { found: false, error: 'Unknown guide type' }

  const content = await fetchWithCache(url, `fwc_${guideType}`)
  if (!content) return { found: false, error: 'Could not fetch FWC records' }

  const lines = content.split('\n')
  const lastNameUpper = lastName.trim().toUpperCase()

  for (const line of lines) {
    // Pipe-delimited or CSV
    const cols = line.includes('|') ? line.split('|') : line.split(',')
    if (cols.length < 3) continue

    const rowLastName = cols[0]?.trim().toUpperCase() ?? ''
    const rowLicense  = cols[2]?.trim() ?? ''

    if (rowLastName === lastNameUpper) {
      if (!licenseNumber || rowLicense === licenseNumber.trim()) {
        return {
          found:         true,
          name:          `${cols[1]?.trim()} ${cols[0]?.trim()}`,
          licenseNumber: rowLicense,
          expires:       cols[3]?.trim(),
          status:        cols[4]?.trim() ?? 'Active',
        }
      }
    }
  }

  return { found: false }
}

export async function verifyUSCGLicense(
  credentialNumber: string,
  lastName: string
): Promise<USCGResult> {
  // USCG NMC public credential lookup
  const url = `https://www.dco.uscg.mil/Our-Organization/Assistant-Commandant-for-Prevention-Policy-CG-5P/Merchant-Marine-Personnel-Advisory-Committee-MERPAC/Find-a-Mariner/?credential=${encodeURIComponent(credentialNumber)}`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Saltgrass/1.0' },
    })
    if (!res.ok) return { found: false, error: 'USCG lookup unavailable' }

    const html = await res.text()

    // Parse credential info from HTML response
    const nameMatch    = html.match(/Last Name[:\s]*<[^>]*>([^<]+)/i)
    const expireMatch  = html.match(/Expiration[:\s]*<[^>]*>([^<]+)/i)
    const statusMatch  = html.match(/Status[:\s]*<[^>]*>([^<]+)/i)

    if (!nameMatch) return { found: false }

    const foundLastName = nameMatch[1]?.trim().toUpperCase()
    if (foundLastName !== lastName.trim().toUpperCase()) {
      return { found: false, error: 'Name does not match credential' }
    }

    return {
      found:      true,
      name:       nameMatch[1]?.trim(),
      credential: credentialNumber,
      expires:    expireMatch?.[1]?.trim(),
      status:     statusMatch?.[1]?.trim() ?? 'Active',
    }
  } catch {
    return { found: false, error: 'USCG lookup failed' }
  }
}
