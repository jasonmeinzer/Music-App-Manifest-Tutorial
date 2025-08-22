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
      
      <!-- Music for Relief text -->
      <text x="600" y="220" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold">Music for</text>
      <text x="600" y="320" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold">Relief</text>
      
      <!-- Subtitle -->
      <text x="600" y="380" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="32" opacity="0.9">Crowdfund for Charity</text>
      
      <!-- Music notes decoration -->
      <g transform="translate(300,450)">
        <path d="M0,0 L0,90 Q0,105 15,105 Q30,105 30,90 L30,30 L90,45 L90,135 Q90,150 105,150 Q120,150 120,135 L120,15 L30,-15 Z" fill="white" opacity="0.6"/>
      </g>
      <g transform="translate(780,450)">
        <path d="M0,0 L0,90 Q0,105 15,105 Q30,105 30,90 L30,30 L90,45 L90,135 Q90,150 105,150 Q120,150 120,135 L120,15 L30,-15 Z" fill="white" opacity="0.6"/>
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
