export async function GET() {
  const manifest = {
    frame: {
      name: "Music Aid",
      iconUrl: "https://musicaid.vercel.app/api/miniapp/icon",
      splashImageUrl: "https://musicaid.vercel.app/api/miniapp/splash",
      splashBackgroundColor: "#8b5cf6",
      homeUrl: "https://musicaid.vercel.app",
    },
    metadata: {
      name: "Music Aid",
      description:
        "Crowdfund proceeds go to Music for Relief's USDC charity address to use towards leveraging music to support disaster responses.",
      shortDescription: "Songs for Recovery",
      longDescription:
        "Music Aid enables charitable crowdfunding for disaster relief through Music for Relief. Users can donate USDC tokens to support music-based disaster response efforts, with transparent blockchain tracking and refund capabilities if funding goals aren't met.",
      images: [
        {
          src: "https://musicaid.vercel.app/api/miniapp/image",
          type: "image/png",
        },
      ],
      button: {
        title: "Open Mini App",
      },
      categories: ["social", "charity", "music"],
      keywords: ["charity", "music", "disaster relief", "crowdfunding", "USDC", "blockchain"],
    },
  }

  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
