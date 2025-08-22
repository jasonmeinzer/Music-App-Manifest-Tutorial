"use client"

// Reference document for trail details and debugging: https://trails-api.herd.eco/v1/trails/0198cb37-deb0-75fb-9d7a-838cc5254637/versions/0198cb37-deb8-7836-b6fc-f70ca72b39db/guidebook.txt?promptObject=farcaster_miniapp&trailAppId=0198cb43-44e5-7beb-a072-657ad165d79a

import { useState, useEffect } from "react"
import { Web3Provider } from "@/components/Web3Provider"
import { FarcasterConnect } from "@/components/FarcasterConnect"
import { StepComponent } from "@/components/StepComponent"
import { CrowdfundInfo } from "@/components/CrowdfundInfo"
import { ExecutionHistoryComponent } from "@/components/ExecutionHistory"
import { sdk } from "@farcaster/miniapp-sdk"
import { useAccount, useSwitchChain } from "wagmi"
import { base } from "wagmi/chains"
import { useTrailAPI } from "@/hooks/useTrailAPI"
import { Music, Heart, ExternalLink } from "lucide-react"

// AppContent must be inside Web3Provider to use wagmi hooks
const AppContent = () => {
  const [isAppReady, setIsAppReady] = useState(false)
  const { address, status } = useAccount()
  const { switchChain } = useSwitchChain()
  const { getExecutionHistory, readData } = useTrailAPI()
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [crowdfundStatus, setCrowdfundStatus] = useState<{
    cancelled: boolean
    endTimestamp: string
    goal: string
    totalRaised: string
    userDonation: string
  } | null>(null)

  useEffect(() => {
    if (status === "connected") {
      switchChain({ chainId: base.id })
    }
  }, [switchChain, status])

  // Call sdk.actions.ready() when app is ready
  useEffect(() => {
    if (!isAppReady) {
      const markAppReady = async () => {
        try {
          console.log("[v0] Attempting to call sdk.actions.ready()...")
          await sdk.actions.ready()
          setIsAppReady(true)
          console.log("[v0] App marked as ready successfully!")
        } catch (error) {
          console.error("[v0] Failed to mark app as ready:", error)
          try {
            sdk.actions.ready()
            console.log("[v0] App marked as ready (fallback method)")
          } catch (fallbackError) {
            console.error("[v0] Fallback ready() call also failed:", fallbackError)
          }
          setIsAppReady(true) // Still mark as ready to prevent infinite loading
        }
      }

      const timer = setTimeout(() => {
        markAppReady()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isAppReady])

  useEffect(() => {
    const autoConnect = async () => {
      if (status === "disconnected") {
        try {
          const { connect } = await import("wagmi")
          // Auto-connect will be handled by the FarcasterConnect component
        } catch (error) {
          console.log("Auto-connect not available:", error)
        }
      }
    }
    autoConnect()
  }, [status])

  // Load execution history to determine completed steps
  useEffect(() => {
    const loadHistory = async () => {
      if (address) {
        const history = await getExecutionHistory()
        const completed = new Set(history.filter((h) => h.stepNumber > 0).map((h) => h.stepNumber))
        setCompletedSteps(completed)
      }
    }

    loadHistory()
  }, [address, getExecutionHistory])

  useEffect(() => {
    const fetchCrowdfundStatus = async () => {
      if (address) {
        try {
          // Fetch crowdfund data
          const crowdfundResponse = await readData("0198cb37-debe-7283-a718-cd73b460a92d", {})

          // Fetch user donation amount
          const donationResponse = await readData("0198cb37-debd-793b-b458-0243d4437624", {})

          if (crowdfundResponse?.outputs) {
            setCrowdfundStatus({
              cancelled:
                crowdfundResponse.outputs.cancelled?.value === "true" ||
                crowdfundResponse.outputs.cancelled?.value === true,
              endTimestamp: crowdfundResponse.outputs.endTimestamp?.value || "0",
              goal: crowdfundResponse.outputs.goal?.value || "0",
              totalRaised: crowdfundResponse.outputs.totalRaised?.value || "0",
              userDonation: donationResponse?.outputs?.amount?.value || "0",
            })
          }
        } catch (error) {
          console.error("Failed to fetch crowdfund status:", error)
        }
      }
    }

    fetchCrowdfundStatus()
  }, [address, readData])

  const handleStepComplete = (stepNumber: number) => {
    setCompletedSteps((prev) => new Set([...prev, stepNumber]))
  }

  const isStepEnabled = (stepNumber: number) => {
    if (stepNumber === 1) return status === "connected"
    return completedSteps.has(stepNumber - 1)
  }

  const steps = [
    {
      stepNumber: 1,
      title: "Approve USDC",
      description: "Approve the crowdfund contract to spend your USDC tokens",
      nodeId: "0198cb37-debe-7283-a718-cd72690dc1ce",
      userInputs: [
        {
          inputName: "inputs.value",
          intent: "amount of USDC to donate",
          valueType: "uint256",
          alreadyAppliedDecimals: 6,
        },
      ],
    },
    {
      stepNumber: 2,
      title: "Donate to Music for Relief",
      description: "Make your donation to support music relief efforts",
      nodeId: "0198cb37-debd-793b-b458-02447de0c4a8",
      userInputs: [
        {
          inputName: "inputs.amount",
          intent: "USDC to donate",
          valueType: "uint128",
          alreadyAppliedDecimals: 6,
        },
      ],
    },
    {
      stepNumber: 3,
      title: "Claim Refund (if necessary)",
      description: "Only available if the crowdfund goal is not reached by the end date",
      nodeId: "0198cb37-dec0-7030-a48c-b3b247eeac13",
      userInputs: [],
      isOptional: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-green-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-green-500 to-purple-600 rounded-lg">
                <Music className="w-6 h-6 text-white" />
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
                  Music Aid
                </h1>
                <p className="text-sm text-slate-600 font-medium">Songs for Recovery</p>
              </div>
            </div>
            <FarcasterConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Crowdfund Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-lg">
          <CrowdfundInfo />
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Donation Process
            </h2>
            <p className="text-slate-700">Follow these steps to make your charitable donation</p>
          </div>

          <div className="grid gap-4">
            {steps.map((step) => (
              <div
                key={step.stepNumber}
                className={`backdrop-blur-sm rounded-xl border shadow-lg ${
                  step.isOptional ? "bg-slate-50/60 border-slate-300 opacity-75" : "bg-white/80 border-green-200"
                }`}
              >
                <StepComponent
                  stepNumber={step.stepNumber}
                  title={step.title}
                  description={step.description}
                  userInputs={step.userInputs}
                  isEnabled={isStepEnabled(step.stepNumber)}
                  isCompleted={completedSteps.has(step.stepNumber)}
                  onComplete={() => handleStepComplete(step.stepNumber)}
                  isOptional={step.isOptional}
                  hideStepNumber={step.isOptional}
                  nodeId={step.nodeId}
                  crowdfundStatus={step.stepNumber === 3 ? crowdfundStatus : undefined}
                />
              </div>
            ))}
          </div>
        </div>

        {status !== "connected" && (
          <div className="text-center py-8 bg-gradient-to-r from-green-100 to-purple-100 rounded-xl border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Music className="w-5 h-5 text-green-600" />
              <Heart className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-slate-700 font-medium mb-2">Connect your Farcaster wallet to start donating</p>
            <p className="text-sm text-slate-500">Steps above will be enabled once connected</p>
          </div>
        )}

        {/* Execution History */}
        {status === "connected" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-lg">
            <ExecutionHistoryComponent />
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-green-200 p-3">
        <div className="text-center">
          <a
            href="https://herd.eco/trails/0198cb37-deb0-75fb-9d7a-838cc5254637/overlook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-green-600 transition-colors flex items-center justify-center gap-1 font-medium"
          >
            Powered by Herd
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  )
}
