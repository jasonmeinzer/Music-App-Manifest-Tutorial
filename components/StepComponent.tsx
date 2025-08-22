"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, ExternalLink } from "lucide-react"
import { useTrailAPI } from "@/hooks/useTrailAPI"
import { useAccount } from "wagmi"

interface CrowdfundStatus {
  cancelled: boolean
  endTimestamp: string
  goal: string
  totalRaised: string
  userDonation: string
}

interface StepComponentProps {
  stepNumber: number
  title: string
  description: string
  userInputs: Array<{
    inputName: string
    intent: string
    valueType: string
    alreadyAppliedDecimals?: number
  }>
  isEnabled: boolean
  isCompleted: boolean
  onComplete: () => void
  hideStepNumber?: boolean
  nodeId: string
  crowdfundStatus?: CrowdfundStatus
}

export function StepComponent({
  stepNumber,
  title,
  description,
  userInputs,
  isEnabled,
  isCompleted,
  onComplete,
  hideStepNumber = false,
  nodeId,
  crowdfundStatus,
}: StepComponentProps) {
  const { address } = useAccount()
  const { loading, executeStep } = useTrailAPI()
  const [inputValue, setInputValue] = useState("")
  const [txHash, setTxHash] = useState<string>("")

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  const handleExecute = async () => {
    try {
      const formattedInputs: Record<string, any> = {}
      if (userInputs[0] && inputValue) {
        formattedInputs[userInputs[0].inputName] = inputValue
      }

      const result = await executeStep(stepNumber, formattedInputs, nodeId)
      setTxHash(result.txHash)
      onComplete()
    } catch (error) {
      console.error("Step execution failed:", error)
      alert(`Step ${stepNumber} failed: ${error}`)
    }
  }

  const isRefundEligible = () => {
    if (stepNumber !== 3 || !crowdfundStatus) return true

    const { cancelled, endTimestamp, goal, totalRaised, userDonation } = crowdfundStatus
    const hasExpired = Date.now() > Number.parseInt(endTimestamp) * 1000
    const goalReached = Number.parseFloat(totalRaised) >= Number.parseFloat(goal)
    const userHasDonated = Number.parseFloat(userDonation) > 0

    return (cancelled || (hasExpired && !goalReached)) && userHasDonated
  }

  const canExecute = isEnabled && inputValue.trim() && isRefundEligible()

  return (
    <Card className={`${isEnabled ? "border-primary/50" : "border-muted"} ${isCompleted ? "bg-primary/5" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCompleted && <CheckCircle className="w-5 h-5 text-primary" />}
            <CardTitle className="text-lg">{title}</CardTitle>
            {!hideStepNumber && stepNumber === 3 && (
              <Badge variant={isEnabled ? "default" : "secondary"}>Step {stepNumber}</Badge>
            )}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {userInputs[0] && (
          <div className="space-y-2">
            <Label htmlFor="input">
              {userInputs[0].inputName
                .split(".")
                .pop()
                ?.replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </Label>
            <Input
              id="input"
              type="number"
              placeholder={userInputs[0].intent}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={!isEnabled || loading}
              step="any"
              min="0"
            />
          </div>
        )}

        <Button onClick={handleExecute} disabled={!canExecute || loading} className="w-full">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {hideStepNumber ? "Execute" : `Execute Step ${stepNumber}`}
        </Button>

        {stepNumber === 3 && crowdfundStatus && !isRefundEligible() && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              {crowdfundStatus.cancelled
                ? "Refunds are available because the crowdfund was cancelled."
                : Number.parseFloat(crowdfundStatus.userDonation) === 0
                  ? "You haven't donated to this crowdfund yet."
                  : Date.now() <= Number.parseInt(crowdfundStatus.endTimestamp) * 1000
                    ? "Refunds will be available if the goal isn't reached by the end date."
                    : Number.parseFloat(crowdfundStatus.totalRaised) >= Number.parseFloat(crowdfundStatus.goal)
                      ? "Goal was reached - refunds are not available."
                      : "Refunds are now available since the goal wasn't reached."}
            </p>
          </div>
        )}

        {txHash && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Transaction:</span>
            <a
              href={`https://herd.eco/base/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
