import fs from "fs"
import path from "path"
import { PNG } from "pngjs"

// 1. High-Resolution SVG definitions
const onyxDarkSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#0b0d12"/>
  <rect x="16" y="16" width="480" height="480" rx="112" stroke="rgba(255,255,255,0.14)" stroke-width="16"/>
  <circle cx="256" cy="256" r="136" stroke="#d8ff38" stroke-width="48" stroke-linecap="round" stroke-dasharray="608 192" transform="rotate(-45 256 256)"/>
  <circle cx="360" cy="152" r="36" fill="#22c55e"/>
</svg>`

const onyxLightSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#f8fafc"/>
  <rect x="16" y="16" width="480" height="480" rx="112" stroke="rgba(0,0,0,0.1)" stroke-width="16"/>
  <circle cx="256" cy="256" r="136" stroke="#111827" stroke-width="48" stroke-linecap="round" stroke-dasharray="608 192" transform="rotate(-45 256 256)"/>
  <circle cx="360" cy="152" r="36" fill="#22c55e"/>
</svg>`

const onyxTransparentDarkSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="136" stroke="#d8ff38" stroke-width="48" stroke-linecap="round" stroke-dasharray="608 192" transform="rotate(-45 256 256)"/>
  <circle cx="360" cy="152" r="36" fill="#22c55e"/>
</svg>`

const onyxTransparentLightSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="136" stroke="#111827" stroke-width="48" stroke-linecap="round" stroke-dasharray="608 192" transform="rotate(-45 256 256)"/>
  <circle cx="360" cy="152" r="36" fill="#22c55e"/>
</svg>`

// 2. High-DPI / Retina PNG generator
function generateOnyxPng(size: number, isLight: boolean = false): Buffer {
  const png = new PNG({ width: size, height: size })
  const cx = size / 2
  const cy = size / 2
  const rOuter = size * 0.44
  const rInner = size * 0.28
  const dotX = size * 0.703
  const dotY = size * 0.297
  const dotR = size * 0.07

  const cornerR = size * 0.25

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      const qx = Math.max(Math.abs(x - cx) - (cx - cornerR), 0)
      const qy = Math.max(Math.abs(y - cy) - (cy - cornerR), 0)
      const qDist = Math.sqrt(qx * qx + qy * qy)

      if (qDist > cornerR) {
        png.data[idx] = 0
        png.data[idx + 1] = 0
        png.data[idx + 2] = 0
        png.data[idx + 3] = 0
        continue
      }

      // Background
      let r = isLight ? 248 : 11
      let g = isLight ? 250 : 13
      let b = isLight ? 252 : 18
      let a = 255

      // Border edge
      if (qDist > cornerR - Math.max(1, size * 0.02)) {
        if (isLight) {
          r = 200; g = 205; b = 215;
        } else {
          r = 50; g = 55; b = 65;
        }
      }

      // Green compiler dot
      const dotDist = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY))
      if (dotDist <= dotR) {
        // Emerald dot #22c55e
        r = 34
        g = 197
        b = 94
      } else if (dist >= rInner && dist <= rOuter) {
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 180
        const inGap = angle >= 295 && angle <= 335
        if (!inGap) {
          if (isLight) {
            r = 17; g = 24; b = 39; // Slate-900
          } else {
            r = 216; g = 255; b = 56; // Volt #d8ff38
          }
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

// 3. Write icons to kilo-vscode assets
const vscodeIconsDir = "onyx/packages/kilo-vscode/assets/icons"
if (fs.existsSync(vscodeIconsDir)) {
  fs.writeFileSync(path.join(vscodeIconsDir, "kilo-dark.svg"), onyxDarkSvg, "utf8")
  fs.writeFileSync(path.join(vscodeIconsDir, "kilo-light.svg"), onyxLightSvg, "utf8")
  
  const png512Dark = generateOnyxPng(512, false)
  const png512Light = generateOnyxPng(512, true)
  const png128Dark = generateOnyxPng(128, false)
  const png128Light = generateOnyxPng(128, true)

  fs.writeFileSync(path.join(vscodeIconsDir, "logo-outline-black.png"), png512Dark)
  fs.writeFileSync(path.join(vscodeIconsDir, "kilo-dark.png"), png128Dark)
  fs.writeFileSync(path.join(vscodeIconsDir, "kilo-light.png"), png128Light)
  console.log("Updated kilo-vscode assets icons successfully.")
}

// 4. Write icons to kilo-jetbrains
const jetbrainsIconsDir = "onyx/packages/kilo-jetbrains/frontend/src/main/resources/icons"
if (fs.existsSync(jetbrainsIconsDir)) {
  fs.writeFileSync(path.join(jetbrainsIconsDir, "kilo.svg"), onyxDarkSvg, "utf8")
  fs.writeFileSync(path.join(jetbrainsIconsDir, "kilo@20x20.svg"), onyxDarkSvg, "utf8")
  fs.writeFileSync(path.join(jetbrainsIconsDir, "kilo@20x20_dark.svg"), onyxDarkSvg, "utf8")
  fs.writeFileSync(path.join(jetbrainsIconsDir, "kilo-profile.svg"), onyxDarkSvg, "utf8")
  console.log("Updated kilo-jetbrains frontend icons successfully.")
}

const jetbrainsPluginIcon = "onyx/packages/kilo-jetbrains/src/main/resources/META-INF/pluginIcon.svg"
if (fs.existsSync(path.dirname(jetbrainsPluginIcon))) {
  fs.writeFileSync(jetbrainsPluginIcon, onyxDarkSvg, "utf8")
  console.log("Updated kilo-jetbrains pluginIcon.svg successfully.")
}

// 5. Also copy to website and assets root for direct Retina distribution
const rootLogo = "assets/images/logo-main.png"
if (fs.existsSync(path.dirname(rootLogo))) {
  fs.writeFileSync(rootLogo, generateOnyxPng(512, false))
}
const websiteLogo = "website/public/assets/images/logo-main.png"
if (fs.existsSync(path.dirname(websiteLogo))) {
  fs.writeFileSync(websiteLogo, generateOnyxPng(512, false))
}
const websiteDistLogo = "website/dist/assets/images/logo-main.png"
if (fs.existsSync(path.dirname(websiteDistLogo))) {
  fs.writeFileSync(websiteDistLogo, generateOnyxPng(512, false))
}

console.log("All desktop icons and Retina brand assets generated cleanly.")
