"use client"

import { useState, useEffect, useCallback } from "react"

export interface AgentLog {
  id: string
  timestamp: Date
  action: string
  emoji: string
  details: string
}

export interface AgentState {
  // User Config
  targetBalance: number
  emergencyBuffer: number
  vaultAllocation: { aave: number; compound: number }
  creditLimit: number
  autoRepay: boolean
  bridgeChains: string[]
  rewardCategories: string[]

  // Live State
  currentBalance: number
  currentAPY: { aave: number; compound: number }
  creditUtilization: number
  pendingCashback: number

  // Agent Status
  isActive: boolean
  logs: AgentLog[]
}

const initialState: AgentState = {
  targetBalance: 300,
  emergencyBuffer: 50,
  vaultAllocation: { aave: 60, compound: 40 },
  creditLimit: 500,
  autoRepay: true,
  bridgeChains: ["base", "arbitrum"],
  rewardCategories: [],
  currentBalance: 250,
  currentAPY: { aave: 12.5, compound: 11.8 },
  creditUtilization: 0,
  pendingCashback: 0,
  isActive: false,
  logs: [],
}

export function useCoreAgent() {
  const [agentState, setAgentState] = useState<AgentState>(initialState)

  const addLog = useCallback((action: string, emoji: string, details: string) => {
    const newLog: AgentLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action,
      emoji,
      details,
    }

    setAgentState((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 50), // Keep only last 50 logs
    }))
  }, [])

  const updateAgentState = useCallback((updates: Partial<AgentState>) => {
    setAgentState((prev) => ({ ...prev, ...updates }))
  }, [])

  // Simulation functions
  const simulateSpending = useCallback(
    (amount: number) => {
      setAgentState((prev) => ({
        ...prev,
        currentBalance: Math.max(0, prev.currentBalance - amount),
      }))
      addLog("Spending Simulated", "💳", `Balance reduced by $${amount}`)
    },
    [addLog],
  )

  const simulateCreditUsage = useCallback(
    (amount: number) => {
      setAgentState((prev) => ({
        ...prev,
        creditUtilization: Math.min(prev.creditLimit, prev.creditUtilization + amount),
      }))
      addLog("Credit Used", "💰", `Credit utilization: $${agentState.creditUtilization + amount}`)
    },
    [addLog, agentState.creditUtilization],
  )

  const simulateCashback = useCallback(
    (merchant: string, amount: number) => {
      const cashback = amount * 0.02 // 2% cashback
      setAgentState((prev) => ({
        ...prev,
        pendingCashback: prev.pendingCashback + cashback,
      }))
      addLog("Cashback Earned", "🎁", `$${cashback.toFixed(2)} from ${merchant}`)
    },
    [addLog],
  )

  // Core agent loop - runs every 5 seconds when active
  useEffect(() => {
    if (!agentState.isActive) return

    const interval = setInterval(() => {
      setAgentState((prev) => {
        const newState = { ...prev }
        let actionTaken = false

        // 1. Check Balance
        if (newState.currentBalance < newState.targetBalance) {
          const topUpAmount = newState.targetBalance - newState.currentBalance
          newState.currentBalance = newState.targetBalance
          addLog(
            "Auto Top-Up",
            "✅",
            `Balance $${prev.currentBalance} < Target $${newState.targetBalance} → Top-Up $${topUpAmount} Triggered`,
          )
          actionTaken = true
        }

        // 2. Check Vault Rebalancing
        const apyDelta = Math.abs(newState.currentAPY.aave - newState.currentAPY.compound)
        if (apyDelta > 1.5) {
          // Rebalance if APY difference > 1.5%
          const betterProtocol = newState.currentAPY.aave > newState.currentAPY.compound ? "Aave" : "Compound"
          const worseProtocol = newState.currentAPY.aave > newState.currentAPY.compound ? "Compound" : "Aave"
          addLog("Vault Rebalanced", "🔁", `${worseProtocol} → ${betterProtocol} (+${apyDelta.toFixed(1)}% APY gain)`)
          actionTaken = true
        }

        // 3. Check Credit Auto-Repay
        const creditUtilizationPercent = (newState.creditUtilization / newState.creditLimit) * 100
        if (newState.autoRepay && creditUtilizationPercent > 80) {
          const repayAmount = Math.min(100, newState.creditUtilization)
          newState.creditUtilization = Math.max(0, newState.creditUtilization - repayAmount)
          addLog("Auto Credit Repay", "⚠️", `Credit Limit Near Max → Auto-Repay $${repayAmount}`)
          actionTaken = true
        }

        // 4. Claim Pending Cashback
        if (newState.pendingCashback > 0) {
          const claimAmount = newState.pendingCashback
          newState.currentBalance += claimAmount
          newState.pendingCashback = 0
          addLog("Cashback Claimed", "🎁", `$${claimAmount.toFixed(2)} claimed and added to balance`)
          actionTaken = true
        }

        // 5. Cross-chain Bridge Simulation
        if (Math.random() < 0.1 && newState.bridgeChains.length > 1) {
          // 10% chance
          const fromChain = newState.bridgeChains[0]
          const toChain = newState.bridgeChains[1]
          const bridgeAmount = 50 + Math.random() * 100
          addLog(
            "Cross-Chain Bridge",
            "🌉",
            `Bridged $${bridgeAmount.toFixed(0)} from ${fromChain} → ${toChain} via LI.FI`,
          )
          actionTaken = true
        }

        return newState
      })
    }, 5000) // 5 second interval

    return () => clearInterval(interval)
  }, [agentState.isActive, addLog])

  // APY Fluctuation - every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentState((prev) => ({
        ...prev,
        currentAPY: {
          aave: Math.max(8, Math.min(20, prev.currentAPY.aave + (Math.random() - 0.5) * 2)),
          compound: Math.max(8, Math.min(20, prev.currentAPY.compound + (Math.random() - 0.5) * 2)),
        },
      }))
    }, 10000) // 10 second interval

    return () => clearInterval(interval)
  }, [])

  return {
    agentState,
    updateAgentState,
    simulateSpending,
    simulateCreditUsage,
    simulateCashback,
    addLog,
  }
}
