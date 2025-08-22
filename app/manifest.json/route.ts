export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjAsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhkNDY5NzM5NTM5MmZjZjU5NzIzZjU4ZGNjOGIxZjU5NTk2NzU4Nzg5In0",
      payload: "eyJkb21haW4iOiJ2MC1tdXNpY2Nyb3dkZnVuZGFwcC52ZXJjZWwuYXBwIn0",
      signature: "MHhkNDY5NzM5NTM5MmZjZjU5NzIzZjU4ZGNjOGIxZjU5NTk2NzU4Nzg5",
    },
    frame: {
      name: "Music Aid",
      iconUrl: "https://v0-musiccrowdfundapp.vercel.app/api/miniapp/icon",
      splashImageUrl: "https://v0-musiccrowdfundapp.vercel.app/api/miniapp/splash",
      splashBackgroundColor: "#8b5cf6",
      homeUrl: "https://v0-musiccrowdfundapp.vercel.app",
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
          src: "https://v0-musiccrowdfundapp.vercel.app/api/miniapp/image",
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
