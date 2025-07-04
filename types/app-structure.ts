import type React from "react"

// Clear app structure definition
export interface AppStructure {
  tabs: NavTab[]
  testableFeatures: TestableFeature[]
  demoFlow: DemoStep[]
}

export interface NavTab {
  name: string
  route: string
  purpose: string
  subFeatures: SubFeature[]
  priority: "high" | "medium" | "low"
}

export interface SubFeature {
  name: string
  description: string
  isTestable: boolean
  estimatedHours: number
}

export interface TestableFeature {
  feature: string
  testMethod: string
  expectedResult: string
  demoValue: string
}

export interface DemoStep {
  step: number
  action: string
  expectedResult: string
  demoScript: string
}

export type AppSection = "dashboard" | "optimizations" | "bridge" | "history" | "settings" | "help"

export type NavItem = {
  title: string
  href: string
  icon: React.ReactNode // Lucide icon component
  disabled?: boolean
}

export type SidebarNavItem = NavItem & {
  items: SidebarNavItem[]
}

export type DashboardConfig = {
  mainNav: NavItem[]
  sidebarNav: SidebarNavItem[]
}

export type UserProfile = {
  name: string
  email: string
  avatarUrl?: string
  walletAddress: string
}

export type AppSettings = {
  theme: "light" | "dark" | "system"
  notifications: {
    email: boolean
    inApp: boolean
  }
  gasPreference: "fast" | "standard" | "slow"
}

// Smart Defaults System for Zero User Input Experience
export interface SmartDefaults {
  // Balance Management
  targetBalance: number
  emergencyBuffer: number

  // Risk Management
  riskLevel: number // 1-10
  monthlyCreditCap: number

  // Yield Strategy
  apyDeltaThreshold: number // Rebalance when APY difference > this %

  // Cross-chain Preferences
  preferredChains: number[]
  maxBridgeTime: number // seconds

  // Automation Settings
  autoClaimRewards: boolean
  rewardCategories: string[]
}

export const DEFAULT_SMART_CONFIG: SmartDefaults = {
  targetBalance: 300,
  emergencyBuffer: 50,
  riskLevel: 5,
  monthlyCreditCap: 500,
  apyDeltaThreshold: 2.0,
  preferredChains: [1, 8453, 42161], // Ethereum, Base, Arbitrum
  maxBridgeTime: 30,
  autoClaimRewards: true,
  rewardCategories: ["Food", "Transport", "Digital Goods"],
}

// Agent Status & State
export interface AgentState {
  isActive: boolean
  mode: "auto" | "manual" | "paused"
  lastAction: Date
  totalActionsToday: number

  // Business Scenario State
  cardBalance: number
  vaultBalance: number
  totalYieldEarned: number
  spendingForecast7d: number
  recommendedTopUp: number
  nextRebalanceETA: Date
  optimizationGainPercent: number
  gasSavedUSD: number
  rewardsClaimedUSD: number
}

// Agent Actions & Logs
export interface AgentAction {
  id: string
  type: "top-up" | "rebalance" | "bridge" | "claim-reward" | "repay-credit"
  timestamp: Date
  amount: number
  token: string
  status: "pending" | "success" | "failed"
  reason: string
  optimizationGain?: number
  fromChain?: number
  toChain?: number
  executionTimeMs?: number
}

// Real-time Monitoring
export interface LiveMetrics {
  // Card & Spending
  currentCardBalance: number
  dailySpending: number
  weeklySpending: number
  spendingTrend: "up" | "down" | "stable"
  spendingForecast: number
  nextTopUp: number

  // Vault & Yield
  currentAPY: number
  totalVaultValue: number
  yieldEarnedToday: number

  // Cross-chain
  bridgesPending: number
  averageBridgeTime: number

  // Rewards & Credit
  pendingRewards: number
  creditUtilization: number
  monthlySpendingCap: number
}

// User Settings
export interface UserSettings {
  targetBalance: number
  bufferAmount: number
  vaultAllocation: {
    aave: number
    compound: number
  }
  maxCredit: number
  autoRepayFromYield: boolean
  riskLevel: "conservative" | "moderate" | "aggressive"
  cashbackCategories: string[]
  isAgentDeployed: boolean
  isAgentActive: boolean
}

// Journey Progress
export interface JourneyProgress {
  balanceConfigured: boolean
  vaultConfigured: boolean
  preferencesSet: boolean
  rewardsConfigured: boolean
  agentDeployed: boolean
  agentActivated: boolean
}

