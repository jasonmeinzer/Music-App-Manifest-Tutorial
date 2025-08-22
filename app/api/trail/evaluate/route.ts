import { type NextRequest, NextResponse } from "next/server"

const TRAIL_APP_ID = "0198cb43-44e5-7beb-a072-657ad165d79a"
const TRAIL_ID = "0198cb37-deb0-75fb-9d7a-838cc5254637"
const VERSION_ID = "0198cb37-deb8-7836-b6fc-f70ca72b39db"
const API_KEY = process.env.HERD_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      console.error("HERD_API_KEY environment variable is not set")
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    const { stepNumber, userInputs, nodeId, walletAddress } = await request.json()

    const formattedUserInputs: Record<string, Record<string, { value: any }>> = {
      [nodeId]: {},
    }

    Object.entries(userInputs).forEach(([key, value]) => {
      formattedUserInputs[nodeId][key] = { value }
    })

    console.log("[v0] Server-side evaluate request:", { stepNumber, userInputs: formattedUserInputs })

    const response = await fetch(
      `https://trails-api.herd.eco/v1/trails/${TRAIL_ID}/versions/${VERSION_ID}/steps/${stepNumber}/evaluations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Herd-Trail-App-Id": TRAIL_APP_ID,
          "Herd-Trail-Api-Key": API_KEY,
        },
        body: JSON.stringify({
          walletAddress: walletAddress || "0x0000000000000000000000000000000000000000",
          userInputs: formattedUserInputs,
          execution: { type: "latest" },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API request failed:", response.status, errorText)
      return NextResponse.json({ error: `API request failed: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Server-side evaluate response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Server-side evaluate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
