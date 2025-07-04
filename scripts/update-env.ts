import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log("🔧 Updating environment variables after deployment...\n");

  try {
    // Load deployed contracts configuration
    const configPath = path.join(__dirname, '../config/deployed-contracts.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    const deployedContracts = JSON.parse(configData);

    console.log("📋 Loaded deployment configuration:");
    console.log(`Network: ${deployedContracts.network}`);
    console.log(`Chain ID: ${deployedContracts.chainId}`);
    console.log(`Deployer: ${deployedContracts.deployer}`);
    console.log(`Deployed at: ${deployedContracts.deployedAt}`);

    // Create environment variables template
    const envTemplate = `# VaultMaster AI Smart Contract Addresses (Auto-generated)
# Deployed on ${deployedContracts.network} at ${deployedContracts.deployedAt}

# Core Contracts
NEXT_PUBLIC_VAULT_MANAGER_ADDRESS=${deployedContracts.contracts.VaultManager.address}
NEXT_PUBLIC_AUTOPILOT_MANAGER_ADDRESS=${deployedContracts.contracts.AutopilotManager.address}

# Agent Contracts  
NEXT_PUBLIC_YIELD_HUNTER_ADDRESS=${deployedContracts.contracts.YieldHunter.address}
NEXT_PUBLIC_COMPOUND_AGENT_ADDRESS=${deployedContracts.contracts.CompoundAgent.address}
NEXT_PUBLIC_AGENT_CONSOLE_MANAGER_ADDRESS=${deployedContracts.contracts.AgentConsoleManager.address}

# Strategy & Management
NEXT_PUBLIC_SMART_STRATEGY_MANAGER_ADDRESS=${deployedContracts.contracts.SmartStrategyManager.address}
NEXT_PUBLIC_CARD_SYNC_MANAGER_ADDRESS=${deployedContracts.contracts.CardSyncManager.address}

# Logging & Reporting
NEXT_PUBLIC_AUTO_ACTIONS_LOGGER_ADDRESS=${deployedContracts.contracts.AutoActionsLogger.address}
NEXT_PUBLIC_AGENT_REPORT_MANAGER_ADDRESS=${deployedContracts.contracts.AgentReportManager.address}

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=${deployedContracts.chainId}
NEXT_PUBLIC_USDC_ADDRESS=${deployedContracts.usdc}
`;

    // Write to environment template file
    const envPath = path.join(__dirname, '../.env.contracts');
    fs.writeFileSync(envPath, envTemplate);

    console.log("\n✅ Environment variables written to .env.contracts");
    console.log("📋 Contract Addresses Summary:");
    console.log("═══════════════════════════════════════════");

    Object.entries(deployedContracts.contracts).forEach(([name, contract]) => {
      console.log(`${name}: ${contract.address}`);
    });

    console.log("═══════════════════════════════════════════");
    console.log("\n🎯 Next Steps:");
    console.log("1. Copy the contract addresses to your .env.local file");
    console.log("2. Update your frontend configuration");
    console.log("3. Test the integration with the deployed contracts");
    console.log("4. Verify contracts on block explorer (optional)");

  } catch (error) {
    console.error("❌ Failed to update environment variables:", error.message);
    console.log("\n💡 This is normal if deployment is still in progress.");
    console.log("Run this script again after deployment completes.");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
