import fs from "fs"
import path from "path"
import { PNG } from "pngjs"

// 1. Generate SVG Favicon
const svgContent = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="#07080a"/>
  <rect x="2" y="2" width="60" height="60" rx="14" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <circle cx="32" cy="32" r="17" stroke="#d8ff38" stroke-width="6" stroke-linecap="round" stroke-dasharray="76 24" transform="rotate(-45 32 32)"/>
  <circle cx="45" cy="19" r="4.5" fill="#22c55e"/>
</svg>`

// 2. Generate 32x32 raster icon for ICO
function createOnyxIcon(size: number): Buffer {
  const png = new PNG({ width: size, height: size })
  const cx = size / 2
  const cy = size / 2
  const rOuter = size * 0.44
  const rInner = size * 0.28
  const dotX = size * 0.72
  const dotY = size * 0.28
  const dotR = size * 0.1

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Base: dark squircle / rounded rect
      const cornerR = size * 0.25
      const qx = Math.max(Math.abs(x - cx) - (cx - cornerR), 0)
      const qy = Math.max(Math.abs(y - cy) - (cy - cornerR), 0)
      const qDist = Math.sqrt(qx * qx + qy * qy)

      if (qDist > cornerR) {
        // Transparent outside rounded rect
        png.data[idx] = 0
        png.data[idx + 1] = 0
        png.data[idx + 2] = 0
        png.data[idx + 3] = 0
        continue
      }

      // Default dark background: #07080a
      let r = 7
      let g = 8
      let b = 10
      let a = 255

      // Border edge
      if (qDist > cornerR - 1.5) {
        r = 60
        g = 65
        b = 75
      }

      // Check for green accent dot
      const dotDist = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY))
      if (dotDist <= dotR) {
        // Emerald dot #22c55e
        r = 34
        g = 197
        b = 94
      } else if (dist >= rInner && dist <= rOuter) {
        // Angle calculation for the broken ring
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 180 // 0 to 360
        // Gap near top-right (around 45 degrees, angle ~ 290 to 340)
        const inGap = angle >= 295 && angle <= 335
        if (!inGap) {
          // Electric volt: #d8ff38
          r = 216
          g = 255
          b = 56
        }
      }

      png.data[idx] = r
      png.data[idx + 1] = g
      png.data[idx + 2] = b
      png.data[idx + 3] = a
    }
  }

  return PNG.sync.write(png)
}

// 3. Build ICO binary wrapper
function buildIco(pngBuffers: { size: number; buffer: Buffer }[]): Buffer {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // Reserved
  header.writeUInt16LE(1, 2) // Type: 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4) // Count of images

  let offset = 6 + pngBuffers.length * 16
  const entries: Buffer[] = []

  for (const img of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0) // Width
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1) // Height
    entry.writeUInt8(0, 2) // Color count (0 = 256+)
    entry.writeUInt8(0, 3) // Reserved
    entry.writeUInt16LE(1, 4) // Color planes
    entry.writeUInt16LE(32, 6) // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8) // Size in bytes
    entry.writeUInt32LE(offset, 12) // Offset
    entries.push(entry)
    offset += img.buffer.length
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((b) => b.buffer)])
}

const png32 = createOnyxIcon(32)
const png64 = createOnyxIcon(64)
const icoBuffer = buildIco([
  { size: 32, buffer: png32 },
  { size: 64, buffer: png64 },
])

const targetDirs = [
  "website/public",
  "website/dist",
  "onyx/packages/kilo-console/public",
  "onyx/packages/kilo-console/dist",
  "onyx/packages/kilo-console/.vercel/output/static",
]

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, "favicon.svg"), svgContent, "utf8")
  fs.writeFileSync(path.join(dir, "favicon.ico"), icoBuffer)
  console.log(`Updated favicons in ${dir}`)
}

// Remove kilo-logo.svg if present
const staleKiloFiles = [
  "onyx/packages/kilo-console/public/kilo-logo.svg",
  "onyx/packages/kilo-console/dist/kilo-logo.svg",
  "onyx/packages/kilo-console/.vercel/output/static/kilo-logo.svg",
]

for (const file of staleKiloFiles) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
    console.log(`Removed stale ${file}`)
  }
}

console.log("All favicons successfully generated and synced!")
