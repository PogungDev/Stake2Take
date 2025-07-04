"use client"

import { useState, useEffect, useCallback } from "react"

export interface AgentLog {
  id: string
  timestamp: string
  type: "balance" | "vault" | "rewards" | "credit" | "system"
  message: string
  emoji: string
}

export interface AgentState {
  isActive: boolean
  balance: number
  targetBalance: number
  vaultAave: number
  vaultCompound: number
  cashbackPending: number
  creditUsed: number
  creditLimit: number
}

export function useSmartAgent() {
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [agentState, setAgentState] = useState<AgentState>({
    isActive: false,
    balance: 250,
    targetBalance: 300,
    vaultAave: 60,
    vaultCompound: 40,
    cashbackPending: 8.5,
    creditUsed: 150,
    creditLimit: 500,
  })

  const addLog = useCallback((type: AgentLog["type"], message: string, emoji: string) => {
    const newLog: AgentLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      type,
      message,
      emoji,
    }
    setLogs((prev) => [newLog, ...prev].slice(0, 50)) // Keep last 50 logs
  }, [])

  // Agent monitoring loop - runs every 5 seconds when active
  useEffect(() => {
    if (!agentState.isActive) return

    const interval = setInterval(() => {
      // Check balance vs target
      if (agentState.balance < agentState.targetBalance) {
        const topUpAmount = agentState.targetBalance - agentState.balance
        addLog("balance", `Balance $${agentState.balance} < Target → Top-Up $${topUpAmount}`, "✅")
        setAgentState((prev) => ({ ...prev, balance: prev.targetBalance }))
      }

      // Check vault rebalancing (simulate APY changes)
      const apyDelta = Math.random() * 3 - 1.5 // -1.5% to +1.5%
      if (Math.abs(apyDelta) > 1.2) {
        const direction = apyDelta > 0 ? "Compound → Aave" : "Aave → Compound"
        addLog("vault", `Rebalanced: ${direction} (APY delta: ${apyDelta > 0 ? "+" : ""}${apyDelta.toFixed(1)}%)`, "🔁")
      }

      // Check cashback auto-claim
      if (agentState.cashbackPending >= 10) {
        addLog("rewards", `Auto-claimed $${agentState.cashbackPending.toFixed(2)} cashback`, "🎁")
        setAgentState((prev) => ({ ...prev, cashbackPending: 0 }))
      }

      // Check credit utilization
      const utilization = (agentState.creditUsed / agentState.creditLimit) * 100
      if (utilization > 80) {
        const repayAmount = Math.min(100, agentState.creditUsed)
        addLog("credit", `Credit ${utilization.toFixed(0)}% → Auto-Repay $${repayAmount}`, "⚠️")
        setAgentState((prev) => ({ ...prev, creditUsed: Math.max(0, prev.creditUsed - repayAmount) }))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [
    agentState.isActive,
    agentState.balance,
    agentState.targetBalance,
    agentState.cashbackPending,
    agentState.creditUsed,
    agentState.creditLimit,
    addLog,
  ])

  const activateAgent = useCallback(() => {
    setAgentState((prev) => ({ ...prev, isActive: true }))
    addLog("system", "Smart Agent activated - monitoring every 5 seconds", "🤖")
  }, [addLog])

  const deactivateAgent = useCallback(() => {
    setAgentState((prev) => ({ ...prev, isActive: false }))
    addLog("system", "Smart Agent deactivated", "⏹️")
  }, [addLog])

  const simulateSpending = useCallback(
    (amount: number, category: string) => {
      const newBalance = Math.max(0, agentState.balance - amount)
      setAgentState((prev) => ({ ...prev, balance: newBalance }))
      addLog("balance", `${category} spending -$${amount} → Balance: $${newBalance}`, "💳")

      // Trigger immediate check if below target
      if (newBalance < agentState.targetBalance && agentState.isActive) {
        setTimeout(() => {
          const topUpAmount = agentState.targetBalance - newBalance
          addLog("balance", `Balance $${newBalance} < Target → Top-Up $${topUpAmount}`, "✅")
          setAgentState((prev) => ({ ...prev, balance: prev.targetBalance }))
        }, 1000)
      }
    },
    [agentState.balance, agentState.targetBalance, agentState.isActive, addLog],
  )

  const simulateAPYChange = useCallback(() => {
    const delta = (Math.random() * 4 - 2).toFixed(1) // -2% to +2%
    const direction = Number.parseFloat(delta) > 0 ? "Compound → Aave" : "Aave → Compound"
    addLog("vault", `Rebalanced: ${direction} (APY delta: ${Number.parseFloat(delta) > 0 ? "+" : ""}${delta}%)`, "🔁")
  }, [addLog])

  const simulateCashback = useCallback(
    (merchant: string, amount: number) => {
      const cashback = amount * 0.02 // 2% cashback
      setAgentState((prev) => ({ ...prev, cashbackPending: prev.cashbackPending + cashback }))
      addLog("rewards", `Cashback Earned: $${cashback.toFixed(2)} from ${merchant} (2% back)`, "🎁")
    },
    [addLog],
  )

  const simulateCreditUsage = useCallback(
    (amount: number) => {
      const newUsed = Math.min(agentState.creditLimit, agentState.creditUsed + amount)
      setAgentState((prev) => ({ ...prev, creditUsed: newUsed }))
      const utilization = (newUsed / agentState.creditLimit) * 100
      addLog("credit", `Credit used +$${amount} → ${utilization.toFixed(0)}% utilization`, "💳")

      // Trigger immediate repay if over 80%
      if (utilization > 80 && agentState.isActive) {
        setTimeout(() => {
          const repayAmount = Math.min(100, newUsed)
          addLog("credit", `Credit ${utilization.toFixed(0)}% → Auto-Repay $${repayAmount}`, "⚠️")
          setAgentState((prev) => ({ ...prev, creditUsed: Math.max(0, prev.creditUsed - repayAmount) }))
        }, 1000)
      }
    },
    [agentState.creditUsed, agentState.creditLimit, agentState.isActive, addLog],
  )

  const updateTargetBalance = useCallback(
    (target: number) => {
      setAgentState((prev) => ({ ...prev, targetBalance: target }))
      addLog("system", `Target balance updated to $${target}`, "🎯")
    },
    [addLog],
  )

  const updateCreditLimit = useCallback(
    (limit: number) => {
      setAgentState((prev) => ({ ...prev, creditLimit: limit }))
      addLog("system", `Credit limit updated to $${limit}`, "💳")
    },
    [addLog],
  )

  return {
    logs,
    agentState,
    activateAgent,
    deactivateAgent,
    simulateSpending,
    simulateAPYChange,
    simulateCashback,
    simulateCreditUsage,
    updateTargetBalance,
    updateCreditLimit,
    addLog,
  }
}
