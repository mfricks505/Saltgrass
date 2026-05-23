'use client'
// src/app/crewup/page.tsx

import { useState } from 'react'
import { REGIONS } from '@/lib/types'
import Link from 'next/link'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358', bark:'#1A1208', danger:'#C8452A' }

// Platform fee — like Uber's service fee
const PLATFORM_FEE_PCT = 0.10  // 10%

const TRIPS = [
  { id: 1, captain: 'RiverRoller88', captain_rating: 4.9, captain_trips: 34, avatar: '🧔', type: 'fishing', title: 'Inshore Redfish — Pensacola Bay', description: 'Half-day inshore trip Saturday at 5am. Targeting redfish and speckled trout. 22ft Pathfinder, 150 Yamaha. Light tackle provided. Back by noon.', region: 'panhandle', region_icon: '🏖️', region_label: 'Panhandle', departure: 'Bayou Chico Boat Ramp, Pensacola', destination: 'Pensacola Bay Flats', date: 'Sat Jun 7', time: '5:00 AM', return_time: '12:00 PM', seats_total: 3, seats_filled: 1, cost_per_person: 45, cost_covers: 'Fuel + ramp fee', vessel: '2021 Pathfinder 22 HPS', verified: true, tags: ['Redfish', 'Speckled Trout', 'Inshore'] },
  { id: 2, captain: 'SwampBuckHunter', captain_rating: 5.0, captain_trips: 12, avatar: '🧢', type: 'hunting', title: 'Hog Hunt — Private Ranch, Ocala', description: 'Friday night into Saturday morning on a 400-acre private ranch. Spot and stalk plus feeder stands. ATV access. .308 available if needed.', region: 'centralfl', region_icon: '🐊', region_label: 'Central Florida', departure: 'Loves Truck Stop, I-75 Exit 358', destination: 'Private Ranch — Ocala Area', date: 'Fri Jun 6', time: '7:00 PM', return_time: 'Sat 10:00 AM', seats_total: 2, seats_filled: 0, cost_per_person: 60, cost_covers: 'Gas + land access', vessel: 'F-250 + ATV trailer', verified: true, tags: ['Hog Hunting', 'Night Hunt', 'Private Land'] },
  { id: 3, captain: 'FlatsDrifter', captain_rating: 4.8, captain_trips: 67, avatar: '🎣', type: 'fishing', title: 'Offshore Mahi — Miami to the Edge', description: 'Running 40+ miles offshore Sunday for mahi. 31ft Contender. Experienced crew only. All tackle included. Split fuel 3 ways.', region: 'sefl', region_icon: '🦈', region_label: 'SE Florida', departure: 'Crandon Park Marina, Key Biscayne', destination: 'The Edge — 40+ miles out', date: 'Sun Jun 8', time: '5:30 AM', return_time: '4:00 PM', seats_total: 2, seats_filled: 1, cost_per_person: 120, cost_covers: 'Fuel split, all tackle', vessel: '2019 Contender 31 ST', verified: true, tags: ['Mahi-Mahi', 'Offshore', 'Experienced Only'] },
]

function Stars({ rating }: { rating: number }) {
  return <span style={{ color: B.copper, fontSize: 11 }}>{'★'.repeat(Math.floor(rating))}<span style={{ color: B.dust, marginLeft: 4 }}>{rating}</span></span>
}

