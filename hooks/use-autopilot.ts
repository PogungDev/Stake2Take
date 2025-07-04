"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  AutopilotConfig,
  AutopilotStatus,
  LPPosition,
  Strategy,
  AgentLogEntry,
  ActionHistory,
} from "@/types/autopilot"
import { truncateAddress } from "@/lib/utils"
import type { AgentState as SmartAgentState, AgentAction, LiveMetrics } from "@/types/app-structure"
import { SpendingPredictionEngine } from "@/lib/engines/spending-prediction-engine"
import { VaultRebalancingEngine } from "@/lib/engines/vault-rebalancing-engine"
import { CrossChainLiquidityEngine } from "@/lib/engines/cross-chain-liquidity-engine"
import { RewardOptimizationEngine } from "@/lib/engines/reward-optimization-engine"
import { CreditManagementEngine } from "@/lib/engines/credit-management-engine"
import { LoggingEngine } from "@/lib/engines/logging-engine"
import type { AutopilotState } from "@/types/autopilot" // Declare the AutopilotState variable

// Simple mock data for the autopilot system
export interface SmartConfig {
  riskLevel: number
  emergencyBuffer: number
  apyDeltaThreshold: number
  maxBridgeTime: number
  preferredChains: number[]
  autoClaimRewards: boolean
  rewardCategories: string[]
}

// Mock backend API calls
const mockFetchAutopilotConfig = async (walletAddress: string): Promise<AutopilotConfig> => {
  console.log(`[Mock API] Fetching config for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        strategy: "balanced",
        riskTolerance: "medium",
        assets: ["USDC", "ETH"],
        allocation: { USDC: 0.5, ETH: 0.5 },
        slippageTolerance: 0.005,
        rebalanceFrequency: "weekly",
        performanceThreshold: 0.02,
      })
    }, 1000)
  })
}

const mockUpdateAutopilotConfig = async (walletAddress: string, config: AutopilotConfig): Promise<boolean> => {
  console.log(`[Mock API] Updating config for ${truncateAddress(walletAddress)}:`, config)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate success or failure
      if (Math.random() > 0.1) {
        resolve(true)
      } else {
        throw new Error("Failed to update config due to a mock network error.")
      }
    }, 1500)
  })
}

const mockFetchAutopilotStatus = async (walletAddress: string): Promise<AutopilotStatus> => {
  console.log(`[Mock API] Fetching status for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        isActive: false,
        currentPortfolioValue: 15000 + Math.random() * 1000 - 500,
        dailyProfitLoss: Math.random() * 200 - 100,
        totalProfitLoss: Math.random() * 5000 - 2000,
        lastRebalance: new Date(Date.now() - Math.random() * 86400000 * 7),
        nextRebalance: new Date(Date.now() + Math.random() * 86400000 * 7),
        healthScore: Math.floor(Math.random() * 100),
        alerts: [],
        rebalancingEnabled: true,
        compoundingEnabled: true,
      })
    }, 800)
  })
}

