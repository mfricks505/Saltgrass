'use client'
// src/app/privacy/page.tsx
// The trust page. Honest, concrete, no overpromising.
// Also serves as the privacy policy URL the Play Store requires.

const B = {
  forest:'#141F14', copper:'#C8922A', bone:'#E8DFC8',
  parchment:'#B8AE98', dust:'#6B6358', goText:'#7AE07A',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      <div style={{ padding:'8px 4px 18px' }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.copper }}>YOUR SPOTS STAY YOURS</div>
        <div style={{ ...O, fontSize:28, color:B.bone, letterSpacing:1, lineHeight:1.1, marginTop:2 }}>PRIVACY & SPOT PROTECTION</div>
        <div style={{ fontSize:13, color:B.parchment, marginTop:8, lineHeight:1.7 }}>
          Anglers protect their spots. So do we. Here's exactly what we do — and don't do — with your data. No fine print.
        </div>
      </div>

      {[
        {
          icon:'📷', title:'WE STRIP GPS FROM YOUR PHOTOS',
          body:'Every photo your phone takes secretly embeds the exact GPS coordinates where you took it. Before any photo you post leaves your device, we remove all of that location data. Your honey hole never travels with your fish pics.',
        },
        {
          icon:'📍', title:'WE STORE ZONES, NOT COORDINATES',
          body:'Your catch log records the general zone — "Pensacola Bay, inshore" — never exact latitude and longitude. There is no map pin on your catches. Even we could not tell anyone where your spot is, because we never stored it.',
        },
        {
          icon:'🔒', title:'YOUR LOG IS PRIVATE TO YOU',
          body:'Your catch log and saved routes are locked to your account at the database level. No other user can see them. When we show community activity, it is only ever zone + species — never your specific spots or routes.',
        },
        {
          icon:'🛡️', title:'ENCRYPTED IN TRANSIT AND AT REST',
          body:'All data moving between your phone and our servers is encrypted (HTTPS). Everything stored in our database is encrypted at rest by our infrastructure provider. Standard bank-level protection.',
        },
        {
          icon:'🚫', title:'WE DON\'T SELL YOUR DATA',
          body:'We do not sell, rent, or hand your personal data or fishing patterns to advertisers or data brokers. Your fishing intel is yours.',
        },
      ].map(card => (
        <div key={card.title} style={{ background:B.forest, borderRadius:8, padding:'16px 18px', marginBottom:8, border:`1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
            <span style={{ fontSize:24, flexShrink:0 }}>{card.icon}</span>
            <div>
              <div style={{ ...O, fontSize:13, letterSpacing:1, color:B.bone, marginBottom:5 }}>{card.title}</div>
              <div style={{ fontSize:13, color:B.parchment, lineHeight:1.7 }}>{card.body}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Honest "what we do collect" section — builds credibility */}
      <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'16px 18px', marginTop:8, border:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ ...O, fontSize:11, letterSpacing:2, color:B.dust, marginBottom:10 }}>WHAT WE DO COLLECT (AND WHY)</div>
        <div style={{ fontSize:12, color:B.parchment, lineHeight:1.8 }}>
          Your email and username (to run your account). Your catch log and saved routes (to power your patterns and forecasts — visible only to you). General region/zone (so conditions and regulations are relevant to you). That's it. We collect what the app needs to work for you, nothing more.
        </div>
      </div>

      <div style={{ textAlign:'center', padding:'20px 0', fontSize:11, color:B.dust }}>
        Questions about your data? Reach us through the in-app feedback button.<br/>
        Last updated: {new Date().toLocaleDateString('en-US', { month:'long', year:'numeric' })}
      </div>
    </div>
  )
}
