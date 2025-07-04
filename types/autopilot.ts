export interface DepositState {
  estimatedApr: number
  amount: string
  optimalTickRange: {
    lower: number
    upper: number
  }
  isDepositing: boolean
  hasDeposited: boolean
}

export interface LiquidityPosition {
  id: string
  tokenA: string
  tokenB: string
  amountA: number
  amountB: number
  tickInfo: {
    currentTick: number
    currentPrice: number
    lowerTick: number
    lowerPrice: number
    upperTick: number
    upperPrice: number
    inRange: boolean
    rebalanceThreshold: number
  }
  currentApr: number
  aprAtEntry: number
  feesEarned: number
  vaultHealth: "in_range" | "out_of_range" | "needs_rebalance"
  capitalEfficiency: number
}

export interface AgentStatus {
  isActive: boolean
  currentPortfolioValue: number
  dailyProfitLoss: number
  totalProfitLoss: number
  lastRebalance: Date
  nextRebalance: Date
  healthScore: number
  alerts: string[]
  rebalancingEnabled: boolean
  compoundingEnabled: boolean
}

export interface AgentReport {
  timestamp: Date
  totalPortfolioValue: number
  gasSaved: number
  lpPosition: LiquidityPosition
  status: AgentStatus
  historicalPerformance: any[]
  transactions: any[]
  strategies: any[]
  agentLogs: AgentLog[]
}

export interface AgentLog {
  id: string
  timestamp: string
  type: "rebalance" | "compound" | "alert" | "optimization"
  status: "success" | "pending" | "failed"
  message: string
  gasUsed: number
  txHash: string
}
