"use client"

import { useState, useEffect, useCallback } from "react"
import type { AutopilotConfig, AutopilotStatus, AutopilotReport, LPPosition } from "@/types/autopilot"
import type { ethers } from "ethers"
import { truncateAddress } from "@/lib/utils"
import { executeRealRebalance } from "@/lib/engines/real-rebalance-engine"
import { getLatestPrice } from "@/lib/integrations/real-price-feed"

// Mock backend API calls (same as useAutopilot for config/status fetching)
const mockFetchAutopilotConfig = async (walletAddress: string): Promise<AutopilotConfig> => {
  console.log(`[Mock API] Fetching config for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        strategy: "liquidity_provision",
        riskTolerance: "medium",
        assets: ["USDC", "ETH"],
        allocation: { USDC: 0.5, ETH: 0.5 },
        slippageTolerance: 0.003, // 0.3%
        rebalanceFrequency: "daily",
        performanceThreshold: 0.01, // 1%
      })
    }, 1000)
  })
}

const mockUpdateAutopilotConfig = async (walletAddress: string, config: AutopilotConfig): Promise<boolean> => {
  console.log(`[Mock API] Updating config for ${truncateAddress(walletAddress)}:`, config)
  return new Promise((resolve) => {
    setTimeout(() => {
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
        isActive: true,
        currentPortfolioValue: 25000 + Math.random() * 2000 - 1000,
        dailyProfitLoss: Math.random() * 300 - 150,
        totalProfitLoss: Math.random() * 7000 - 3000,
        lastRebalance: new Date(Date.now() - Math.random() * 86400000 * 3), // Last 3 days
        nextRebalance: new Date(Date.now() + Math.random() * 86400000 * 3), // Next 3 days
        healthScore: Math.floor(70 + Math.random() * 30), // Higher health score for real
        alerts: [],
      })
    }, 800)
  })
}

const mockFetchLPPosition = async (walletAddress: string): Promise<LPPosition> => {
  console.log(`[Mock API] Fetching LP position for ${truncateAddress(walletAddress)}`)
  return new Promise((resolve) => {
    setTimeout(async () => {
      const currentEthPrice = await getLatestPrice("ETH/USD")
      const inRange = Math.random() > 0.2 // 80% chance to be in range
      resolve({
        id: "real_lp_pos_456",
        tokenA: "USDC",
        tokenB: "ETH",
        amountA: 8000 + Math.random() * 2000,
        amountB: (8000 + Math.random() * 2000) / currentEthPrice.price, // Amount B based on current price
        lowerPrice: currentEthPrice.price * 0.98,
        upperPrice: currentEthPrice.price * 1.02,
        currentPrice: currentEthPrice.price,
        inRange: inRange,
        capitalEfficiency: 0.8 + Math.random() * 0.15,
        feesEarned: Math.random() * 1000,
      })
    }, 900)
  })
}

export function useRealAutopilot(walletAddress: string, signer: ethers.Signer | null) {
  const [config, setConfig] = useState<AutopilotConfig>({
    strategy: "liquidity_provision",
    riskTolerance: "medium",
    assets: [],
    allocation: {},
    slippageTolerance: 0,
  })
  const [status, setStatus] = useState<AutopilotStatus | null>(null)
  const [lpPosition, setLpPosition] = useState<LPPosition | null>(null)
  const [report, setReport] = useState<AutopilotReport | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rebalanceStatus, setRebalanceStatus] = useState<"idle" | "executing" | "completed" | "failed">("idle")

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [fetchedConfig, fetchedStatus, fetchedLpPosition] = await Promise.all([
        mockFetchAutopilotConfig(walletAddress),
        mockFetchAutopilotStatus(walletAddress),
        mockFetchLPPosition(walletAddress),
      ])
      setConfig(fetchedConfig)
      setStatus(fetchedStatus)
      setLpPosition(fetchedLpPosition)

      setReport({
        timestamp: new Date(),
        status: fetchedStatus,
        lpPosition: fetchedLpPosition,
        historicalPerformance: [],
        recentTransactions: [],
      })
    } catch (err: any) {
      setError(err.message || "Failed to fetch real autopilot data.")
      console.error("Error fetching real autopilot data:", err)
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    if (walletAddress) {
      fetchAllData()
      const interval = setInterval(fetchAllData, 60000) // Poll every 60 seconds
      return () => clearInterval(interval)
    }
  }, [walletAddress, fetchAllData])

  const updateConfig = async (newConfig: AutopilotConfig) => {
    setLoading(true)
    setError(null)
    try {
      const success = await mockUpdateAutopilotConfig(walletAddress, newConfig)
      if (success) {
        setConfig(newConfig)
        await fetchAllData()
      } else {
        throw new Error("Configuration update failed.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to update configuration.")
      console.error("Error updating config:", err)
    } finally {
      setLoading(false)
    }
  }

  const triggerRebalance = async () => {
    if (!signer || !lpPosition) {
      setError("Wallet not connected or LP position not loaded for rebalance.")
      return false
    }

    setRebalanceStatus("executing")
    setError(null)
    try {
      const result = await executeRealRebalance(walletAddress, config, lpPosition, signer)
      if (result.success) {
        setRebalanceStatus("completed")
        await fetchAllData() // Refetch all data to reflect changes
        return true
      } else {
        throw new Error(result.message || "Real rebalance failed.")
      }
    } catch (err: any) {
      setRebalanceStatus("failed")
      setError(err.message || "Failed to trigger real rebalance.")
      console.error("Error triggering real rebalance:", err)
      return false
    }
  }

  return {
    config,
    status,
    lpPosition,
    report,
    loading,
    error,
    rebalanceStatus,
    updateConfig,
    triggerRebalance,
    fetchAllData,
  }
}
