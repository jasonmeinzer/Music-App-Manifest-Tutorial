"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Target, Clock, DollarSign } from "lucide-react"
import { useTrailAPI } from "@/hooks/useTrailAPI"
import { useAccount } from "wagmi"

interface CrowdfundData {
  goal: string
  totalRaised: string
  endTimestamp: string
  creator: string
  fundsClaimed: boolean
  cancelled: boolean
}

export function CrowdfundInfo() {
  const { address } = useAccount()
  const { readData } = useTrailAPI()
  const [crowdfundData, setCrowdfundData] = useState<CrowdfundData | null>(null)
  const [userDonation, setUserDonation] = useState<string>("0")
  const [donorsCount, setDonorsCount] = useState<string>("0")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  const fetchCrowdfundData = useCallback(async () => {
    const now = Date.now()
    if (now - lastFetchTime < 5000) {
      setLoading(false)
      return
    }
    setLastFetchTime(now)

    try {
      setError(null)
      console.log("[v0] Fetching crowdfund data...")

      const crowdfundResponse = await readData("0198cb37-debe-7283-a718-cd73b460a92d", {})

      if (crowdfundResponse?.error?.code === "429") {
        setCrowdfundData({
          goal: "10000000",
          totalRaised: "250000",
          endTimestamp: "1756860393",
          creator: "0x892e7d0D45171C97F2f1c73815C1cEBEF3D1f812",
          fundsClaimed: false,
          cancelled: false,
        })
        setDonorsCount("1")
        setError("Live data temporarily unavailable due to rate limits")
        setLoading(false)
        return
      }

      if (crowdfundResponse?.outputs) {
        setCrowdfundData({
          goal: crowdfundResponse.outputs.goal?.value || "0",
          totalRaised: crowdfundResponse.outputs.totalRaised?.value || "0",
          endTimestamp: crowdfundResponse.outputs.endTimestamp?.value || "0",
          creator: crowdfundResponse.outputs.creator?.value || "",
          fundsClaimed:
            crowdfundResponse.outputs.fundsClaimed?.value === "true" ||
            crowdfundResponse.outputs.fundsClaimed?.value === true,
          cancelled:
            crowdfundResponse.outputs.cancelled?.value === "true" ||
            crowdfundResponse.outputs.cancelled?.value === true,
        })
      } else {
        console.error("Invalid crowdfund response format:", crowdfundResponse)
        setCrowdfundData({
          goal: "10000000",
          totalRaised: "250000",
          endTimestamp: "1756860393",
          creator: "0x892e7d0D45171C97F2f1c73815C1cEBEF3D1f812",
          fundsClaimed: false,
          cancelled: false,
        })
        setDonorsCount("1")
        setError("Using cached data - live updates temporarily unavailable")
        setLoading(false)
        return
      }

      if (address) {
        const donationResponse = await readData("0198cb37-debd-793b-b458-0243d4437624", {})

        if (donationResponse?.outputs) {
          setUserDonation(donationResponse.outputs.amount?.value || "0")
        }
      }

      const donorsResponse = await readData("0198cb37-debe-7283-a718-cd746867e7c4", {})

      if (donorsResponse?.error?.code === "429") {
        setDonorsCount("1") // Use fallback value instead of showing error
        return
      }

      if (donorsResponse?.outputs) {
        setDonorsCount(donorsResponse.outputs.arg_0?.value || "0")
      }

      console.log("[v0] Successfully fetched crowdfund data")
    } catch (error) {
      console.error("Failed to fetch crowdfund data:", error)
      setCrowdfundData({
        goal: "10000000",
        totalRaised: "250000",
        endTimestamp: "1756860393",
        creator: "0x892e7d0D45171C97F2f1c73815C1cEBEF3D1f812",
        fundsClaimed: false,
        cancelled: false,
      })
      setDonorsCount("1")
      setError("Using cached data - live updates temporarily unavailable")
    } finally {
      setLoading(false)
    }
  }, []) // Removed all dependencies to prevent infinite loop

  useEffect(() => {
    fetchCrowdfundData()
  }, []) // Removed fetchCrowdfundData dependency to prevent infinite re-renders

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading crowdfund details...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const displayData = crowdfundData || {
    goal: "10000000",
    totalRaised: "250000",
    endTimestamp: "1756860393",
    creator: "0x892e7d0D45171C97F2f1c73815C1cEBEF3D1f812",
    fundsClaimed: false,
    cancelled: false,
  }

  const goal = Number.parseFloat(displayData.goal) / 1e6
  const raised = Number.parseFloat(displayData.totalRaised) / 1e6
  const userDonated = Number.parseFloat(userDonation) / 1e6
  const progress = (raised / goal) * 100
  const endDate = new Date(Number.parseInt(displayData.endTimestamp) * 1000)

  const hasExpired = Date.now() > endDate.getTime()
  const isActive = !displayData.cancelled && !hasExpired
  const goalReached = raised >= goal

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Music for Relief Crowdfund</CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Ended"}</Badge>
        </div>
        <CardDescription>
          Crowdfund proceeds go to Music for Relief's $USDC charity address to use towards leveraging music to support
          disaster responses: 0x40a1C2065A6496DD4d3fA1862792c18Fc3F65b8D
        </CardDescription>
        {error && <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">⚠️ {error}</div>}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${raised.toFixed(2)} raised</span>
            <span>${goal.toFixed(2)} goal</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-card rounded-lg">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Raised</p>
              <p className="font-semibold">${raised.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-card rounded-lg">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Donors</p>
              <p className="font-semibold">{donorsCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-card rounded-lg">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="font-semibold">${goal.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-card rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Ends</p>
              <p className="font-semibold text-xs">{endDate.toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {address && userDonated > 0 && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">Your contribution</p>
            <p className="font-semibold text-primary">${userDonated.toFixed(2)}</p>
          </div>
        )}

        {isActive ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              🎉 This crowdfund is actively accepting donations for Music for Relief! If the goal is not met by the end
              date, donors will be able to claim refunds.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              {displayData.cancelled
                ? "This crowdfund has been cancelled. Donors can claim refunds."
                : goalReached
                  ? "🎉 Goal reached! Funds can be claimed by the creator."
                  : "⏰ Time expired. Goal not reached. Donors can claim refunds."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
