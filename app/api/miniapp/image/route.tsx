import { NextResponse } from "next/server"

export async function GET() {
  // Create a 600x400 (3:2 aspect ratio) thumbnail image
  const svg = `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#bgGrad)" rx="24"/>
      
      <!-- Music for Relief text -->
      <text x="300" y="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Music for</text>
      <text x="300" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Relief</text>
      
      <!-- Subtitle -->
      <text x="300" y="220" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" opacity="0.9">Crowdfund for Charity</text>
      
      <!-- Music notes decoration -->
      <g transform="translate(150,280)">
        <path d="M0,0 L0,60 Q0,70 10,70 Q20,70 20,60 L20,20 L60,30 L60,90 Q60,100 70,100 Q80,100 80,90 L80,10 L20,-10 Z" fill="white" opacity="0.6"/>
      </g>
      <g transform="translate(450,280)">
        <path d="M0,0 L0,60 Q0,70 10,70 Q20,70 20,60 L20,20 L60,30 L60,90 Q60,100 70,100 Q80,100 80,90 L80,10 L20,-10 Z" fill="white" opacity="0.6"/>
      </g>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000",
    },
  })
}
