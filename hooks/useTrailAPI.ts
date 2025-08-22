"use client"

import { useState, useCallback } from "react"
import { useAccount, useSendTransaction } from "wagmi"

const TRAIL_APP_ID = "0198cb43-44e5-7beb-a072-657ad165d79a"
const TRAIL_ID = "0198cb37-deb0-75fb-9d7a-838cc5254637"
const VERSION_ID = "0198cb37-deb8-7836-b6fc-f70ca72b39db"

export interface ExecutionHistory {
  executionId: string
  walletAddress: string
  stepNumber: number
  transactionHash: string
  status: "pending" | "completed" | "failed"
  timestamp: string
}

export function useTrailAPI() {
  const { address } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  const [loading, setLoading] = useState(false)
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([])

  const evaluateStep = async (stepNumber: number, userInputs: Record<string, any>, nodeId: string) => {
    try {
      const response = await fetch("/api/trail/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stepNumber,
          userInputs,
          nodeId,
          walletAddress: address,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Evaluation response:", data)
      return data
    } catch (error) {
      console.error("Evaluation error:", error)
      throw error
    }
  }

  const executeStep = async (stepNumber: number, userInputs: Record<string, any>, nodeId: string) => {
    if (!address) throw new Error("Wallet not connected")

    setLoading(true)
    try {
      // Get transaction calldata from server
      const evaluation = await evaluateStep(stepNumber, userInputs, nodeId)

      // Send transaction
      const txHash = await sendTransactionAsync({
        to: evaluation.contractAddress as `0x${string}`,
        data: evaluation.callData as `0x${string}`,
        value: BigInt(evaluation.payableAmount || 0),
      })

      console.log("[v0] Transaction sent:", txHash)

      const executionResponse = await fetch("/api/trail/execution-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodeId,
          transactionHash: txHash,
          walletAddress: address,
        }),
      })

      if (!executionResponse.ok) {
        const errorText = await executionResponse.text()
        console.error("Failed to update execution history:", errorText)
        throw new Error("Transaction may have failed - check hash: " + txHash)
      }

      const executionData = await executionResponse.json()
      console.log("[v0] Execution update response:", executionData)

      await getExecutionHistory()

      return { txHash, executionId: executionData.executionId }
    } catch (error) {
      console.error("Execution error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getExecutionHistory = async () => {
    if (!address) return []

    try {
      const response = await fetch("/api/trail/execution-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddresses: [address.toLowerCase()],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API request failed:", errorData.error)
        return []
      }

      const data = await response.json()
      console.log("[v0] Execution history response:", data)

      const walletExecution = data.walletExecutions?.find(
        (we: any) => we.walletAddress.toLowerCase() === address.toLowerCase(),
      )

      if (walletExecution?.executions) {
        const history = walletExecution.executions.flatMap((exec: any) =>
          exec.steps.map((step: any) => ({
            executionId: exec.id,
            walletAddress: address,
            stepNumber: step.stepNumber,
            transactionHash: step.txHash,
            status: "completed" as const,
            timestamp: step.createdAt,
          })),
        )
        setExecutionHistory(history)
        return history
      }
    } catch (error) {
      console.error("Failed to fetch execution history:", error)
    }
    return []
  }

  const getCommunityHistory = async () => {
    try {
      const response = await fetch("/api/trail/execution-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddresses: [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API request failed:", errorData.error)
        return []
      }

      const data = await response.json()
      console.log("[v0] Community history response:", data)

      return data.walletExecutions || []
    } catch (error) {
      console.error("Failed to fetch community history:", error)
    }
    return []
  }

  const readData = useCallback(
    async (nodeId: string, userInputs: Record<string, any> = {}) => {
      try {
        const response = await fetch("/api/trail/read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodeId,
            userInputs,
            walletAddress: address,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API request failed:", errorData.error)
          return null
        }

        const data = await response.json()
        console.log("[v0] Read response:", data)
        return data
      } catch (error) {
        console.error("Failed to read data:", error)
        return null
      }
    },
    [address],
  )

  return {
    loading,
    executionHistory,
    evaluateStep,
    executeStep,
    getExecutionHistory,
    getCommunityHistory,
    readData,
  }
}
