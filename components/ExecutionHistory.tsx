"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, User } from "lucide-react"
import { useTrailAPI, type ExecutionHistory } from "@/hooks/useTrailAPI"
import { useAccount } from "wagmi"

export function ExecutionHistoryComponent() {
  const { address } = useAccount()
  const { getExecutionHistory, getCommunityHistory } = useTrailAPI()
  const [userHistory, setUserHistory] = useState<ExecutionHistory[]>([])
  const [communityHistory, setCommunityHistory] = useState<ExecutionHistory[]>([])
  const [showCommunity, setShowCommunity] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const [userHist, communityHist] = await Promise.all([getExecutionHistory(), getCommunityHistory()])

        setUserHistory(userHist)
        setCommunityHistory(communityHist.slice(0, 10)) // Show latest 10
      } catch (error) {
        console.error("Failed to fetch execution history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [address])

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  const formatDate = (timestamp: string) => new Date(timestamp).toLocaleDateString()

  const historyToShow = showCommunity ? communityHistory : userHistory

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading execution history...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {showCommunity ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
              {showCommunity ? "Community Activity" : "Your Activity"}
            </CardTitle>
            <CardDescription>
              {showCommunity ? "Recent donations from the community" : "Your transaction history for this crowdfund"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowCommunity(!showCommunity)}>
            {showCommunity ? "Show My Activity" : "Show Community"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {historyToShow.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {showCommunity ? "No community activity yet" : "No transactions yet"}
          </p>
        ) : (
          <div className="space-y-3">
            {historyToShow.map((execution, index) => (
              <div
                key={`${execution.executionId}-${index}`}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Step {execution.stepNumber}</Badge>
                  <div>
                    <p className="text-sm font-medium">{showCommunity && formatAddress(execution.walletAddress)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(execution.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={execution.status === "completed" ? "default" : "secondary"}>{execution.status}</Badge>
                  <a
                    href={`https://herd.eco/base/tx/${execution.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
