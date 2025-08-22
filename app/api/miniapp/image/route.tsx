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
    </svg>
  `

  try {
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()

    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, no-cache", // Disabled caching to ensure immediate updates
      },
    })
  } catch (error) {
    console.error("Error converting SVG to PNG:", error)
    return new NextResponse("Error generating image", { status: 500 })
  }
}
