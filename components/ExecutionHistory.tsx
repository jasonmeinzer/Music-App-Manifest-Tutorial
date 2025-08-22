"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, User } from "lucide-react"
import { useTrailAPI, type ExecutionHistory } from "@/hooks/useTrailAPI"
import { useAccount } from "wagmi"

export function ExecutionHistoryComponent() {
  const { address } = useAccount()
  const { getExecutionHistory } = useTrailAPI()
  const [userHistory, setUserHistory] = useState<ExecutionHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const userHist = await getExecutionHistory()
        setUserHistory(userHist)
      } catch (error) {
        console.error("Failed to fetch execution history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [address])

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const filteredHistory = userHistory
    .filter((execution) => execution.stepNumber === 1 || execution.stepNumber === 2)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

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
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Activity
          </CardTitle>
          <CardDescription>Your transaction history for this crowdfund</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {filteredHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((execution, index) => (
              <div
                key={`${execution.executionId}-${index}`}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Step {execution.stepNumber}</Badge>
                  <div>
                    <p className="text-xs text-muted-foreground">{formatDateTime(execution.timestamp)}</p>
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
