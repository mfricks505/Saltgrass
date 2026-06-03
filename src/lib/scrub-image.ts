// src/lib/scrub-image.ts
// Strips ALL metadata (including GPS) from a photo before upload.
// Works by redrawing the image onto a canvas — canvas output contains
// zero EXIF/metadata. The GPS coordinates of someone's fishing spot never
// leave their device.

export interface ScrubResult {
  file: File
  hadGpsData: boolean
}

// Check if a file has GPS EXIF data (so we can tell the user we protected them)
async function hasGpsExif(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 65536).arrayBuffer() // GPS is in first 64kb
    const view = new DataView(buffer)
    // Look for EXIF GPS IFD marker (0x8825) — quick heuristic
    for (let i = 0; i < view.byteLength - 1; i++) {
      if (view.getUint16(i) === 0x8825) return true
    }
    return false
  } catch {
    return false
  }
}

export async function scrubImage(file: File, maxDimension = 2048): Promise<ScrubResult> {
  const hadGpsData = await hasGpsExif(file)

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Scale down very large images (also helps strip data + saves bandwidth)
      let { width, height } = img
      if (width > maxDimension || height > maxDimension) {
        if (width > height) { height = Math.round(height * maxDimension / width); width = maxDimension }
        else { width = Math.round(width * maxDimension / height); height = maxDimension }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }

      // Redrawing onto canvas drops ALL metadata — this is the scrub
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Failed to process image')); return }
          // New clean file — no EXIF, no GPS, nothing
          const cleanFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '') + '.jpg',
            { type: 'image/jpeg', lastModified: Date.now() }
          )
          resolve({ file: cleanFile, hadGpsData })
        },
        'image/jpeg',
        0.9
      )
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}
