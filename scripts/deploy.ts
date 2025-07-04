import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting VaultMaster AI Smart Contracts Deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // USDC address for different networks (Base Sepolia for testing)
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
  const MOCK_YIELD_FARM = "0x0000000000000000000000000000000000000001"; // Mock address

  console.log("\n📋 Contract Addresses Configuration:");
  console.log("USDC Address:", USDC_ADDRESS);
  console.log("Mock Yield Farm:", MOCK_YIELD_FARM);

  // Deploy VaultManager (main contract)
  console.log("\n1️⃣ Deploying VaultManager...");
  const VaultManagerFactory = await ethers.getContractFactory("VaultManager");
  const vaultManager = await VaultManagerFactory.deploy(USDC_ADDRESS);
  await vaultManager.waitForDeployment();
  const vaultManagerAddress = await vaultManager.getAddress();
  console.log("✅ VaultManager deployed to:", vaultManagerAddress);

  // Deploy AutopilotManager
  console.log("\n2️⃣ Deploying AutopilotManager...");
  const AutopilotManagerFactory = await ethers.getContractFactory("AutopilotManager");
  const autopilotManager = await AutopilotManagerFactory.deploy();
  await autopilotManager.waitForDeployment();
  const autopilotManagerAddress = await autopilotManager.getAddress();
  console.log("✅ AutopilotManager deployed to:", autopilotManagerAddress);

  // Deploy YieldHunter
  console.log("\n3️⃣ Deploying YieldHunter...");
  const YieldHunterFactory = await ethers.getContractFactory("YieldHunter");
  const yieldHunter = await YieldHunterFactory.deploy(USDC_ADDRESS, MOCK_YIELD_FARM);
  await yieldHunter.waitForDeployment();
  const yieldHunterAddress = await yieldHunter.getAddress();
  console.log("✅ YieldHunter deployed to:", yieldHunterAddress);

  // Deploy CardSyncManager
  console.log("\n4️⃣ Deploying CardSyncManager...");
  const CardSyncManagerFactory = await ethers.getContractFactory("CardSyncManager");
  const cardSyncManager = await CardSyncManagerFactory.deploy();
  await cardSyncManager.waitForDeployment();
  const cardSyncManagerAddress = await cardSyncManager.getAddress();
  console.log("✅ CardSyncManager deployed to:", cardSyncManagerAddress);

  // Deploy CompoundAgent
  console.log("\n5️⃣ Deploying CompoundAgent...");
  const CompoundAgentFactory = await ethers.getContractFactory("CompoundAgent");
  const compoundAgent = await CompoundAgentFactory.deploy();
  await compoundAgent.waitForDeployment();
  const compoundAgentAddress = await compoundAgent.getAddress();
  console.log("✅ CompoundAgent deployed to:", compoundAgentAddress);

  // Deploy SmartStrategyManager
  console.log("\n6️⃣ Deploying SmartStrategyManager...");
  const SmartStrategyManagerFactory = await ethers.getContractFactory("SmartStrategyManager");
  const smartStrategyManager = await SmartStrategyManagerFactory.deploy();
  await smartStrategyManager.waitForDeployment();
  const smartStrategyManagerAddress = await smartStrategyManager.getAddress();
  console.log("✅ SmartStrategyManager deployed to:", smartStrategyManagerAddress);

  // Deploy AgentConsoleManager
  console.log("\n7️⃣ Deploying AgentConsoleManager...");
  const AgentConsoleManagerFactory = await ethers.getContractFactory("AgentConsoleManager");
  const agentConsoleManager = await AgentConsoleManagerFactory.deploy();
  await agentConsoleManager.waitForDeployment();
  const agentConsoleManagerAddress = await agentConsoleManager.getAddress();
  console.log("✅ AgentConsoleManager deployed to:", agentConsoleManagerAddress);

  // Deploy AutoActionsLogger
  console.log("\n8️⃣ Deploying AutoActionsLogger...");
  const AutoActionsLoggerFactory = await ethers.getContractFactory("AutoActionsLogger");
  const autoActionsLogger = await AutoActionsLoggerFactory.deploy();
  await autoActionsLogger.waitForDeployment();
  const autoActionsLoggerAddress = await autoActionsLogger.getAddress();
  console.log("✅ AutoActionsLogger deployed to:", autoActionsLoggerAddress);

  // Deploy AgentReportManager
  console.log("\n9️⃣ Deploying AgentReportManager...");
  const AgentReportManagerFactory = await ethers.getContractFactory("AgentReportManager");
  const agentReportManager = await AgentReportManagerFactory.deploy();
  await agentReportManager.waitForDeployment();
  const agentReportManagerAddress = await agentReportManager.getAddress();
  console.log("✅ AgentReportManager deployed to:", agentReportManagerAddress);

  console.log("\n🎉 All VaultMaster AI Smart Contracts Deployed Successfully!\n");

  // Summary of deployed contracts
  console.log("📋 DEPLOYMENT SUMMARY:");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("Network:", await ethers.provider.getNetwork());
  console.log("Deployer:", deployer.address);
  console.log("Gas Used: Check transaction receipts for details");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("VaultManager:", vaultManagerAddress);
  console.log("AutopilotManager:", autopilotManagerAddress);
  console.log("YieldHunter:", yieldHunterAddress);
  console.log("CardSyncManager:", cardSyncManagerAddress);
  console.log("CompoundAgent:", compoundAgentAddress);
  console.log("SmartStrategyManager:", smartStrategyManagerAddress);
  console.log("AgentConsoleManager:", agentConsoleManagerAddress);
  console.log("AutoActionsLogger:", autoActionsLoggerAddress);
  console.log("AgentReportManager:", agentReportManagerAddress);
  console.log("═══════════════════════════════════════════════════════════");

  // Create contracts configuration file for frontend
  const contractsConfig = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    contracts: {
      VaultManager: {
        address: vaultManagerAddress,
        name: "VaultManager"
      },
      AutopilotManager: {
        address: autopilotManagerAddress,
        name: "AutopilotManager"
      },
      YieldHunter: {
        address: yieldHunterAddress,
        name: "YieldHunter"
      },
      CardSyncManager: {
        address: cardSyncManagerAddress,
        name: "CardSyncManager"
      },
      CompoundAgent: {
        address: compoundAgentAddress,
        name: "CompoundAgent"
      },
      SmartStrategyManager: {
        address: smartStrategyManagerAddress,
        name: "SmartStrategyManager"
      },
      AgentConsoleManager: {
        address: agentConsoleManagerAddress,
        name: "AgentConsoleManager"
      },
      AutoActionsLogger: {
        address: autoActionsLoggerAddress,
        name: "AutoActionsLogger"
      },
      AgentReportManager: {
        address: agentReportManagerAddress,
        name: "AgentReportManager"
      }
    },
    usdc: USDC_ADDRESS,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };

  // Write contracts config to file
  const fs = require("fs");
  fs.writeFileSync(
    "./config/deployed-contracts.json",
    JSON.stringify(contractsConfig, null, 2)
  );

  console.log("\n✅ Contract addresses saved to config/deployed-contracts.json");
  console.log("🎯 Ready to integrate with VaultMaster AI frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
