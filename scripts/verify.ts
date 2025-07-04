import { ethers } from "hardhat";
import { run } from "hardhat";

async function main() {
  console.log("🔍 Verifying VaultMaster AI Smart Contracts...\n");

  // Load deployed contract addresses from the config file
  const fs = require("fs");
  let deployedContracts;
  
  try {
    const configData = fs.readFileSync("./config/deployed-contracts.json", "utf8");
    deployedContracts = JSON.parse(configData);
    console.log("📋 Loaded deployed contracts configuration");
  } catch (error) {
    console.error("❌ No deployed contracts configuration found. Please deploy contracts first.");
    process.exit(1);
  }

  const contractsToVerify = [
    {
      name: "VaultManager",
      address: deployedContracts.contracts.VaultManager.address,
      constructorArgs: [deployedContracts.usdc]
    },
    {
      name: "AutopilotManager", 
      address: deployedContracts.contracts.AutopilotManager.address,
      constructorArgs: []
    },
    {
      name: "YieldHunter",
      address: deployedContracts.contracts.YieldHunter.address,
      constructorArgs: [deployedContracts.usdc, "0x0000000000000000000000000000000000000001"]
    },
    {
      name: "CardSyncManager",
      address: deployedContracts.contracts.CardSyncManager.address,
      constructorArgs: []
    },
    {
      name: "CompoundAgent",
      address: deployedContracts.contracts.CompoundAgent.address,
      constructorArgs: []
    },
    {
      name: "SmartStrategyManager",
      address: deployedContracts.contracts.SmartStrategyManager.address,
      constructorArgs: []
    },
    {
      name: "AgentConsoleManager",
      address: deployedContracts.contracts.AgentConsoleManager.address,
      constructorArgs: []
    },
    {
      name: "AutoActionsLogger",
      address: deployedContracts.contracts.AutoActionsLogger.address,
      constructorArgs: []
    },
    {
      name: "AgentReportManager",
      address: deployedContracts.contracts.AgentReportManager.address,
      constructorArgs: []
    }
  ];

  console.log("\n🚀 Starting verification process...\n");

  for (const contract of contractsToVerify) {
    try {
      console.log(`Verifying ${contract.name} at ${contract.address}...`);
      
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArgs,
      });
      
      console.log(`✅ ${contract.name} verified successfully`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ ${contract.name} already verified`);
      } else {
        console.log(`❌ ${contract.name} verification failed:`, error.message);
      }
    }
  }

  console.log("\n🎉 Verification process complete!");
  console.log("📋 All contracts are ready for integration with VaultMaster AI frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
