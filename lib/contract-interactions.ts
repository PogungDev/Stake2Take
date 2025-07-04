// Contract interaction utilities for VaultMaster AI
import { ethers } from "ethers"

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  AGENT_CONSOLE: "0x1234567890123456789012345678901234567890",
  SMART_STRATEGY: "0x2345678901234567890123456789012345678901",
  VAULT_MANAGER: "0x3456789012345678901234567890123456789012",
  CARD_SYNC: "0x4567890123456789012345678901234567890123",
  AUTO_ACTIONS: "0x5678901234567890123456789012345678901234",
  AGENT_REPORT: "0x6789012345678901234567890123456789012345",
}

// Contract ABIs (simplified for demo)
export const CONTRACT_ABIS = {
  AGENT_CONSOLE: [
    "function activateAgent(string memory _mode) external",
    "function deactivateAgent() external",
    "function getUserAgentStatus(address _user) external view returns (tuple)",
    "function forceSync() external",
  ],
  SMART_STRATEGY: [
    "function setStrategy(uint8 _goal, uint8 _riskLevel) external",
    "function applyStrategyConfiguration() external",
    "function getUserStrategy(address _user) external view returns (tuple)",
  ],
  VAULT_MANAGER: [
    "function depositToVault(uint8 _vaultType, uint256 _amount) external",
    "function compoundVault(uint8 _vaultType) external",
    "function triggerRebalance(uint256[3] memory _newAllocations) external",
  ],
}

// Helper functions for contract interactions
export class ContractInteractions {
  private provider: ethers.providers.Web3Provider | null = null
  private signer: ethers.Signer | null = null

  constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum)
      this.signer = this.provider.getSigner()
    }
  }

  async activateAgent(mode: string) {
    if (!this.signer) throw new Error("No signer available")

    const contract = new ethers.Contract(CONTRACT_ADDRESSES.AGENT_CONSOLE, CONTRACT_ABIS.AGENT_CONSOLE, this.signer)

    return await contract.activateAgent(mode)
  }

  async setStrategy(goal: number, riskLevel: number) {
    if (!this.signer) throw new Error("No signer available")

    const contract = new ethers.Contract(CONTRACT_ADDRESSES.SMART_STRATEGY, CONTRACT_ABIS.SMART_STRATEGY, this.signer)

    return await contract.setStrategy(goal, riskLevel)
  }

  async compoundVault(vaultType: number) {
    if (!this.signer) throw new Error("No signer available")

    const contract = new ethers.Contract(CONTRACT_ADDRESSES.VAULT_MANAGER, CONTRACT_ABIS.VAULT_MANAGER, this.signer)

    return await contract.compoundVault(vaultType)
  }
}
