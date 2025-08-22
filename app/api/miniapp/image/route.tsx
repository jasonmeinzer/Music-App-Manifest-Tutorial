import { NextResponse } from "next/server"
import sharp from "sharp"

export async function GET() {
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bgGrad)" rx="24"/>
      
      <!-- Added both heart and music note icons side by side -->
      <g transform="translate(550,315)">
        <path d="M0,-30 C-20,-50 -50,-50 -50,-20 C-50,10 0,50 0,50 C0,50 50,10 50,-20 C50,-50 20,-50 0,-30 Z" fill="white" opacity="0.8"/>
      </g>
      
      <!-- Simple music note -->
      <g transform="translate(650,315)">
        <circle cx="0" cy="20" r="12" fill="white" opacity="0.8"/>
        <rect x="12" y="-40" width="4" height="60" fill="white" opacity="0.8"/>
        <path d="M16,-40 Q30,-35 30,-25 L30,-15 Q30,-10 25,-10 Q20,-10 20,-15 L20,-25 Q20,-30 16,-35 Z" fill="white" opacity="0.8"/>
      </g>
    </svg>
  `

  try {
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error converting SVG to PNG:", error)
    return new NextResponse("Error generating image", { status: 500 })
  }
}
