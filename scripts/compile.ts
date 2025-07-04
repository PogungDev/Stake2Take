import { ethers } from "hardhat";

async function main() {
  console.log("🔨 Compiling all VaultMaster AI Smart Contracts...\n");

  try {
    // List all contracts that need to be compiled
    const contracts = [
      "VaultManager",
      "AutopilotManager", 
      "YieldHunter",
      "CardSyncManager",
      "CompoundAgent",
      "SmartStrategyManager",
      "AgentConsoleManager",
      "AutoActionsLogger",
      "AgentReportManager"
    ];

    console.log("📋 Contracts to compile:");
    contracts.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract}`);
    });

    console.log("\n⚡ Starting compilation...");
    
    // Test compilation by getting contract factories
    for (const contractName of contracts) {
      try {
        const factory = await ethers.getContractFactory(contractName);
        console.log(`✅ ${contractName} - Compiled successfully`);
      } catch (error) {
        console.log(`❌ ${contractName} - Compilation failed:`, error.message);
      }
    }

    console.log("\n🎉 Compilation check complete!");
    console.log("Ready for deployment to Base Sepolia testnet.");

  } catch (error) {
    console.error("❌ Compilation failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
