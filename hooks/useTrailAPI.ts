"use client"

import { useState, useCallback } from "react"
import { useAccount, useSendTransaction } from "wagmi"

const TRAIL_APP_ID = "0198cb43-44e5-7beb-a072-657ad165d79a"

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

  const makeRequest = async (url: string, body: any) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Herd-Trail-App-Id": TRAIL_APP_ID,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Request failed: ${response.status}`)
    }

    return response.json()
  }

  const executeStep = async (stepNumber: number, userInputs: Record<string, any>, nodeId: string) => {
    if (!address) throw new Error("Wallet not connected")

    setLoading(true)
    try {
      // Get transaction data
      const evaluation = await makeRequest("/api/trail/evaluate", {
        stepNumber,
        userInputs,
        nodeId,
        walletAddress: address,
      })

      // Send transaction
      const txHash = await sendTransactionAsync({
        to: evaluation.contractAddress as `0x${string}`,
        data: evaluation.callData as `0x${string}`,
        value: BigInt(evaluation.payableAmount || 0),
      })

      // Update execution
      await makeRequest("/api/trail/execution-update", {
        nodeId,
        transactionHash: txHash,
        walletAddress: address,
      })

      return { txHash }
    } finally {
      setLoading(false)
    }
  }

  const getExecutionHistory = async () => {
    if (!address) return []

    try {
      const data = await makeRequest("/api/trail/execution-history", {
        walletAddresses: [address.toLowerCase()],
      })

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
      return []
    } catch (error) {
      return []
    }
  }

  const readData = useCallback(
    async (nodeId: string, userInputs: Record<string, any> = {}) => {
      try {
        return await makeRequest("/api/trail/read", {
          nodeId,
          userInputs,
          walletAddress: address,
        })
      } catch (error) {
        return null
      }
    },
    [address],
  )

  return {
    loading,
    executionHistory,
    executeStep,
    getExecutionHistory,
    readData,
  }
}
