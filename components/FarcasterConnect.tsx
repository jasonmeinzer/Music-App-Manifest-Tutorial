"use client"

import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"
import { useAccount, useConnect } from "wagmi"
import { config } from "./Web3Provider"
import { sdk } from "@farcaster/miniapp-sdk"
import type { Context } from "@farcaster/miniapp-sdk"

export function FarcasterConnect() {
  const { address, status } = useAccount()
  const { connect } = useConnect()
  const [context, setContext] = useState<Context.MiniAppContext | null>(null)

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const context = await sdk.context
        console.log(context, "context")
        setContext(context)
      } catch (error) {
        console.error("Failed to fetch Farcaster context:", error)
      }
    }
    fetchContext()
  }, [])

  useEffect(() => {
    if (status === "disconnected") {
      const timer = setTimeout(() => {
        try {
          connect({ connector: config.connectors[0] })
        } catch (error) {
          console.log("Auto-connect failed:", error)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [connect, status])

  const handleConnect = () => {
    try {
      connect({ connector: config.connectors[0] })
    } catch (error) {
      console.error("Connection failed:", error)
    }
  }

  return (
    <div className="farcaster-connect">
      {status === "connected" && address ? (
        <div className="flex items-center gap-2 bg-card rounded-full px-3 py-2 shadow-sm border max-w-[140px]">
          <img src={context?.user.pfpUrl || "/placeholder.svg"} alt="avatar" className="w-5 h-5 rounded-full" />
          <span className="text-card-foreground font-medium text-sm truncate">{context?.user.username}</span>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Wallet className="w-4 h-4" />
          <span className="text-sm">Connect Farcaster</span>
        </button>
      )}
    </div>
  )
}