const mockFetchLPPosition = async (walletAddress: string): Promise<LPPosition> => {
  console.log(`[Mock API] Fetching LP position for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      const currentPrice = 2000 + Math.random() * 200 - 100
      const lowerPrice = 1900
      const upperPrice = 2100
      const inRange = currentPrice >= lowerPrice && currentPrice <= upperPrice

      resolve({
        id: "lp_pos_123",
        tokenA: "USDC",
        tokenB: "ETH",
        amountA: 5000 + Math.random() * 1000,
        amountB: 2 + Math.random() * 0.5,
        tickInfo: {
          lowerTick: -276324,
          upperTick: -276224,
          currentTick: -276274,
          lowerPrice,
          upperPrice,
          currentPrice,
          inRange,
          rebalanceThreshold: 50, // ticks
        },
        capitalEfficiency: 0.7 + Math.random() * 0.3,
        feesEarned: Math.random() * 50, // Trading fees earned
        aprAtEntry: 8.5, // Fee-based APR
        currentApr: 6.2 + Math.random() * 6, // 6-12% from trading fees
        vaultHealth: inRange ? "in_range" : currentPrice < lowerPrice ? "out_of_range_low" : "out_of_range_high",
      })
    }, 900)
  })
}

const mockFetchStrategies = async (walletAddress: string): Promise<Strategy[]> => {
  console.log(`[Mock API] Fetching strategies for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "strat_1",
          name: "ETH-USDC LP Pool",
          type: "liquidity_provision",
          isActive: true,
          apy: 9.2, // Trading fee APR
          assets: ["ETH", "USDC"],
        },
        {
          id: "strat_2",
          name: "BTC-USDC LP Pool",
          type: "liquidity_provision",
          isActive: false,
          apy: 7.8, // Trading fee APR
          assets: ["BTC", "USDC"],
        },
        {
          id: "strat_3",
          name: "SOL-USDC LP Pool",
          type: "liquidity_provision",
          isActive: false,
          apy: 11.5, // Trading fee APR
          assets: ["SOL", "USDC"],
        },
      ])
    }, 700)
  })
}

const mockFetchAgentLogs = async (walletAddress: string): Promise<AgentLogEntry[]> => {
  console.log(`[Mock API] Fetching agent logs for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "log_1",
          timestamp: "2 hours ago",
          message: "🔁 Rebalanced ETH-USDC LP range for optimal fee capture",
          type: "rebalance",
          txHash: "0xabc123def456",
          gasUsed: 150000,
          aprBefore: 7.2,
          aprAfter: 9.1,
          status: "success",
        },
        {
          id: "log_2",
          timestamp: "6 hours ago",
          message: "💰 Compounded $12.5 trading fees into new LP position",
          type: "compound",
          txHash: "0xdef456abc789",
          gasUsed: 120000,
          status: "success",
        },
        {
          id: "log_3",
          timestamp: "1 day ago",
          message: "💰 Initial LP deposit: 5000 USDC in ETH-USDC pool",
          type: "deposit",
          txHash: "0x789abc456def",
          gasUsed: 200000,
          status: "success",
        },
      ])
    }, 600)
  })
}

const mockTriggerRebalance = async (walletAddress: string): Promise<boolean> => {
  console.log(`[Mock API] Triggering rebalance for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() > 0.2) {
        resolve(true) // Simulate successful rebalance initiation
      } else {
        throw new Error("Mock rebalance failed to initiate.")
      }
    }, 2000)
  })
}

const mockDeployAutopilotAgent = async (walletAddress: string): Promise<string> => {
  console.log(`[Mock API] Deploying agent for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`0x${Math.random().toString(16).substring(2, 12)}...${Math.random().toString(16).substring(2, 6)}`)
    }, 3000)
  })
}

const mockActivateAutopilot = async (walletAddress: string): Promise<boolean> => {
  console.log(`[Mock API] Activating autopilot for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1500)
  })
}

