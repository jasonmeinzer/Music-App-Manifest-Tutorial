import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Music for Relief Crowdfund",
  description: "Support music relief efforts through charitable crowdfunding",
  generator: "v0.app",
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
          content='{"version":"1","imageUrl":"https://placeholder.svg?height=400&width=400&text=Music+for+Relief","button":{"title":"🎵 Donate","action":{"type":"launch_miniapp","name":"Music for Relief","url":"https://music-relief-crowdfund.vercel.app","splashImageUrl":"https://placeholder.svg?height=200&width=200&text=Music+Relief","splashBackgroundColor":"#22c55e"}}}'
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
