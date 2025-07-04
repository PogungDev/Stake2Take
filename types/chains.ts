export type Chain = {
  id: number
  name: string
  rpcUrl: string
  explorerUrl: string
}

export const chains: Chain[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    explorerUrl: "https://etherscan.io",
  },
  {
    id: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
    explorerUrl: "https://sepolia.etherscan.io",
  },
  {
    id: 137,
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
  },
  {
    id: 80001,
    name: "Mumbai Testnet",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    explorerUrl: "https://mumbai.polygonscan.com",
  },
  // Add more chains as needed
]