function FeeBreakdown({ costPerPerson }: { costPerPerson: number }) {
  const platformFee = Math.round(costPerPerson * PLATFORM_FEE_PCT)
  const total = costPerPerson + platformFee
  return (
    <div style={{ background: B.bark, borderRadius: 4, padding: '12px 14px', marginTop: 10, border: `1px solid ${B.canopy}` }}>
      <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 2, color: B.dust, marginBottom: 10 }}>COST BREAKDOWN</div>
      {[
        { label: 'Trip cost (fuel & access)', val: `$${costPerPerson}` },
        { label: `Saltgrass platform fee (${PLATFORM_FEE_PCT * 100}%)`, val: `$${platformFee}` },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${B.canopy}` }}>
          <span style={{ fontSize: 12, color: B.parchment }}>{r.label}</span>
          <span style={{ fontSize: 12, color: B.bone, fontWeight: 600 }}>{r.val}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0' }}>
        <span style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 1, color: B.bone }}>TOTAL YOU PAY</span>
        <span style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 18, color: B.copper }}>${total}</span>
      </div>
      <div style={{ fontSize: 11, color: B.dust, marginTop: 8, lineHeight: 1.6 }}>
        The platform fee covers secure payment, identity verification, dispute resolution, and the auto-generated float plan.
      </div>
    </div>
  )
}

function TripCard({ trip, onBook, onFloatPlan }: { trip: typeof TRIPS[0]; onBook: () => void; onFloatPlan: () => void }) {
  const seatsLeft = trip.seats_total - trip.seats_filled
  const platformFee = Math.round(trip.cost_per_person * PLATFORM_FEE_PCT)
  const total = trip.cost_per_person + platformFee

  return (
    <div style={{ background: B.forest, border: `1px solid ${B.canopy}`, borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
      <div style={{ background: trip.type === 'fishing' ? '#0F1A2A' : '#1A2B1A', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: trip.type === 'fishing' ? '#5A9FD4' : B.copper }}>
          {trip.type === 'fishing' ? '🎣 FISHING' : '🏹 HUNTING'}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: B.dust }}>{trip.region_icon} {trip.region_label}</span>
          {trip.verified && <span style={{ background: 'rgba(200,146,42,0.2)', color: B.copper, borderRadius: 4, padding: '1px 7px', fontSize: 9, fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: 1 }}>VERIFIED</span>}
        </div>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1C2E1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: `2px solid ${B.canopy}`, flexShrink: 0 }}>{trip.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: B.bone }}>@{trip.captain}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Stars rating={trip.captain_rating} /><span style={{ fontSize: 10, color: B.dust }}>{trip.captain_trips} trips</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 20, color: B.copper }}>${total}</div>
            <div style={{ fontSize: 9, color: B.dust }}>total per person</div>
            <div style={{ fontSize: 9, color: B.dust }}>(incl. ${platformFee} fee)</div>
          </div>
        </div>

        <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 15, letterSpacing: 1, color: B.bone, marginBottom: 6 }}>{trip.title}</div>
        <div style={{ fontSize: 12, color: B.parchment, lineHeight: 1.7, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{trip.description}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 12 }}>
          {[['📅', 'DATE', trip.date], ['⏰', 'DEPARTS', trip.time], ['📍', 'MEET AT', trip.departure], ['⛵', 'VESSEL', trip.vessel]].map(([icon, label, val]) => (
            <div key={String(label)} style={{ background: B.moss, borderRadius: 4, padding: '8px 10px' }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 2, color: B.dust, marginBottom: 2 }}>{icon} {label}</div>
              <div style={{ fontSize: 11, color: B.bone, fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Seats */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust }}>SEATS</div>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, color: seatsLeft === 0 ? B.danger : B.copper }}>{seatsLeft === 0 ? 'FULL' : `${seatsLeft} LEFT`}</div>
          </div>
          <div style={{ height: 5, background: B.canopy, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(trip.seats_filled / trip.seats_total) * 100}%`, background: seatsLeft === 0 ? B.danger : B.copper, borderRadius: 3 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {trip.tags.map(t => <span key={t} style={{ background: B.moss, color: B.parchment, borderRadius: 4, padding: '2px 8px', fontSize: 10 }}>#{t}</span>)}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onFloatPlan} style={{ flex: 1, background: 'transparent', color: B.parchment, border: `1.5px solid ${B.canopy}`, borderRadius: 4, padding: '10px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, cursor: 'pointer' }}>
            📋 FLOAT PLAN
          </button>
          <button onClick={onBook} disabled={seatsLeft === 0} style={{ flex: 2, background: seatsLeft === 0 ? B.canopy : B.copper, color: seatsLeft === 0 ? B.dust : '#0A0C08', border: 'none', borderRadius: 4, padding: '10px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 1, cursor: seatsLeft === 0 ? 'not-allowed' : 'pointer' }}>
            {seatsLeft === 0 ? 'TRIP FULL' : `REQUEST SEAT — $${total}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function FloatPlanModal({ trip, onClose }: { trip: typeof TRIPS[0]; onClose: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [copied, setCopied] = useState(false)
  const plan = `SALTGRASS FLOAT PLAN\nGenerated: ${new Date().toLocaleString()}\n${'━'.repeat(40)}\n\nTRIP: ${trip.title}\nCAPTAIN: @${trip.captain}\nDATE: ${trip.date}\nDEPARTS: ${trip.time} from ${trip.departure}\nDESTINATION: ${trip.destination}\nEXPECTED RETURN: ${trip.return_time}\nVESSEL: ${trip.vessel}\nSOULS ABOARD: ${trip.seats_filled + 1}\n\nEMERGENCY CONTACT: ${name || '[NAME]'}\nPHONE: ${phone || '[PHONE]'}\n\n${'━'.repeat(40)}\nIf vessel not returned by ${trip.return_time}, contact:\nUS Coast Guard: VHF Channel 16\nEmergency: 1-800-424-8802\n\nGenerated by Saltgrass — saltgrass-3scu.vercel.app`

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: B.forest, borderRadius: 8, padding: 26, maxWidth: 500, width: '100%', border: `1px solid ${B.canopy}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.copper, marginBottom: 3 }}>CREW UP</div>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 18, letterSpacing: 2, color: B.bone }}>FLOAT PLAN</div>
          </div>
          <button onClick={onClose} style={{ background: B.moss, border: 'none', borderRadius: 4, color: B.dust, padding: '5px 10px', cursor: 'pointer' }}>✕</button>
        </div>

        <p style={{ fontSize: 12, color: B.dust, lineHeight: 1.7, marginBottom: 16 }}>
          File this with someone on shore before you launch. The Coast Guard recommends it. Takes 30 seconds.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div>
            <label style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 5 }}>EMERGENCY CONTACT</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Wife, buddy, family..." style={{ background: B.bark, border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.bone, fontSize: 13, padding: '9px 12px', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 5 }}>PHONE NUMBER</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(850) 555-0100" style={{ background: B.bark, border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.bone, fontSize: 13, padding: '9px 12px', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ background: B.bark, borderRadius: 4, padding: 14, marginBottom: 16, fontFamily: 'monospace', fontSize: 11, color: B.parchment, lineHeight: 1.8, whiteSpace: 'pre-line', border: `1px solid ${B.canopy}` }}>
          {plan}
        </div>

        <div style={{ background: 'rgba(200,69,42,0.08)', border: `1px solid ${B.danger}44`, borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.danger, marginBottom: 4 }}>US COAST GUARD</div>
          <div style={{ fontSize: 11, color: B.parchment, lineHeight: 1.6 }}>VHF Channel 16 · Emergency: <strong style={{ color: B.bone }}>1-800-424-8802</strong></div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: copied ? '✓ COPIED' : '📋 COPY', action: () => { navigator.clipboard.writeText(plan); setCopied(true); setTimeout(() => setCopied(false), 2000) } },
            { label: '📧 EMAIL', action: () => window.open(`mailto:?subject=${encodeURIComponent('Float Plan — ' + trip.title)}&body=${encodeURIComponent(plan)}`) },
            { label: '🖨️ PRINT', action: () => window.print() },
          ].map(b => (
            <button key={b.label} onClick={b.action} style={{ flex: 1, background: B.moss, color: B.bone, border: `1px solid ${B.canopy}`, borderRadius: 4, padding: '10px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, cursor: 'pointer' }}>{b.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function BookingModal({ trip, onClose }: { trip: typeof TRIPS[0]; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const platformFee = Math.round(trip.cost_per_person * PLATFORM_FEE_PCT)
  const total = trip.cost_per_person + platformFee

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: B.forest, borderRadius: 8, padding: 26, maxWidth: 460, width: '100%', border: `1px solid ${B.canopy}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 16, letterSpacing: 2, color: B.bone }}>
            {step === 1 ? 'REQUEST SEAT' : step === 2 ? 'CONFIRM & PAY' : 'REQUEST SENT'}
          </div>
          <button onClick={onClose} style={{ background: B.moss, border: 'none', borderRadius: 4, color: B.dust, padding: '5px 10px', cursor: 'pointer' }}>✕</button>
        </div>

        {step === 1 && (
          <div>
            <div style={{ background: B.moss, borderRadius: 6, padding: 14, marginBottom: 16 }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, color: B.bone, marginBottom: 4 }}>{trip.title}</div>
              <div style={{ fontSize: 12, color: B.dust }}>{trip.date} · {trip.time} · @{trip.captain}</div>
            </div>
            <FeeBreakdown costPerPerson={trip.cost_per_person} />
            <div style={{ marginTop: 16, fontSize: 12, color: B.dust, lineHeight: 1.7, marginBottom: 16 }}>
              Your request goes to the captain for approval. Payment is only charged after the captain accepts. Both sides are verified Saltgrass members.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.parchment, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>CANCEL</button>
              <button onClick={() => setStep(2)} style={{ flex: 2, background: B.copper, color: '#0A0C08', border: 'none', borderRadius: 4, padding: '12px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>CONTINUE →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 13, color: B.parchment, lineHeight: 1.7, marginBottom: 16 }}>
              Payment of <strong style={{ color: B.copper }}>${total}</strong> will be held securely and only released to the captain after your trip is complete. If the captain cancels or you don't go out, you get a full refund.
            </div>
            <div style={{ background: B.moss, borderRadius: 6, padding: 16, marginBottom: 16, textAlign: 'center', border: `1px solid ${B.canopy}` }}>
              <div style={{ fontSize: 12, color: B.dust, marginBottom: 4 }}>SECURE PAYMENT</div>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 28, color: B.copper }}>${total}</div>
              <div style={{ fontSize: 11, color: B.dust, marginTop: 4 }}>Held in escrow until trip completes</div>
            </div>
            <div style={{ background: 'rgba(200,146,42,0.08)', border: `1px solid ${B.copper}44`, borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: B.parchment, lineHeight: 1.6 }}>
              📋 <strong style={{ color: B.copper }}>Float plan auto-generated</strong> after captain confirms. You'll receive it by email to share with someone on shore.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.parchment, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>← BACK</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, background: B.copper, color: '#0A0C08', border: 'none', borderRadius: 4, padding: '12px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>
                CONFIRM & PAY ${total}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>⛵</div>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 18, letterSpacing: 2, color: B.bone, marginBottom: 8 }}>REQUEST SENT!</div>
            <div style={{ fontSize: 13, color: B.parchment, lineHeight: 1.8, marginBottom: 20 }}>
              @{trip.captain} will review your profile and confirm within 24 hours. You'll get a notification when they respond. Float plan sent to your email after confirmation.
            </div>
            <div style={{ background: B.moss, borderRadius: 6, padding: 14, marginBottom: 20, fontSize: 12, color: B.dust, lineHeight: 1.7 }}>
              💡 While you wait — check your profile is complete and has a photo. Captains are more likely to confirm members with a full profile.
            </div>
            <button onClick={onClose} style={{ background: B.copper, color: '#0A0C08', border: 'none', borderRadius: 4, padding: '12px 28px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}>
              DONE
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PostTripModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ type: 'fishing', title: '', description: '', region_id: '', departure: '', destination: '', date: '', time: '', return_time: '', seats: '2', cost_per_person: '', cost_covers: '', vessel: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const captainPayout = form.cost_per_person ? Number(form.cost_per_person) : 0
  const totalPerSeat = form.cost_per_person ? Math.round(captainPayout * (1 + PLATFORM_FEE_PCT)) : 0
  const seats = Number(form.seats)
  const totalRevenue = captainPayout * seats
  const platformEarns = Math.round(totalRevenue * PLATFORM_FEE_PCT)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: B.forest, borderRadius: 8, padding: 26, maxWidth: 560, width: '100%', border: `1px solid ${B.canopy}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 18, letterSpacing: 2, color: B.bone }}>POST A TRIP</div>
          <button onClick={onClose} style={{ background: B.moss, border: 'none', borderRadius: 4, color: B.dust, padding: '5px 10px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['fishing', '🎣 FISHING'], ['hunting', '🏹 HUNTING']].map(([id, label]) => (
              <button key={id} type="button" onClick={() => set('type', id)} style={{ padding: '12px', borderRadius: 4, border: `2px solid ${form.type === id ? B.copper : B.canopy}`, background: form.type === id ? 'rgba(200,146,42,0.12)' : 'transparent', color: form.type === id ? B.copper : B.parchment, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>

          {[
            { key: 'title', label: 'TRIP TITLE', placeholder: 'Inshore Redfish — Pensacola Bay' },
            { key: 'departure', label: 'MEET / DEPARTURE POINT', placeholder: 'Bayou Chico Boat Ramp' },
            { key: 'destination', label: 'DESTINATION', placeholder: 'Pensacola Bay Flats' },
            { key: 'vessel', label: 'VESSEL OR VEHICLE', placeholder: '22ft Pathfinder, F-250 + ATV' },
            { key: 'cost_covers', label: 'COST COVERS', placeholder: 'Fuel + ramp fee' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 5 }}>{label}</label>
              <input value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} style={{ background: B.bark, border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.bone, fontSize: 13, padding: '10px 12px', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['date', 'DATE', 'date'], ['time', 'DEPARTS', 'time'], ['return_time', 'RETURNS', 'time']].map(([key, label, type]) => (
              <div key={key}>
                <label style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 5 }}>{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} style={{ background: B.bark, border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.bone, fontSize: 12, padding: '10px 10px', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 5 }}>OPEN SEATS</label>
              <select value={form.seats} onChange={e => set('seats', e.target.value)} style={{ background: B.bark, border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.bone, fontSize: 13, padding: '10px 12px', width: '100%', outline: 'none', cursor: 'pointer' }}>
                {['1','2','3','4','5','6'].map(n => <option key={n} value={n}>{n} seat{Number(n) !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 5 }}>YOUR COST SHARE PER PERSON ($)</label>
              <input type="number" value={form.cost_per_person} onChange={e => set('cost_per_person', e.target.value)} placeholder="45" style={{ background: B.bark, border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.bone, fontSize: 16, fontWeight: 700, padding: '10px 12px', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Payout preview */}
          {captainPayout > 0 && (
            <div style={{ background: B.bark, borderRadius: 4, padding: '12px 14px', border: `1px solid ${B.canopy}` }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust, marginBottom: 10 }}>EARNINGS PREVIEW</div>
              {[
                { label: `Each crew member pays`, val: `$${totalPerSeat}` },
                { label: `You collect (${seats} seat${seats !== 1 ? 's' : ''} × $${captainPayout})`, val: `$${totalRevenue}` },
                { label: `Saltgrass platform fee (10%)`, val: `-$${platformEarns}` },
                { label: `Your payout`, val: `$${totalRevenue - platformEarns}` },
              ].map((r, i) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 3 ? `1px solid ${B.canopy}` : 'none' }}>
                  <span style={{ fontSize: 11, color: B.parchment }}>{r.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: i === 3 ? B.copper : B.bone }}>{r.val}</span>
                </div>
              ))}
              <div style={{ fontSize: 10, color: B.dust, marginTop: 8, lineHeight: 1.6 }}>Saltgrass handles all payments securely. You get paid after the trip completes.</div>
            </div>
          )}

          <div>
            <label style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 5 }}>REGION</label>
            <select value={form.region_id} onChange={e => set('region_id', e.target.value)} style={{ background: B.bark, border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: form.region_id ? B.bone : B.dust, fontSize: 13, padding: '10px 12px', width: '100%', outline: 'none', cursor: 'pointer' }}>
              <option value="">Select region...</option>
              {REGIONS.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 5 }}>TRIP DETAILS</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Target species, experience level needed, what to bring, what's provided..." style={{ background: B.bark, border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.bone, fontSize: 13, padding: '10px 12px', width: '100%', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
          </div>

          <div style={{ background: 'rgba(200,146,42,0.08)', border: `1px solid ${B.copper}44`, borderRadius: 6, padding: '10px 14px', fontSize: 11, color: B.parchment, lineHeight: 1.6 }}>
            📋 <strong style={{ color: B.copper }}>Float plan auto-generated</strong> when you post. Share it with someone on shore before departure.
          </div>

          <button onClick={onClose} style={{ width: '100%', background: B.copper, color: '#0A0C08', border: 'none', borderRadius: 4, padding: '13px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 14, letterSpacing: 2, cursor: 'pointer' }}>
            POST TRIP & GENERATE FLOAT PLAN
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CrewUpPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedTrip, setSelectedTrip] = useState<typeof TRIPS[0] | null>(null)
  const [floatTrip, setFloatTrip] = useState<typeof TRIPS[0] | null>(null)
  const [showPost, setShowPost] = useState(false)
  const filtered = TRIPS.filter(t => typeFilter === 'all' || t.type === typeFilter)

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0F1A0F, #141F14)', border: '1px solid #243824', borderRadius: 8, padding: '44px 40px 40px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,146,42,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640 }}>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 4, color: B.copper, marginBottom: 8 }}>SALTGRASS</div>
          <h1 style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 44, letterSpacing: 1, color: B.bone, margin: '0 0 14px', textTransform: 'uppercase', lineHeight: 1 }}>CREW UP</h1>
          <p style={{ fontSize: 15, color: B.parchment, maxWidth: 560, lineHeight: 1.8, margin: '0 0 8px' }}>
            Empty seat in the boat? Room in the truck? Post your trip and split the cost with a verified Saltgrass member.
          </p>
          <p style={{ fontSize: 13, color: B.dust, maxWidth: 540, lineHeight: 1.7, margin: '0 0 28px' }}>
            Every member is verified. Every trip generates a float plan. Payments held until the trip completes — just like Uber, but for the water and the woods.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowPost(true)} style={{ background: B.copper, color: '#0A0C08', border: 'none', borderRadius: 4, padding: '13px 26px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}>+ POST A TRIP</button>
            <button style={{ background: 'transparent', color: B.parchment, border: `2px solid ${B.canopy}`, borderRadius: 4, padding: '13px 20px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 2, cursor: 'pointer' }}>📋 MY FLOAT PLANS</button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
        {[
          { n: '01', icon: '🔍', title: 'FIND A TRIP', desc: 'Browse by region and type. Read the captain\'s profile and past crew reviews.' },
          { n: '02', icon: '✅', title: 'REQUEST A SEAT', desc: 'Captain reviews your profile and approves. Payment held until trip completes.' },
          { n: '03', icon: '📋', title: 'GET FLOAT PLAN', desc: 'Auto-generated on confirmation. Email it to someone on shore before you launch.' },
          { n: '04', icon: '⭐', title: 'RATE YOUR CREW', desc: 'Both sides rate after the trip. Good members get more trips. Bad ones get removed.' },
        ].map(s => (
          <div key={s.n} style={{ background: B.forest, border: '1px solid #243824', borderRadius: 8, padding: '16px 14px' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 24, color: B.canopy, marginBottom: 8 }}>{s.n}</div>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 2, color: B.copper, marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 11, color: B.parchment, lineHeight: 1.7 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 10, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
            {[['all', 'ALL TRIPS'], ['fishing', '🎣 FISHING'], ['hunting', '🏹 HUNTING']].map(([id, label]) => (
              <button key={id} onClick={() => setTypeFilter(id)} style={{ padding: '7px 14px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 2, cursor: 'pointer', border: `2px solid ${typeFilter === id ? B.copper : B.canopy}`, background: typeFilter === id ? 'rgba(200,146,42,0.12)' : 'transparent', color: typeFilter === id ? B.copper : B.parchment }}>
                {label}
              </button>
            ))}
          </div>
          {filtered.map(trip => (
            <TripCard key={trip.id} trip={trip} onBook={() => setSelectedTrip(trip)} onFloatPlan={() => setFloatTrip(trip)} />
          ))}
        </div>

        <div style={{ position: 'sticky', top: 72, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: B.forest, borderRadius: 8, padding: 16, border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>HOW SALTGRASS EARNS</div>
            <div style={{ fontSize: 12, color: B.parchment, lineHeight: 1.7, marginBottom: 10 }}>
              Saltgrass charges a <strong style={{ color: B.bone }}>10% platform fee</strong> on each seat, paid by the crew member. The captain receives 100% of what they set as the trip cost.
            </div>
            <div style={{ fontSize: 12, color: B.dust, lineHeight: 1.6 }}>
              The fee covers secure payments, identity verification, dispute resolution, and the float plan system.
            </div>
          </div>

          <div style={{ background: B.forest, borderRadius: 8, padding: 16, border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.danger, marginBottom: 10 }}>🛡️ SAFETY</div>
            <div style={{ fontSize: 12, color: B.parchment, lineHeight: 1.7, marginBottom: 10 }}>
              Every trip auto-generates a float plan. Share it with someone on shore before you go.
            </div>
            <div style={{ fontSize: 11, color: B.dust, lineHeight: 1.6 }}>
              Coast Guard: <strong style={{ color: B.bone }}>VHF Ch 16</strong><br />
              Emergency: <strong style={{ color: B.bone }}>1-800-424-8802</strong>
            </div>
          </div>

          <div style={{ background: B.forest, borderRadius: 8, padding: 16, border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>THE RULES</div>
            {['Verified members only', 'Captain controls the boat. Period.', 'Cost split = fuel & access only', 'Cancellation within 48hrs = no refund', 'Rate honestly every time', 'No alcohol before departure'].map((r, i) => (
              <div key={i} style={{ fontSize: 11, color: B.parchment, padding: '5px 0', borderBottom: i < 5 ? `1px solid ${B.canopy}` : 'none', display: 'flex', gap: 8 }}>
                <span style={{ color: B.copper, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, flexShrink: 0 }}>{String(i+1).padStart(2,'0')}</span>
                <span>{r}</span>
              </div>
            ))}
          </div>

          <button onClick={() => setShowPost(true)} style={{ background: 'transparent', color: B.copper, border: `2px solid ${B.copper}`, borderRadius: 4, padding: '12px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 2, cursor: 'pointer', width: '100%' }}>
            + POST YOUR TRIP
          </button>
        </div>
      </div>

      {selectedTrip && <BookingModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}
      {floatTrip && <FloatPlanModal trip={floatTrip} onClose={() => setFloatTrip(null)} />}
      {showPost && <PostTripModal onClose={() => setShowPost(false)} />}
    </div>
  )
}
