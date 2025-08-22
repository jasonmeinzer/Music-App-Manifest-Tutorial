import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Music for Relief Crowdfund",
  description: "Support music relief efforts through charitable crowdfunding",
  generator: "v0.app",
  openGraph: {
    title: "Music for Relief Crowdfund",
    description: "Support music relief efforts through charitable crowdfunding",
    url: "https://musicaid.vercel.app",
    siteName: "Music for Relief",
    images: [
      {
        url: "https://musicaid.vercel.app/api/miniapp/image",
        width: 600,
        height: 400,
        alt: "Music for Relief - Crowdfund for Charity",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Music for Relief Crowdfund",
    description: "Support music relief efforts through charitable crowdfunding",
    images: ["https://musicaid.vercel.app/api/miniapp/image"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="fc:miniapp"
          content='{"version":"1","imageUrl":"https://musicaid.vercel.app/api/miniapp/image","iconUrl":"https://musicaid.vercel.app/api/miniapp/icon","button":{"title":"🎵 Donate","action":{"type":"launch_miniapp","name":"Music for Relief","url":"https://musicaid.vercel.app","splashImageUrl":"https://musicaid.vercel.app/api/miniapp/splash","splashBackgroundColor":"#22c55e"}}}'
        />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
