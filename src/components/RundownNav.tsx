'use client'
// src/components/RundownNav.tsx
// Sub-nav for the Rundown family of tools. Drop <RundownNav /> at the top of
// each Rundown page so users can move between the tools.

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const B = { forest:'#14263F', blue:'#5BA3E0', bone:'#E8DFC8', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const TOOLS = [
  { href:'/analyzer', label:'CHECK',    icon:'🌤️' },
  { href:'/today',    label:'TODAY',    icon:'📍' },
  { href:'/log',      label:'LOG',      icon:'🎣' },
  { href:'/forecast', label:'FORECAST', icon:'⭐' },
  { href:'/regs',     label:'REGS',     icon:'📋' },
  { href:'/slams',    label:'SLAMS',    icon:'🏆' },
]

export default function RundownNav() {
  const pathname = usePathname()
  const active = (href:string) => pathname.startsWith(href)
  return (
    <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:6, marginBottom:12 }}>
      {TOOLS.map(t=>(
        <Link key={t.href} href={t.href} style={{ flexShrink:0, display:'flex', alignItems:'center', gap:5, padding:'7px 13px', borderRadius:6, textDecoration:'none', border:`1.5px solid ${active(t.href)?B.blue:'rgba(74,142,194,0.25)'}`, background:active(t.href)?'rgba(74,142,194,0.15)':'transparent', color:active(t.href)?B.blue:B.dust }}>
          <span style={{ fontSize:13 }}>{t.icon}</span>
          <span style={{ ...O, fontSize:11, letterSpacing:1.5 }}>{t.label}</span>
        </Link>
      ))}
    </div>
  )
}
