import { ethers } from "ethers"
import { Address } from 'wagmi'

// This file would contain actual contract addresses and ABIs for a real dApp.
// For v0 demo purposes, we'll use placeholder values.

// Contract addresses will be updated after deployment
export const CONTRACT_ADDRESSES = {
  // Core Contracts
  VaultManager: process.env.NEXT_PUBLIC_VAULT_MANAGER_ADDRESS as Address || "0x0000000000000000000000000000000000000000",
  AutopilotManager: process.env.NEXT_PUBLIC_AUTOPILOT_MANAGER_ADDRESS as Address || "0x0000000000000000000000000000000000000000",
  
  // Agent Contracts
  YieldHunter: process.env.NEXT_PUBLIC_YIELD_HUNTER_ADDRESS as Address || "0x0000000000000000000000000000000000000000",
  CompoundAgent: process.env.NEXT_PUBLIC_COMPOUND_AGENT_ADDRESS as Address || "0x0000000000000000000000000000000000000000",
  AgentConsoleManager: process.env.NEXT_PUBLIC_AGENT_CONSOLE_MANAGER_ADDRESS as Address || "0x0000000000000000000000000000000000000000",
  
  // Strategy & Management
  SmartStrategyManager: process.env.NEXT_PUBLIC_SMART_STRATEGY_MANAGER_ADDRESS as Address || "0x0000000000000000000000000000000000000000",
  CardSyncManager: process.env.NEXT_PUBLIC_CARD_SYNC_MANAGER_ADDRESS as Address || "0x0000000000000000000000000000000000000000",
  
  // Logging & Reporting
  AutoActionsLogger: process.env.NEXT_PUBLIC_AUTO_ACTIONS_LOGGER_ADDRESS as Address || "0x0000000000000000000000000000000000000000",
  AgentReportManager: process.env.NEXT_PUBLIC_AGENT_REPORT_MANAGER_ADDRESS as Address || "0x0000000000000000000000000000000000000000",
} as const

// USDC addresses for different networks
export const USDC_ADDRESSES = {
  // Mainnets
  ethereum: "0xA0b86a33E6441f8C0625e34E5e0Ac4dD8F9B1BA3" as Address,
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address,
  polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" as Address,
  linea: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff" as Address,
  
  // Testnets
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address,
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Address,
  arbitrumSepolia: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" as Address,
  polygonMumbai: "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747" as Address,
} as const

// Contract ABIs (minimal for demo - in production would be full ABIs)
export const CONTRACT_ABIS = {
  VaultManager: [
    "function initializeVaults(uint256[3] memory allocations, uint256[3] memory initialBalances) external",
    "function depositToVault(uint8 vaultType, uint256 amount) external",
    "function withdrawFromVault(uint8 vaultType, uint256 amount) external",
    "function compoundVault(uint8 vaultType) external",
    "function rebalancePortfolio(uint256[3] memory newAllocations) external",
    "function getUserVault(address user, uint8 vaultType) external view returns (string memory name, uint8 vaultType, uint256 allocation, uint256 balance, uint256 expectedProfitRate, string memory trend, uint256 lastCompound, uint256 totalCompounded, bool autoCompoundEnabled, uint256 lastRebalance)",
    "function emergencyWithdraw() external",
    "event VaultCreated(address indexed user, uint8 vaultType, uint256 allocation)",
    "event VaultDeposit(address indexed user, uint8 vaultType, uint256 amount)",
    "event CompoundExecuted(address indexed user, uint8 vaultType, uint256 amount)"
  ],
  
  AutopilotManager: [
    "function createAutopilot(address walletAddress, string memory strategy, string memory initialConfig) external",
    "function updateAutopilotConfig(address walletAddress, string memory newConfig) external",
    "function getAutopilotConfig(address walletAddress) external view returns (string memory)",
    "function triggerRebalance(address walletAddress) external",
    "event AutopilotCreated(address indexed walletAddress, string strategy)",
    "event RebalanceTriggered(address indexed walletAddress, uint256 timestamp)"
  ],
  
  YieldHunter: [
    "function deposit(uint256 amount) external",
    "function withdraw(uint256 amount) external",
    "function getBalance() external view returns (uint256)",
    "event Deposited(address indexed user, uint256 amount)",
    "event Withdrawn(address indexed user, uint256 amount)"
  ],
  
  CompoundAgent: [
    "function activate() external",
    "function deactivate() external",
    "function addPosition(address user, address poolAddress, int24 tickLower, int24 tickUpper) external",
    "function executeCompound(address user, uint256 positionIndex) external",
    "function supply(address asset, uint256 amount) external",
    "function withdraw(address asset, uint256 amount) external",
    "event CompoundExecuted(address indexed user, address indexed pool, uint256 amount0, uint256 amount1, uint256 gasUsed)",
    "event AgentActivated(address indexed user)",
    "event AgentDeactivated(address indexed user)"
  ],
  
  CardSyncManager: [
    "function linkCard(string calldata cardId) external",
    "function triggerSpendingSync(address user, uint256 amountUSD, string calldata transactionId) external",
    "function getLinkedCardId(address user) external view returns (string memory)",
    "event CardLinked(address indexed user, string cardId)",
    "event SpendingSynced(address indexed user, uint256 amountUSD, string transactionId)"
  ],
  
  SmartStrategyManager: [
    "function addStrategy(string calldata name, string calldata description, address agentLogicAddress) external",
    "function activateStrategy(uint256 strategyId) external",
    "function deactivateStrategy() external",
    "function getStrategy(uint256 strategyId) external view returns (string memory, string memory, address, bool, uint256)",
    "function getActiveStrategyId(address user) external view returns (uint256)",
    "event StrategyActivated(address indexed user, uint256 indexed strategyId)"
  ],
  
  // Standard ERC20 for USDC interactions
  ERC20: [
    "function balanceOf(address owner) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string memory)",
    "function name() external view returns (string memory)"
  ]
} as const