const mockDeactivateAutopilot = async (walletAddress: string): Promise<boolean> => {
  console.log(`[Mock API] Deactivating autopilot for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1500)
  })
}

// Smart Agent Hook - Zero User Input Experience
export function useAutopilot() {
  // Legacy state (keep for compatibility)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<AutopilotConfig | null>(null)
  const [status, setStatus] = useState<AutopilotStatus | null>(null)
  const [lpPosition, setLpPosition] = useState<LPPosition | null>(null)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([])
  const [agentAddress, setAgentAddress] = useState<string | null>(null)

  // NEW: Smart Agent State
  const [smartConfig, setSmartConfig] = useState<SmartConfig>({
    riskLevel: 5,
    emergencyBuffer: 50,
    apyDeltaThreshold: 2,
    maxBridgeTime: 30,
    preferredChains: [1, 8453, 42161],
    autoClaimRewards: true,
    rewardCategories: ["Food", "Transport"],
  })

  const [agentState, setAgentState] = useState<SmartAgentState>({
    isActive: false,
    totalActionsToday: 0,
    lastAction: new Date(),
  })

  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    currentCardBalance: 285,
    currentAPY: 8.5,
    pendingRewards: 12.3,
    creditUtilization: 275,
    monthlySpendingCap: 1200,
    spendingTrend: "up",
    yieldEarnedToday: 4.2,
    totalVaultValue: 8500,
    nextTopUp: 0,
    spendingForecast: 320,
    bridgesPending: 0,
    averageBridgeTime: 21,
  })

  const [actionHistory, setActionHistory] = useState<ActionHistory[]>([])

  // Initialize Core Automation Engines
  const spendingEngine = new SpendingPredictionEngine()
  const vaultEngine = new VaultRebalancingEngine()
  const liquidityEngine = new CrossChainLiquidityEngine()
  const rewardEngine = new RewardOptimizationEngine()
  const creditEngine = new CreditManagementEngine()
  const loggingEngine = new LoggingEngine()

  // 🧠 Core Automation Engine - Implements Business Scenario A-Z
  const runAutomationCycle = useCallback(async () => {
    if (!agentState.isActive) return

    const startTime = Date.now()
    const actions: AgentAction[] = []

    loggingEngine.log("info", "automation", "🚀 Starting automation cycle", {
      cardBalance: liveMetrics.currentCardBalance,
      vaultValue: liveMetrics.totalVaultValue,
      creditUtilization: liveMetrics.creditUtilization,
    })

    // 🪙 1. AI Spending Prediction & Auto Top-Up
    const spendingForecast = spendingEngine.analyzePrediction(
      liveMetrics.currentCardBalance,
      smartConfig.emergencyBuffer,
    )
    loggingEngine.logDecision(
      "spending",
      spendingForecast.shouldTopUp ? `Top-up needed: $${spendingForecast.topUpAmount}` : "No top-up needed",
      spendingForecast.reasoning,
      { currentBalance: liveMetrics.currentCardBalance, forecast: spendingForecast.nextSevenDays },
      0.95,
    )

    const topUpAction = spendingEngine.generateTopUpAction(spendingForecast)
    if (topUpAction) {
      actions.push(topUpAction)
    }

    // 🔀 2. Vault Rebalancing Intelligence
    const rebalanceOpportunity = vaultEngine.analyzeRebalanceOpportunity(liveMetrics.totalVaultValue, smartConfig)
    if (rebalanceOpportunity) {
      const rebalanceAction = vaultEngine.generateRebalanceAction(rebalanceOpportunity)
      if (rebalanceAction) {
        actions.push(rebalanceAction)
      }
    }

    // 🌉 3. Cross-Chain Liquidity Management
    const liquidityOpportunity = liquidityEngine.analyzeLiquidityRebalance(smartConfig)
    const bridgeActions = liquidityEngine.generateBridgeActions(liquidityOpportunity)
    actions.push(...bridgeActions)

    // 🎁 4. Reward Optimization Engine
    const rewardAnalysis = rewardEngine.analyzeRewardOptimization(smartConfig)
    const rewardActions = rewardEngine.generateRewardActions(rewardAnalysis)
    actions.push(...rewardActions)

    // 💳 5. Credit Management Intelligence
    const creditAnalysis = creditEngine.analyzeCreditUsage(
      liveMetrics.creditUtilization,
      liveMetrics.monthlySpendingCap,
      liveMetrics.yieldEarnedToday,
      smartConfig,
    )
    const creditAction = creditEngine.generateCreditAction(creditAnalysis)
    if (creditAction) {
      actions.push(creditAction)
    }

    // Execute Actions (simulate blockchain execution)
    if (actions.length > 0) {
      loggingEngine.log("info", "automation", `📋 Executing ${actions.length} actions`, {
        actionTypes: actions.map((a) => a.type),
        totalAmount: actions.reduce((sum, a) => sum + a.amount, 0),
      })

      setActionHistory((prev) => [...actions, ...prev])
      setAgentState((prev) => ({
        ...prev,
        totalActionsToday: prev.totalActionsToday + actions.length,
        lastAction: new Date(),
      }))

      // Simulate successful execution after delay
      setTimeout(() => {
        const executionTime = Date.now() - startTime

        actions.forEach((action) => {
          loggingEngine.logActionExecution(action, true, executionTime)
        })

        setActionHistory((prev) =>
          prev.map((action) =>
            actions.find((a) => a.id === action.id) ? { ...action, status: "success" as const } : action,
          ),
        )

        // Update live metrics based on actions
        setLiveMetrics((prev) => {
          const newMetrics = { ...prev }

          actions.forEach((action) => {
            switch (action.type) {
              case "top-up":
                newMetrics.currentCardBalance += action.amount
                break
              case "claim-reward":
                newMetrics.pendingRewards = 0
                newMetrics.currentCardBalance += action.amount
                break
              case "repay-credit":
                newMetrics.creditUtilization -= action.amount
                break
            }
          })

          return newMetrics
        })

        loggingEngine.log("success", "automation", "✅ Automation cycle completed", {
          actionsExecuted: actions.length,
          executionTime,
          totalAmount: actions.reduce((sum, a) => sum + a.amount, 0),
        })
      }, 2000)
    } else {
      loggingEngine.log("info", "automation", "💤 No actions needed - all systems optimal")
    }

    return actions
  }, [agentState, liveMetrics, smartConfig])

  // 🚀 Activate Agent with Smart Defaults (Zero User Input)
  const activateAgent = useCallback(() => {
    setAgentState((prev) => ({
      ...prev,
      isActive: true,
    }))

    console.log("🧠 Agent activated with Smart Defaults - Zero user input required")

    // Immediately run first automation cycle
    setTimeout(runAutomationCycle, 1000)
  }, [runAutomationCycle])

  // ⏸️ Pause Agent
  const pauseAgent = useCallback(() => {
    setAgentState((prev) => ({
      ...prev,
      isActive: false,
    }))
  }, [])

  // 📊 Real-time Metrics Simulation
  useEffect(() => {
    if (!agentState.isActive) return

    const interval = setInterval(() => {
      // Simulate yield accumulation
      setLiveMetrics((prev) => ({
        ...prev,
        yieldEarnedToday: prev.yieldEarnedToday + 0.02, // $0.02 every 10 seconds
        currentAPY: 8.5 + (Math.random() - 0.5) * 0.5, // APY fluctuation
        totalVaultValue: prev.totalVaultValue + 0.01, // Slow growth
      }))

      // Update spending forecast
      setAgentState((prev) => ({
        ...prev,
        spendingForecast7d: 320 + (Math.random() - 0.5) * 20, // $300-$340 range
        recommendedTopUp: Math.max(0, 320 + smartConfig.emergencyBuffer - liveMetrics.currentCardBalance),
      }))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [agentState.isActive, smartConfig.emergencyBuffer, liveMetrics.currentCardBalance])

  // 🔄 Auto-run automation cycle
  useEffect(() => {
    if (!agentState.isActive) return

    const interval = setInterval(runAutomationCycle, 30000) // Run every 30 seconds
    return () => clearInterval(interval)
  }, [agentState.isActive, runAutomationCycle])

  // Legacy functions (keep for compatibility)
  const fetchConfig = useCallback(async (walletAddress: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const configData = await mockFetchAutopilotConfig(walletAddress)
      setConfig(configData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch config")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateConfig = useCallback(async (walletAddress: string, newConfig: AutopilotConfig) => {
    setIsLoading(true)
    setError(null)
    try {
      await mockUpdateAutopilotConfig(walletAddress, newConfig)
      setConfig(newConfig)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update config")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchStatus = useCallback(async (walletAddress: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const statusData = await mockFetchAutopilotStatus(walletAddress)
      setStatus(statusData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchLPPosition = useCallback(async (walletAddress: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const lpData = await mockFetchLPPosition(walletAddress)
      setLpPosition(lpData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch LP position")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchStrategies = useCallback(async (walletAddress: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const strategiesData = await mockFetchStrategies(walletAddress)
      setStrategies(strategiesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch strategies")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchAgentLogs = useCallback(async (walletAddress: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const logsData = await mockFetchAgentLogs(walletAddress)
      setAgentLogs(logsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch agent logs")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const triggerRebalance = useCallback(
    async (walletAddress: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await mockTriggerRebalance(walletAddress)
        // Refresh status after rebalance
        await fetchStatus(walletAddress)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to trigger rebalance")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchStatus],
  )

  const deployAgent = useCallback(async (walletAddress: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const deployedAddress = await mockDeployAutopilotAgent(walletAddress)
      setAgentAddress(deployedAddress)
      return deployedAddress
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deploy agent")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const activateAutopilotLegacy = useCallback(
    async (walletAddress: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await mockActivateAutopilot(walletAddress)
        activateAgent() // Activate new smart agent
        await fetchStatus(walletAddress)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to activate autopilot")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchStatus, activateAgent],
  )

  const deactivateAutopilotLegacy = useCallback(
    async (walletAddress: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await mockDeactivateAutopilot(walletAddress)
        pauseAgent() // Pause smart agent
        await fetchStatus(walletAddress)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to deactivate autopilot")
      } finally {
        setIsLoading(false)
      }
    },
    [fetchStatus, pauseAgent],
  )

  // NEW: Autopilot State
  const [autopilotState, setAutopilotState] = useState<AutopilotState>({
    isActive: false,
    balance: 1250.75,
    targetBalance: 1500,
    lastRebalance: new Date(),
    totalEarnings: 125.5,
    apy: 8.5,
  })

  const activateAutopilotNew = async () => {
    setIsLoading(true)
    // Simulate activation
    setTimeout(() => {
      setAutopilotState((prev) => ({ ...prev, isActive: true }))
      setIsLoading(false)
    }, 2000)
  }

  const deactivateAutopilotNew = () => {
    setAutopilotState((prev) => ({ ...prev, isActive: false }))
  }

  const updateAutopilotSettings = (updates: Partial<AutopilotState>) => {
    setAutopilotState((prev) => ({ ...prev, ...updates }))
  }

  return {
    // Legacy state (for compatibility)
    isLoading,
    error,
    config,
    status,
    lpPosition,
    strategies,
    agentLogs,
    agentAddress,

    // NEW: Smart Agent State
    smartConfig,
    agentState,
    actionHistory,
    liveMetrics,

    // NEW: Autopilot State
    autopilotState,

    // Legacy actions
    fetchConfig,
    updateConfig,
    fetchStatus,
    fetchLPPosition,
    fetchStrategies,
    fetchAgentLogs,
    triggerRebalance,
    deployAgent,
    activateAutopilotLegacy,
    deactivateAutopilotLegacy,

    // NEW: Smart Agent Actions
    activateAgent,
    pauseAgent,
    runAutomationCycle,
    updateSmartConfig: setSmartConfig,

    // NEW: Autopilot Actions
    activateAutopilotNew,
    deactivateAutopilotNew,
    updateAutopilotSettings,

    // Computed values
    isAgentActive: agentState.isActive,
    totalOptimizationGain: actionHistory.reduce((sum, action) => sum + (action.optimizationGain || 0), 0),
    actionsToday: agentState.totalActionsToday,

    // Business scenario metrics
    needsTopUp: liveMetrics.currentCardBalance < agentState.spendingForecast7d + smartConfig.emergencyBuffer,
    creditUtilizationPercent: (liveMetrics.creditUtilization / smartConfig.monthlySpendingCap) * 100,
    isFullyAutomated: agentState.isActive,
  }
}
