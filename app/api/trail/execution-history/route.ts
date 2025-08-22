import { type NextRequest, NextResponse } from "next/server"

const TRAIL_APP_ID = "0198cb43-44e5-7beb-a072-657ad165d79a"
const TRAIL_ID = "0198cb37-deb0-75fb-9d7a-838cc5254637"
const VERSION_ID = "0198cb37-deb8-7836-b6fc-f70ca72b39db"
const API_KEY = process.env.MusicAidAPI002 // Use the existing environment variable instead of HERD_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      console.error("MusicAidAPI002 environment variable is not set") // Updated error message
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    const { walletAddresses } = await request.json()

    console.log("[v0] Server-side execution history request:", { walletAddresses })

    const response = await fetch(
      `https://trails-api.herd.eco/v1/trails/${TRAIL_ID}/versions/${VERSION_ID}/executions/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Herd-Trail-App-Id": TRAIL_APP_ID,
          "Herd-Trail-Api-Key": API_KEY,
        },
        body: JSON.stringify({
          walletAddresses: walletAddresses || [],
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API request failed:", response.status, errorText)
      return NextResponse.json({ error: `API request failed: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Server-side execution history response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Server-side execution history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
