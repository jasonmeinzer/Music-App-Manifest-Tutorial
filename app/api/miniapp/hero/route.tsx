import { NextResponse } from "next/server"
import sharp from "sharp"

export async function GET() {
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#heroGrad)" />
      
      <!-- Heart symbol -->
      <path d="M600 200 C580 180, 540 180, 540 220 C540 260, 600 320, 600 320 C600 320, 660 260, 660 220 C660 180, 620 180, 600 200 Z" 
            fill="white" opacity="0.9"/>
      
      <!-- Music notes -->
      <circle cx="480" cy="280" r="8" fill="white" opacity="0.7"/>
      <rect x="488" y="240" width="3" height="40" fill="white" opacity="0.7"/>
      <circle cx="720" cy="280" r="8" fill="white" opacity="0.7"/>
      <rect x="728" y="240" width="3" height="40" fill="white" opacity="0.7"/>
      
      <!-- Title -->
      <text x="600" y="420" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            text-anchor="middle" fill="white">Music for Relief</text>
      <text x="600" y="480" font-family="Arial, sans-serif" font-size="32" 
            text-anchor="middle" fill="white" opacity="0.9">Crowdfund for Charity</text>
    </svg>
  `

  const pngBuffer = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: false })
    .resize(1200, 630)
    .toBuffer()

  return new NextResponse(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000",
    },
  })
}