// Vault types enum matching the smart contract
export enum VaultType {
  STAKING = 0,
  LP = 1,
  TREASURY = 2
}

// Risk levels for portfolio management
export enum RiskLevel {
  CONSERVATIVE = 1,
  MODERATE = 2,
  AGGRESSIVE = 3
}

// Yield protocols supported by VaultMaster AI
export const YIELD_PROTOCOLS = {
  AAVE: "Aave",
  COMPOUND: "Compound",
  UNISWAP_V3: "Uniswap V3",
  GMX: "GMX",
  STARGATE: "Stargate",
  CURVE: "Curve"
} as const

// Default configuration for VaultMaster AI
export const DEFAULT_CONFIG = {
  AUTO_COMPOUND_ENABLED: true,
  AUTO_REBALANCE_ENABLED: true,
  MIN_COMPOUND_AMOUNT: 50, // $50 USD
  REBALANCE_THRESHOLD: 5, // 5% deviation
  COMPOUND_FREQUENCY: 3600, // 1 hour in seconds
  REBALANCE_FREQUENCY: 14400, // 4 hours in seconds
  MAX_GAS_PRICE: 50, // 50 gwei
  DEFAULT_ALLOCATIONS: [40, 40, 20], // [Staking, LP, Treasury]
  SLIPPAGE_TOLERANCE: 0.5, // 0.5%
  EMERGENCY_STOP_LOSS: 20 // 20% loss triggers emergency stop
} as const

// Network configuration
export const SUPPORTED_NETWORKS = {
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://etherscan.io"
  },
  base: {
    chainId: 8453,
    name: "Base",
    currency: "ETH",
    explorerUrl: "https://basescan.org"
  },
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum",
    currency: "ETH",
    explorerUrl: "https://arbiscan.io"
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    currency: "MATIC",
    explorerUrl: "https://polygonscan.com"
  },
  linea: {
    chainId: 59144,
    name: "Linea",
    currency: "ETH",
    explorerUrl: "https://lineascan.build"
  }
} as const

// Helper function to get contract address by network
export function getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES, chainId?: number): Address {
  return CONTRACT_ADDRESSES[contractName]
}

// Helper function to get USDC address by network
export function getUSDCAddress(chainId: number): Address {
  switch (chainId) {
    case 1: return USDC_ADDRESSES.ethereum
    case 8453: return USDC_ADDRESSES.base
    case 42161: return USDC_ADDRESSES.arbitrum
    case 137: return USDC_ADDRESSES.polygon
    case 59144: return USDC_ADDRESSES.linea
    case 11155111: return USDC_ADDRESSES.sepolia
    case 84532: return USDC_ADDRESSES.baseSepolia
    case 421614: return USDC_ADDRESSES.arbitrumSepolia
    case 80001: return USDC_ADDRESSES.polygonMumbai
    default: return USDC_ADDRESSES.baseSepolia // Default to Base Sepolia for testing
  }
}

export const AUTOPILOT_MANAGER_ABI = [
  // Example ABI functions (replace with your actual ABI)
  "function deployAgent(address _agentLogic, bytes calldata _initData) returns (address)",
  "function getAgentAddress(address _user) view returns (address)",
  "function activateAgent(address _agentAddress) external",
  "function deactivateAgent(address _agentAddress) external",
  "event AgentDeployed(address indexed user, address indexed agentAddress)",
  "event AgentStatusChanged(address indexed agentAddress, bool isActive)",
]

export const YIELD_HUNTER_AGENT_ABI = [
  // Add YieldHunter ABI functions here
  "function deposit(address token, uint amount)",
  "function withdraw(address token, uint amount)",
  "function swapTokens(address tokenIn, address tokenOut, uint amountIn, uint amountOutMin, uint deadline)",
  "function addLiquidityToUniswap(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, uint deadline)",
  "function removeLiquidityFromUniswap(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, uint deadline)",
  "function enterCompoundMarket(address[] calldata cTokens)",
  "function exitCompoundMarket(address cToken)",
  "function supplyToCompound(address cToken, uint amount)",
  "function redeemFromCompound(address cToken, uint amount)",
  "function borrowFromCompound(address cToken, uint amount)",
  "function repayBorrowCompound(address cToken, uint amount)",
  "function getUnderlyingBalance(address cToken, address account) view returns (uint)",
  "function getAccountLiquidity(address account) view returns (uint, uint, uint)",
]

export const COMPOUND_AGENT_ABI = [
  // Add CompoundAgent ABI functions here
  "function supply(address cToken, uint amount)",
  "function withdraw(address cToken, uint amount)",
  "function borrow(address cToken, uint amount)",
  "function repay(address cToken, uint amount)",
  "function getCash(address cToken) view returns (uint)",
  "function getSupplyRate(address cToken) view returns (uint)",
  "function getBorrowRate(address cToken) view returns (uint)",
]

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

// Helper function to get a contract instance
export const getContract = (address: string, abi: any[], signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(address, abi, signerOrProvider)
}

export function getContractAddress(chainId: number | string, contractName: string): string {
  const chainContracts = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  if (!chainContracts) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }

  const address = chainContracts[contractName.toLowerCase() as keyof typeof chainContracts]
  if (!address) {
    throw new Error(`Contract ${contractName} not found for chain ${chainId}`)
  }

  return address
}
