import { NextResponse } from "next/server"
import sharp from "sharp"

export async function GET() {
  try {
    // Create 200x200px PNG (Farcaster requirement)
    const svg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#10b981"/>
            <stop offset="100%" style="stop-color:#8b5cf6"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#bg)"/>
        <g transform="translate(100,100)">
          <!-- Heart -->
          <path d="M-10,-40 Q-30,-60 -50,-40 Q-60,-30 -60,-20 Q-60,-10 -50,-0 L-10,40 L30,-0 Q40,-10 40,-20 Q40,-30 30,-40 Q10,-60 -10,-40 Z" fill="white"/>
        </g>
      </svg>
    `

    const pngBuffer = await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9, palette: false })
      .resize(200, 200)
      .toBuffer()

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error generating splash:", error)
    return new NextResponse("Error generating splash", { status: 500 })
  }
}
