# 🚀 Stake2Take - AI-Powered DeFi Automation for MetaMask Card

<div align="center">
  <img src="https://img.shields.io/badge/MetaMask%20Card-Dev%20Cook--Off-orange?style=for-the-badge&logo=metamask" />
  <img src="https://img.shields.io/badge/Track%201-Smart%20Agents-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Hardhat-Latest-yellow?style=for-the-badge&logo=ethereum" />
</div>

## 📖 Overview

**Stake2Take** is an AI-powered DeFi automation platform designed specifically for MetaMask Card users. It provides intelligent yield optimization, automated portfolio rebalancing, and seamless credit management through smart agents that work 24/7 to maximize your DeFi returns.

### 🎯 Key Value Proposition
- **"Stake More, Take More"** - Automated yield optimization between Aave and Compound protocols
- **Smart Agent Automation** - 24/7 monitoring and execution of DeFi strategies
- **MetaMask Card Integration** - Seamless spending and earning with automatic top-ups
- **Cross-Chain Intelligence** - Multi-chain yield hunting with automated rebalancing

## ✨ Features

### 🤖 Smart Agent Automation
- **Auto-Rebalancing**: Automatically switches between Aave and Compound when APY difference exceeds 1.5%
- **Balance Management**: Maintains target card balance with vault top-ups
- **Cashback Optimization**: Auto-claims rewards when they reach $10+ threshold
- **Credit Management**: Auto-repays credit when utilization exceeds 80%

### 💰 Yield Optimization
- **Dual Protocol Support**: Aave and Compound integration
- **Real-time APY Monitoring**: Continuous tracking of yield opportunities
- **Intelligent Allocation**: Dynamic portfolio rebalancing based on performance
- **Gas Optimization**: Smart transaction batching to minimize costs

### 💳 MetaMask Card Features
- **Spending Tracking**: Real-time monitoring of card transactions
- **Auto Top-ups**: Vault-to-card balance maintenance
- **Cashback Automation**: Automatic reward claiming and reinvestment
- **Credit Utilization Management**: Smart repayment strategies

### 📊 Advanced Analytics
- **Performance Dashboard**: Real-time metrics and insights
- **Action Logging**: Comprehensive audit trail of all agent actions
- **Yield Forecasting**: Predictive analytics for earnings optimization
- **Risk Management**: Automated risk assessment and mitigation

## 🛠 Technology Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI + Shadcn/ui** - Accessible component library
- **React Query** - State management and caching

### Blockchain & Web3
- **Hardhat** - Smart contract development framework
- **Ethers.js** - Ethereum library for blockchain interactions
- **Wagmi + Viem** - React hooks for Web3
- **OpenZeppelin** - Secure smart contract libraries
- **TypeChain** - Type-safe contract interactions

### Smart Contracts
- **Solidity ^0.8.19** - Smart contract language
- **Base Sepolia** - Primary testnet (Chain ID: 84532)
- **Multi-chain Support** - Ethereum, Arbitrum, Polygon, Optimism, Linea

### Infrastructure
- **Vercel** - Deployment platform
- **Node.js** - Runtime environment
- **Git** - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/stake2take.git
cd stake2take
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Generate contract addresses and start development**
```bash
# Generate mock contract addresses for development
node scripts/deploy.js

# Start the development server
npm run dev
```

5. **Open the application**
```
http://localhost:3000
```

## 📁 Project Structure

```
stake2take/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── shared/           # Reusable components
│   ├── ui/               # UI component library
│   └── providers/        # Context providers
├── contracts/            # Smart contracts (Solidity)
│   ├── vault/           # Vault management contracts
│   ├── agents/          # Smart agent contracts
│   └── core/            # Core protocol contracts
├── hooks/               # Custom React hooks
├── lib/                # Utility libraries
│   ├── engines/        # Smart agent engines
│   ├── integrations/   # External protocol integrations
│   └── utils/          # Helper functions
├── scripts/            # Deployment and utility scripts
├── types/              # TypeScript type definitions
└── config/             # Configuration files
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Smart Contract Addresses (Auto-generated)
NEXT_PUBLIC_VAULT_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_AUTOPILOT_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_YIELD_HUNTER_ADDRESS=0x...
NEXT_PUBLIC_COMPOUND_AGENT_ADDRESS=0x...
NEXT_PUBLIC_AGENT_CONSOLE_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_SMART_STRATEGY_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_CARD_SYNC_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_AUTO_ACTIONS_LOGGER_ADDRESS=0x...
NEXT_PUBLIC_AGENT_REPORT_MANAGER_ADDRESS=0x...

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Demo Configuration
NEXT_PUBLIC_DEFAULT_TARGET_BALANCE=300
NEXT_PUBLIC_DEFAULT_STAKE_AMOUNT=1000
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
```

