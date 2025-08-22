export async function GET() {
  const manifest = {
    accountAssociation: {
      header:
        "eyJmaWQiOjg4ODUsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg5NzNjZTViYmM2MTg5N2EwQ0ZmQTI0RmM5MUI0QzFkNjg3NGM3ODk2In0",
      payload: "eyJkb21haW4iOiJtdXNpY2FpZC52ZXJjZWwuYXBwIn0",
      signature:
        "MHg4MGYzY2I5MzAzM2RjZTlkNDA1ZjM4M2I4MWU3ZTIxNGI3OTRhMGNiMGZlNmFhNTIwM2IzMzU4MGVlOWNjZjRmMWE4YTc5ODAyZDc5ODU0MjlhNDczMzA1ZjU5OGY0Y2I4MWVhOTc1NjlkYTI5NTVjZTI3MTBhNTQxMDMyMjBmZTFj",
    },
    frame: {
      version: "1",
      name: "Music Aid - Songs for Recovery",
      iconUrl: "https://musicaid.vercel.app/api/miniapp/icon",
      homeUrl: "https://musicaid.vercel.app",
      imageUrl: "https://musicaid.vercel.app/api/miniapp/image",
      buttonTitle: "Donate",
      splashImageUrl: "https://musicaid.vercel.app/api/miniapp/splash",
      splashBackgroundColor: "#8b5cf6",
      webhookUrl: "https://musicaid.vercel.app/api/miniapp/webhook",
    },
  }

  return Response.json(manifest)
}
