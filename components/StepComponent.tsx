"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, ExternalLink } from "lucide-react"
import { useTrailAPI } from "@/hooks/useTrailAPI"
import { useAccount } from "wagmi"

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
}: StepComponentProps) {
  const { address } = useAccount()
  const { loading, executeStep } = useTrailAPI()
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [txHash, setTxHash] = useState<string>("")
  const [collapsed, setCollapsed] = useState(isCompleted)

  useEffect(() => {
    setCollapsed(isCompleted)
  }, [isCompleted])

  const handleInputChange = (inputName: string, value: string) => {
    setInputs((prev) => ({ ...prev, [inputName]: value }))
  }

  const handleExecute = async () => {
    try {
      const formattedInputs: Record<string, any> = {}

      // Format inputs for API
      userInputs.forEach((input) => {
        const value = inputs[input.inputName]
        if (value) {
          // Don't apply decimals if alreadyAppliedDecimals > 0
          formattedInputs[input.inputName] =
            input.alreadyAppliedDecimals && input.alreadyAppliedDecimals > 0 ? value : value
        }
      })

      const result = await executeStep(stepNumber, formattedInputs)
      setTxHash(result.txHash)
      onComplete()
    } catch (error) {
      console.error("Step execution failed:", error)
      alert(`Step ${stepNumber} failed: ${error}`)
    }
  }

  const canExecute = isEnabled && userInputs.every((input) => inputs[input.inputName]?.trim())

  if (collapsed && isCompleted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant="secondary">Completed</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(false)}>
              Expand
            </Button>
          </div>
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
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={`${isEnabled ? "border-primary/50" : "border-muted"} ${isCompleted ? "bg-primary/5" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCompleted && <CheckCircle className="w-5 h-5 text-primary" />}
            <CardTitle className="text-lg">{title}</CardTitle>
            {!hideStepNumber && <Badge variant={isEnabled ? "default" : "secondary"}>Step {stepNumber}</Badge>}
          </div>
          {isCompleted && (
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(true)}>
              Collapse
            </Button>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {userInputs.map((input) => (
          <div key={input.inputName} className="space-y-2">
            <Label htmlFor={input.inputName}>
              {input.inputName
                .split(".")
                .pop()
                ?.replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </Label>
            <Input
              id={input.inputName}
              type={input.valueType.includes("int") ? "number" : "text"}
              placeholder={input.intent}
              value={inputs[input.inputName] || ""}
              onChange={(e) => handleInputChange(input.inputName, e.target.value)}
              disabled={!isEnabled || loading}
            />
          </div>
        ))}

        <Button onClick={handleExecute} disabled={!canExecute || loading} className="w-full">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {hideStepNumber ? "Execute" : `Execute Step ${stepNumber}`}
        </Button>

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
