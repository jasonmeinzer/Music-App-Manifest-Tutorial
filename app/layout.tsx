
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Music App Manifest - Tutorial Demo",
  description: "Tutorial demo for manifest creation",
  generator: "v0.app",
  openGraph: {
    title: "Music App Manifest Tutorial",
    description: "Tutorial demo for manifest creation",
    url: "https://music-app-manifest-tutorial.vercel.app",
    siteName: "Music App Manifest",
    images: [
      {
        url: "https://music-app-manifest-tutorial.vercel.app/api/image",
        width: 600,
        height: 400,
        alt: "Music App Manifest - Tutorial Demo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Music App Manifest Tutorial",
    description: "Tutorial demo for manifest creation",
    images: ["https://music-app-manifest-tutorial.vercel.app/api/image"],
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
          content='{"version":"1","imageUrl":"https://music-app-manifest-tutorial.vercel.app/api/image","iconUrl":"https://music-app-manifest-tutorial.vercel.app/api/icon","button":{"title":"🎵 Tutorial Demo","action":{"type":"launch_miniapp","name":"Music App Manifest","url":"https://music-app-manifest-tutorial.vercel.app","splashImageUrl":"https://music-app-manifest-tutorial.vercel.app/api/splash","splashBackgroundColor":"#22c55e"}}}'
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
