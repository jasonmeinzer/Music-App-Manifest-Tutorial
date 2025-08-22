"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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

  const handleExecute = async () => {
    if (!inputValue || !address) return

    try {
      const inputs: Record<string, any> = {}
      if (userInputs[0]) {
        inputs[userInputs[0].inputName] = inputValue
      }

      const result = await executeStep(stepNumber, inputs, nodeId)
      if (result?.txHash) {
        setTxHash(result.txHash)
        onComplete()
      }
    } catch (error) {
      alert(`Step failed: ${error}`)
    }
  }

  const showRefundStep = stepNumber === 3

  return (
    <Card className={`border-primary/50 ${isCompleted ? "bg-primary/5" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCompleted && <CheckCircle className="w-5 h-5 text-primary" />}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {userInputs[0] && (
          <div className="space-y-2">
            <Label>
              {userInputs[0].inputName
                .split(".")
                .pop()
                ?.replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </Label>
            <input
              type="text"
              placeholder={userInputs[0].intent}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        )}

        <Button onClick={handleExecute} disabled={loading || !inputValue.trim()} className="w-full">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {hideStepNumber ? "Execute" : `Execute Step ${stepNumber}`}
        </Button>

        {showRefundStep && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">Claim refunds if available for your donations.</p>
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
