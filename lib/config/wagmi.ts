import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, base, arbitrum, polygon, linea, optimism } from 'wagmi/chains'
import { metaMask, walletConnect, injected } from 'wagmi/connectors'

// Custom chain configurations for VaultMaster AI
const supportedChains = [
  mainnet,
  sepolia, // Primary testnet
  base,     // Circle USDC native
  linea,    // MetaMask native
  arbitrum, // Layer 2 for gas optimization  
  polygon,  // DeFi ecosystem
  optimism  // Additional Layer 2
] as const

// Get environment variables with fallbacks
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
const metaMaskProjectId = process.env.NEXT_PUBLIC_METAMASK_PROJECT_ID

// Create Wagmi configuration
export const config = createConfig({
  chains: supportedChains,
  connectors: [
    // MetaMask connector (primary for MetaMask Card integration)
    metaMask({
      dappMetadata: {
        name: 'VaultMaster AI',
        url: 'https://vaultmaster-ai.vercel.app',
        iconUrl: 'https://vaultmaster-ai.vercel.app/logo.png',
      },
      extensionOnly: false,
      preferDesktop: false,
      useDeeplink: true,
    }),
    
    // WalletConnect for broader wallet support (only in browser)
    ...(typeof window !== 'undefined' ? [
      walletConnect({
        projectId: walletConnectProjectId || 'fallback_project_id',
        metadata: {
          name: 'VaultMaster AI',
          description: 'AI-Powered Smart Agent for MetaMask Card Users',
          url: 'https://vaultmaster-ai.vercel.app',
          icons: ['https://vaultmaster-ai.vercel.app/logo.png'],
        },
        showQrModal: true,
      })
    ] : []),
    
    // Injected connector for other wallets
    injected({
      target: 'metaMask',
    }),
  ],
  
  // Transport configuration for each chain
  transports: {
    [mainnet.id]: http(
      alchemyApiKey 
        ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
        : 'https://cloudflare-eth.com'
    ),
    [sepolia.id]: http(
      alchemyApiKey
        ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
        : 'https://rpc.sepolia.dev'
    ),
    [base.id]: http('https://mainnet.base.org'),
    [linea.id]: http('https://rpc.linea.build'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    [polygon.id]: http('https://polygon-rpc.com'),
    [optimism.id]: http('https://mainnet.optimism.io'),
  },

  // Enable sync across tabs
  syncConnectedChain: true,
  
  // Batch requests for better performance
  batch: {
    multicall: {
      batchSize: 1024 * 200, // 200kb
      wait: 16, // 16ms
    },
  },
  
  // SSR configuration
  ssr: true,
})

// Chain-specific configurations for VaultMaster AI
export const chainConfig = {
  // Primary networks for MetaMask Card
  primary: {
    mainnet: mainnet.id,
    testnet: sepolia.id,
  },
  
  // Circle USDC native chains
  circle: {
    base: base.id,
    arbitrum: arbitrum.id,
    polygon: polygon.id,
  },
  
  // MetaMask optimized chains
  metamask: {
    linea: linea.id,
    polygon: polygon.id,
  },
  
  // Layer 2 for gas optimization
  layer2: {
    base: base.id,
    arbitrum: arbitrum.id,
    optimism: optimism.id,
    polygon: polygon.id,
  },
}

// USDC contract addresses for each chain
export const USDC_ADDRESSES = {
  [mainnet.id]: '0xA0b86a33E6441E7C8FD7BbBfA2bb6adA3Fe85e0b',
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC testnet
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  [polygon.id]: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  [linea.id]: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  [optimism.id]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
} as const

// VaultMaster AI contract addresses (will be updated after deployment)
export const VAULTMASTER_ADDRESSES = {
  [sepolia.id]: process.env.NEXT_PUBLIC_VAULTMASTER_CONTRACT_ADDRESS || '',
  [base.id]: '',
  [linea.id]: '',
  [arbitrum.id]: '',
  [polygon.id]: '',
} as const

// Network explorer URLs
export const EXPLORER_URLS = {
  [mainnet.id]: 'https://etherscan.io',
  [sepolia.id]: 'https://sepolia.etherscan.io',
  [base.id]: 'https://basescan.org',
  [arbitrum.id]: 'https://arbiscan.io',
  [polygon.id]: 'https://polygonscan.com',
  [linea.id]: 'https://lineascan.build',
  [optimism.id]: 'https://optimistic.etherscan.io',
} as const

// Gas price configurations for optimization
export const GAS_CONFIGS = {
  [mainnet.id]: { maxFeePerGas: 50_000_000_000n, maxPriorityFeePerGas: 2_000_000_000n },
  [sepolia.id]: { maxFeePerGas: 10_000_000_000n, maxPriorityFeePerGas: 1_000_000_000n },
  [base.id]: { maxFeePerGas: 1_000_000_000n, maxPriorityFeePerGas: 100_000_000n },
  [arbitrum.id]: { maxFeePerGas: 500_000_000n, maxPriorityFeePerGas: 100_000_000n },
  [polygon.id]: { maxFeePerGas: 50_000_000_000n, maxPriorityFeePerGas: 2_000_000_000n },
  [linea.id]: { maxFeePerGas: 2_000_000_000n, maxPriorityFeePerGas: 100_000_000n },
  [optimism.id]: { maxFeePerGas: 1_000_000_000n, maxPriorityFeePerGas: 100_000_000n },
} as const

// Helper functions
export function getUSDCAddress(chainId: number): string {
  return USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES] || ''
}

export function getVaultMasterAddress(chainId: number): string {
  return VAULTMASTER_ADDRESSES[chainId as keyof typeof VAULTMASTER_ADDRESSES] || ''
}

export function getExplorerUrl(chainId: number): string {
  return EXPLORER_URLS[chainId as keyof typeof EXPLORER_URLS] || ''
}

export function isLayer2(chainId: number): boolean {
  return Object.values(chainConfig.layer2).includes(chainId)
}

export function isCircleNative(chainId: number): boolean {
  return Object.values(chainConfig.circle).includes(chainId)
}

export function isMetaMaskOptimized(chainId: number): boolean {
  return Object.values(chainConfig.metamask).includes(chainId)
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