// Card Data
export interface CardData {
  currentBalance: number
  weeklySpending: number
  monthlySpending: number
  lastTopUp: Date
  spendingTrend: "up" | "down" | "stable"
}

// Vault Data
export interface VaultData {
  totalValue: number
  aaveBalance: number
  compoundBalance: number
  aaveAPY: number
  compoundAPY: number
  totalEarnings: number
  lastRebalance: Date
}

// Credit Data
export interface CreditData {
  currentUtilization: number
  availableCredit: number
  monthlyYield: number
  lastRepayment: Date
}

// Rewards Data
export interface RewardsData {
  totalEarnedThisMonth: number
  pendingRewards: number
  lastClaimed: Date
  recentTransactions: Array<{
    merchant: string
    amount: number
    cashback: number
    category: string
  }>
}

// App structure definition
export const APP_STRUCTURE: AppStructure = {
  tabs: [
    {
      name: "Dashboard",
      route: "/dashboard", // Route is conceptual for single-page app
      purpose: "Overall portfolio overview & active smart agent summary",
      priority: "high",
      subFeatures: [
        {
          name: "Total Portfolio Value",
          description: "Display combined value of all assets managed by VaultMaster AI",
          isTestable: true,
          estimatedHours: 2,
        },
        {
          name: "Overall APY Tracking",
          description: "Aggregated real-time APY across all active strategies",
          isTestable: true,
          estimatedHours: 4,
        },
        {
          name: "Total Gas Saved",
          description: "Cumulative gas savings from automated operations",
          isTestable: true,
          estimatedHours: 3,
        },
        {
          name: "Active Strategies Count",
          description: "Number of currently running smart agent strategies",
          isTestable: true,
          estimatedHours: 2,
        },
        {
          name: "Recent Agent Activity",
          description: "List of recent automated actions (rebalances, compounds, claims)",
          isTestable: true,
          estimatedHours: 3,
        },
      ],
    },
    {
      name: "Strategies",
      route: "/strategies",
      purpose: "Manage and configure smart agent automation workflows",
      priority: "high",
      subFeatures: [
        {
          name: "Strategy Activation/Deactivation",
          description: "Toggle automated strategies on/off",
          isTestable: true,
          estimatedHours: 4,
        },
        {
          name: "Strategy Configuration",
          description: "Adjust parameters for specific automation (e.g., rebalance thresholds)",
          isTestable: false, // Can be demoed conceptually
          estimatedHours: 6,
        },
        {
          name: "Next Execution Time",
          description: "Show when the next automated action is scheduled",
          isTestable: true,
          estimatedHours: 3,
        },
        {
          name: "Gas Optimization Status",
          description: "Indicate if the strategy uses gas-efficient methods",
          isTestable: true,
          estimatedHours: 2,
        },
        {
          name: "Emergency Pause",
          description: "Global switch to halt all agent activity",
          isTestable: true,
          estimatedHours: 2,
        },
      ],
    },
    {
      name: "Positions",
      route: "/positions",
      purpose: "Detailed view and manual management of individual liquidity positions",
      priority: "high",
      subFeatures: [
        {
          name: "Add Liquidity",
          description: "Deposit assets into a specific LP position",
          isTestable: true,
          estimatedHours: 6,
        },
        {
          name: "Remove Liquidity",
          description: "Withdraw assets from an LP position",
          isTestable: true,
          estimatedHours: 4,
        },
        {
          name: "Price Range Visualization",
          description: "Display current price relative to LP's active range",
          isTestable: true,
          estimatedHours: 3,
        },
        {
          name: "Unclaimed Fees Display & Claim",
          description: "Show and allow claiming of accumulated trading fees",
          isTestable: true,
          estimatedHours: 2,
        },
        {
          name: "Position Health Status",
          description: "Indicate if position is in-range or out-of-range",
          isTestable: true,
          estimatedHours: 2,
        },
      ],
    },
    {
      name: "Analytics",
      route: "/analytics",
      purpose: "Comprehensive performance analysis and risk assessment",
      priority: "medium",
      subFeatures: [
        {
          name: "APY Comparison Chart",
          description: "Compare VaultMaster AI's APY against manual strategies and other protocols",
          isTestable: true,
          estimatedHours: 4,
        },
        {
          name: "Gas Cost Analysis",
          description: "Detailed breakdown of gas savings over time",
          isTestable: true,
          estimatedHours: 3,
        },
        {
          name: "Impermanent Loss Tracking",
          description: "Monitor and visualize impermanent loss trends",
          isTestable: true,
          estimatedHours: 5,
        },
        {
          name: "Historical Performance Visualization",
          description: "Chart showing portfolio growth over time",
          isTestable: false,
          estimatedHours: 4,
        },
        {
          name: "Smart Contract Risk Assessment",
          description: "Information on contract audits and security measures",
          isTestable: false,
          estimatedHours: 2,
        },
      ],
    },
  ],

  testableFeatures: [
    {
      feature: "Wallet Connection",
      testMethod: "Connect MetaMask to Sepolia testnet",
      expectedResult: "Wallet address displayed in navbar",
      demoValue: "Shows user is connected and ready",
    },
    {
      feature: "Portfolio Value Display",
      testMethod: "Verify total value on Dashboard",
      expectedResult: "Correct total value shown, reflecting all positions",
      demoValue: "Proves real-time asset tracking",
    },
    {
      feature: "Strategy Activation",
      testMethod: "Toggle 'Uniswap V3 Auto-Rebalance' to Active",
      expectedResult: "Strategy status changes to 'Active' and agent starts monitoring",
      demoValue: "Core automation control working",
    },
    {
      feature: "Add Liquidity",
      testMethod: "Deposit 100 USDC to a specific LP position",
      expectedResult: "Transaction success + position balance update",
      demoValue: "Core functionality for managing assets",
    },
    {
      feature: "Unclaimed Fees Claim",
      testMethod: "Click 'Claim Fees' button on a position with unclaimed fees",
      expectedResult: "Transaction success + fees added to wallet balance",
      demoValue: "Users can realize their earnings",
    },
    {
      feature: "APY Comparison",
      testMethod: "Show Analytics tab with VaultMaster AI vs Manual APY",
      expectedResult: "Clear visual comparison showing VaultMaster AI's higher APY",
      demoValue: "Highlights VaultMaster AI's value proposition",
    },
    {
      feature: "Gas Savings Display",
      testMethod: "Show total gas saved on Dashboard/Analytics",
      expectedResult: "Cumulative gas savings amount is visible",
      demoValue: "Quantifies cost efficiency",
    },
    {
      feature: "Emergency Pause",
      testMethod: "Click 'Pause All Agents' button in Strategies tab",
      expectedResult: "All active strategies show 'Paused' status",
      demoValue: "Demonstrates user control and safety features",
    },
  ],

  demoFlow: [
    {
      step: 1,
      action: "Connect wallet to Sepolia",
      expectedResult: "Wallet connected, total portfolio value shown on Dashboard",
      demoScript:
        "Hi judges, I'm connecting my MetaMask to Sepolia testnet. You can see my total portfolio value here on the Dashboard, along with my overall APY and gas savings.",
    },
    {
      step: 2,
      action: "Navigate to Strategies tab & explain Smart Agents",
      expectedResult: "Strategies tab loads, showing active agents and their status",
      demoScript:
        "VaultMaster AI's core is our Smart Agents. Here in the Strategies tab, you can see my active 'Uniswap V3 Auto-Rebalance' agent and 'Aave Auto-Compound' agent. These agents automate complex DeFi tasks with minimal input.",
    },
    {
      step: 3,
      action: "Navigate to Positions tab & add liquidity",
      expectedResult: "Positions tab loads, showing LP details. Simulate adding 100 USDC.",
      demoScript:
        "Let's look at my ETH/USDC LP position. You can see its current price and range. I'll add 100 USDC liquidity now, and our Smart Agent will automatically manage it within the optimal range.",
    },
    {
      step: 4,
      action: "Show Unclaimed Fees & Claim",
      expectedResult: "Unclaimed fees are visible, and claiming them updates wallet balance.",
      demoScript:
        "My Smart Agent has already earned $12.47 in unclaimed fees from trading activity. I'll claim them now, and they'll be added directly to my wallet.",
    },
    {
      step: 5,
      action: "Navigate to Analytics tab & highlight performance",
      expectedResult: "Analytics tab shows APY comparison and gas savings.",
      demoScript:
        "Finally, in Analytics, you can see the power of VaultMaster AI. My automated position is yielding 18.5% APY, significantly outperforming manual management at 12.3% and Aave lending at 4.2%. Plus, our agents have saved me over $45 in gas fees!",
    },
    {
      step: 6,
      action: "Briefly show Emergency Pause in Strategies",
      expectedResult: "Point out the 'Pause All Agents' button.",
      demoScript:
        "For security, you always have full control. In the Strategies tab, there's an emergency pause button to halt all agent activity instantly.",
    },
  ],
}
