'use client'
// src/components/SecurePhotoUpload.tsx
// A photo picker that ALWAYS scrubs GPS/metadata before handing back the file.
// Shows the user a reassuring "spot protected" confirmation when GPS was found.
//
// Usage:
//   <SecurePhotoUpload onPhotoReady={(file) => upload(file)} />

import { useState, useRef } from 'react'
import { scrubImage } from '@/lib/scrub-image'

const B = {
  forest:'#141F14', copper:'#C8922A', bone:'#E8DFC8',
  parchment:'#B8AE98', dust:'#6B6358', goText:'#7AE07A', goBorder:'#3D7A3D',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

interface Props {
  onPhotoReady: (file: File) => void
  label?: string
}

export default function SecurePhotoUpload({ onPhotoReady, label = 'ADD PHOTO' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [protected_, setProtected] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setProcessing(true)
    setProtected(false)
    try {
      const { file: cleanFile, hadGpsData } = await scrubImage(file)
      setPreview(URL.createObjectURL(cleanFile))
      setProtected(hadGpsData)
      onPhotoReady(cleanFile)
    } catch {
      alert('Could not process that image — try another.')
    }
    setProcessing(false)
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />

      {!preview ? (
        <button onClick={() => inputRef.current?.click()} disabled={processing} style={{ width:'100%', background:B.forest, border:`1.5px dashed rgba(255,255,255,0.2)`, borderRadius:8, padding:'24px', cursor:'pointer', color:B.parchment }}>
          <div style={{ fontSize:28, marginBottom:6 }}>📷</div>
          <div style={{ ...O, fontSize:12, letterSpacing:2, color:B.copper }}>
            {processing ? 'PROTECTING YOUR SPOT...' : label}
          </div>
          <div style={{ fontSize:11, color:B.dust, marginTop:6, lineHeight:1.5 }}>
            GPS location is stripped automatically before upload
          </div>
        </button>
      ) : (
        <div>
          <div style={{ position:'relative', borderRadius:8, overflow:'hidden' }}>
            <img src={preview} alt="preview" style={{ width:'100%', display:'block' }} />
            <button onClick={() => { setPreview(null); setProtected(false); if(inputRef.current) inputRef.current.value='' }} style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.7)', color:B.bone, border:'none', borderRadius:6, padding:'6px 12px', cursor:'pointer', fontSize:12 }}>
              ✕ Remove
            </button>
          </div>
          {protected_ && (
            <div style={{ marginTop:8, background:'rgba(26,58,26,0.4)', border:`1px solid ${B.goBorder}`, borderRadius:6, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>🔒</span>
              <div style={{ fontSize:12, color:B.goText, lineHeight:1.5 }}>
                <strong>Spot protected.</strong> We found and removed GPS location data from this photo before upload.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
