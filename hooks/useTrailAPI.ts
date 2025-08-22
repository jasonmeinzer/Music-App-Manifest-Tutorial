"use client"

import { useState, useCallback, useRef } from "react"
import { useAccount, useSendTransaction } from "wagmi"

const TRAIL_APP_ID = "0198cb43-44e5-7beb-a072-657ad165d79a"
const TRAIL_ID = "0198cb37-deb0-75fb-9d7a-838cc5254637"
const VERSION_ID = "0198cb37-deb8-7836-b6fc-f70ca72b39db"

const requestCache = new Map<string, { data: any; timestamp: number }>()
const inFlightRequests = new Map<string, Promise<any>>()
let activeRequestCount = 0
const MAX_CONCURRENT_REQUESTS = 2
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const EXECUTION_POLL_INTERVAL = 10 * 1000 // 10 seconds
const BACKOFF_DELAYS = [10000, 20000, 40000] // 10s, 20s, 40s

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const requestQueue: Array<() => Promise<any>> = []
let isProcessingQueue = false

const processQueue = async () => {
  if (isProcessingQueue) return
  isProcessingQueue = true

  while (requestQueue.length > 0 && activeRequestCount < MAX_CONCURRENT_REQUESTS) {
    const request = requestQueue.shift()
    if (request) {
      activeRequestCount++
      request().finally(() => {
        activeRequestCount--
      })
    }
  }

  isProcessingQueue = false
}

const makeRequestWithRetry = async (url: string, options: RequestInit, retries = 0): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Herd-Trail-App-Id": TRAIL_APP_ID,
      },
    })
    return response
  } catch (error) {
    if (retries < BACKOFF_DELAYS.length) {
      await sleep(BACKOFF_DELAYS[retries])
      return makeRequestWithRetry(url, options, retries + 1)
    }
    throw error
  }
}

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
  const executionPollRef = useRef<NodeJS.Timeout | null>(null)

  const makeCachedRequest = useCallback(async (cacheKey: string, requestFn: () => Promise<any>) => {
    // Check cache first
    const cached = requestCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    // Check if request is already in flight
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)
    }

    // Create new request
    const requestPromise = new Promise<any>((resolve, reject) => {
      const executeRequest = async () => {
        try {
          const result = await requestFn()
          requestCache.set(cacheKey, { data: result, timestamp: Date.now() })
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          inFlightRequests.delete(cacheKey)
        }
      }

      if (activeRequestCount < MAX_CONCURRENT_REQUESTS) {
        activeRequestCount++
        executeRequest().finally(() => {
          activeRequestCount--
          processQueue()
        })
      } else {
        requestQueue.push(() => executeRequest())
        processQueue()
      }
    })

    inFlightRequests.set(cacheKey, requestPromise)
    return requestPromise
  }, [])

  const evaluateStep = async (stepNumber: number, userInputs: Record<string, any>, nodeId: string) => {
    const cacheKey = `evaluate-${stepNumber}-${nodeId}-${JSON.stringify(userInputs)}`

    return makeCachedRequest(cacheKey, async () => {
      const response = await makeRequestWithRetry("/api/trail/evaluate", {
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
    })
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

      const executionResponse = await makeRequestWithRetry("/api/trail/execution-update", {
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

      startExecutionPolling()

      return { txHash, executionId: executionData.executionId }
    } catch (error) {
      console.error("Execution error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const startExecutionPolling = useCallback(() => {
    if (executionPollRef.current) {
      clearInterval(executionPollRef.current)
    }

    executionPollRef.current = setInterval(() => {
      getExecutionHistory()
    }, EXECUTION_POLL_INTERVAL)
  }, [])

  const getExecutionHistory = async () => {
    if (!address) return []

    const cacheKey = `execution-history-${address.toLowerCase()}`

    try {
      return await makeCachedRequest(cacheKey, async () => {
        const response = await makeRequestWithRetry("/api/trail/execution-history", {
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
        return []
      })
    } catch (error) {
      console.error("Failed to fetch execution history:", error)
      return []
    }
  }

  const readData = useCallback(
    async (nodeId: string, userInputs: Record<string, any> = {}) => {
      const cacheKey = `read-${nodeId}-${JSON.stringify(userInputs)}-${address || "no-address"}`

      return makeCachedRequest(cacheKey, async () => {
        const response = await makeRequestWithRetry("/api/trail/read", {
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
      })
    },
    [address, makeCachedRequest],
  )

  return {
    loading,
    executionHistory,
    evaluateStep,
    executeStep,
    getExecutionHistory,
    readData,
  }
}