## 🎮 How to Use

### 1. Connect Your Wallet
- Click "Connect" button in the header
- Approve MetaMask connection
- Switch to Base Sepolia network if prompted

### 2. Set Your Goals
- Navigate to the "Goals" tab
- Set your target card balance
- Configure spending limits and preferences

### 3. Configure Vault Allocation
- Go to "Vault" tab
- Adjust allocation between Aave and Compound
- Monitor real-time APY rates

### 4. Activate Smart Agent
- Navigate to "Agent" tab
- Review agent settings
- Click "Activate Agent" to start automation

### 5. Monitor Performance
- Check "Logs" tab for real-time agent actions
- View "Rewards" for earnings tracking
- Monitor "Credit" for utilization management

## 🧠 Smart Contracts Architecture

### Core Contracts

| Contract | Description | Address |
|----------|-------------|---------|
| **VaultManager** | Main vault operations, compounding, rebalancing | `0x1234...7890` |
| **AutopilotManager** | Strategy configuration and triggering | `0x2345...8901` |
| **YieldHunter** | Yield farming optimization across protocols | `0x3456...9012` |
| **CompoundAgent** | Automated LP reward compounding | `0x5678...1234` |
| **SmartStrategyManager** | DeFi strategy management and execution | `0x6789...2345` |
| **AgentConsoleManager** | AI agent control panel and monitoring | `0x7890...3456` |
| **CardSyncManager** | MetaMask Card integration layer | `0x4567...0123` |
| **AutoActionsLogger** | Action logging and analytics | `0x8901...4567` |
| **AgentReportManager** | Reporting and insights generation | `0x9012...5678` |

### Smart Agent Logic

The AI agents operate on the following decision matrix:

```javascript
// Balance Management
if (cardBalance < targetBalance) {
  → Transfer from vault to card
}

// Yield Optimization  
if (|aaveAPY - compoundAPY| > 1.5%) {
  → Rebalance to higher yielding protocol
}

// Reward Management
if (pendingCashback >= $10) {
  → Auto-claim and reinvest
}

// Credit Management
if (creditUtilization > 80%) {
  → Auto-repay from vault
}
```

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy to Vercel**
```bash
npx vercel --prod
```

3. **Set Environment Variables**
- Copy all variables from `.env.local`
- Add them in Vercel dashboard

### Local Build Testing

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Smart Contracts
npx hardhat compile  # Compile contracts
npx hardhat test     # Run contract tests
node scripts/deploy.js # Deploy contracts (mock)

# Utilities
npm run type-check   # TypeScript type checking
```

## 🎯 MetaMask Card Integration

### Card Features
- **Real-time Balance Sync**: Automatic synchronization with vault
- **Spending Categories**: AI-powered categorization and optimization
- **Cashback Automation**: Automatic claiming and reinvestment
- **Cross-chain Transactions**: Seamless multi-chain spending

### Automation Triggers
- **Low Balance Alert**: Auto top-up when card balance < target
- **High Yield Opportunity**: Auto-rebalance for better APY
- **Reward Threshold**: Auto-claim when rewards reach minimum
- **Credit Management**: Auto-repay when utilization is high

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed

## 📋 Roadmap

### Phase 1 - Core Platform ✅
- [x] Smart agent automation
- [x] Dual protocol yield optimization
- [x] MetaMask Card integration
- [x] Real-time monitoring

### Phase 2 - Advanced Features 🚧
- [ ] Multi-chain yield hunting
- [ ] Advanced risk management
- [ ] Social trading features
- [ ] Mobile app development

### Phase 3 - Ecosystem 🔮
- [ ] Third-party integrations
- [ ] Plugin marketplace
- [ ] DAO governance
- [ ] Token launch

## 🏆 MetaMask Card Dev Cook-Off

This project is built for the **MetaMask Card Developer Cook-Off** hackathon:

- **Track**: Track 1 - Smart Agents
- **Focus**: AI-powered DeFi automation for MetaMask Card users
- **Innovation**: Seamless integration between DeFi protocols and spending card
- **Impact**: Democratizing advanced DeFi strategies for everyday users

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **MetaMask Team** - For the innovative Card platform
- **Aave & Compound** - For robust DeFi protocols
- **OpenZeppelin** - For secure smart contract libraries
- **Vercel** - For seamless deployment experience

## 📞 Support

- **Documentation**: [/docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/your-username/stake2take/issues)
- **Discord**: [Join our community](#)
- **Twitter**: [@Stake2Take](#)

---

<div align="center">
  <p><strong>Stake More, Take More</strong> 🚀</p>
  <p>Built with ❤️ for the MetaMask Card Dev Cook-Off</p>
</div> 