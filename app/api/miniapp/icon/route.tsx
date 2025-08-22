import { NextResponse } from "next/server"
import sharp from "sharp"

export async function GET() {
  try {
    // Create 1024x1024px PNG with NO alpha channel (Farcaster requirement)
    const svg = `
      <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#10b981"/>
            <stop offset="100%" style="stop-color:#8b5cf6"/>
          </linearGradient>
        </defs>
        <rect width="1024" height="1024" fill="url(#bg)"/>
        <g transform="translate(512,512)">
          <!-- Music note -->
          <path d="M-80,-120 L-80,80 Q-80,100 -60,100 Q-40,100 -40,80 L-40,-80 L40,-60 L40,100 Q40,120 60,120 Q80,120 80,100 L80,-40 L-40,-60 Z" fill="white"/>
          <!-- Heart -->
          <path d="M-20,-200 Q-60,-240 -100,-200 Q-120,-180 -120,-160 Q-120,-140 -100,-120 L-20,-40 L60,-120 Q80,-140 80,-160 Q80,-180 60,-200 Q20,-240 -20,-200 Z" fill="white"/>
        </g>
      </svg>
    `

    const pngBuffer = await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9, palette: false }) // No alpha channel
      .resize(1024, 1024)
      .toBuffer()

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error generating icon:", error)
    return new NextResponse("Error generating icon", { status: 500 })
  }
}
