import { AgentAction, LiveMetrics, SmartDefaults } from '@/types/app-structure';

export interface VaultPosition {
  protocol: 'aave' | 'compound' | 'uniswap-v3';
  currentAPY: number;
  allocatedAmount: number;
  allocatedPercent: number;
  lastRebalanceTime: Date;
}

export interface RebalanceOpportunity {
  fromProtocol: 'aave' | 'compound' | 'uniswap-v3';
  toProtocol: 'aave' | 'compound' | 'uniswap-v3';
  currentAPY: number;
  targetAPY: number;
  apyDelta: number;
  suggestedAmount: number;
  expectedGain: number;
  shouldRebalance: boolean;
  reasoning: string;
}

export class VaultRebalancingEngine {
  private positions: VaultPosition[] = [];
  
  // Simulate real-time APY data (in production, this would come from actual protocols)
  private getCurrentAPYs(): { [key: string]: number } {
    const baseAPYs = {
      aave: 2.1,
      compound: 5.5,
      'uniswap-v3': 8.2
    };
    
    // Add some realistic variance
    Object.keys(baseAPYs).forEach(protocol => {
      const variance = baseAPYs[protocol as keyof typeof baseAPYs] * 0.1 * (Math.random() - 0.5);
      baseAPYs[protocol as keyof typeof baseAPYs] += variance;
    });
    
    return baseAPYs;
  }

  private initializePositions(totalVaultValue: number, allocation: SmartDefaults['vaultAllocation']): VaultPosition[] {
    const currentAPYs = this.getCurrentAPYs();
    
    return [
      {
        protocol: 'aave',
        currentAPY: currentAPYs.aave,
        allocatedAmount: totalVaultValue * (allocation.aave / 100),
        allocatedPercent: allocation.aave,
        lastRebalanceTime: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      },
      {
        protocol: 'compound',
        currentAPY: currentAPYs.compound,
        allocatedAmount: totalVaultValue * (allocation.compound / 100),
        allocatedPercent: allocation.compound,
        lastRebalanceTime: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        protocol: 'uniswap-v3',
        currentAPY: currentAPYs['uniswap-v3'],
        allocatedAmount: totalVaultValue * (allocation.uniswapV3 / 100),
        allocatedPercent: allocation.uniswapV3,
        lastRebalanceTime: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];
  }

  public analyzeRebalanceOpportunity(
    totalVaultValue: number, 
    smartDefaults: SmartDefaults
  ): RebalanceOpportunity | null {
    this.positions = this.initializePositions(totalVaultValue, smartDefaults.vaultAllocation);
    
    // Find the lowest and highest APY positions
    const sortedPositions = [...this.positions].sort((a, b) => a.currentAPY - b.currentAPY);
    const lowestAPY = sortedPositions[0];
    const highestAPY = sortedPositions[sortedPositions.length - 1];
    
    const apyDelta = highestAPY.currentAPY - lowestAPY.currentAPY;
    const shouldRebalance = apyDelta > smartDefaults.apyDeltaThreshold;
    
    if (!shouldRebalance) {
      return {
        fromProtocol: lowestAPY.protocol,
        toProtocol: highestAPY.protocol,
        currentAPY: lowestAPY.currentAPY,
        targetAPY: highestAPY.currentAPY,
        apyDelta,
        suggestedAmount: 0,
        expectedGain: 0,
        shouldRebalance: false,
        reasoning: `APY delta ${apyDelta.toFixed(2)}% below ${smartDefaults.apyDeltaThreshold}% threshold. No rebalancing needed.`
      };
    }
    
    // Calculate optimal rebalance amount (move half of lowest APY position to highest)
    const suggestedAmount = Math.min(lowestAPY.allocatedAmount * 0.5, 160); // Max $160 as per business scenario
    const annualizedGain = (suggestedAmount * (highestAPY.currentAPY - lowestAPY.currentAPY)) / 100;
    const expectedGain = annualizedGain / 365 * 30; // Monthly gain
    
    return {
      fromProtocol: lowestAPY.protocol,
      toProtocol: highestAPY.protocol,
      currentAPY: lowestAPY.currentAPY,
      targetAPY: highestAPY.currentAPY,
      apyDelta,
      suggestedAmount,
      expectedGain,
      shouldRebalance: true,
      reasoning: `APY delta ${apyDelta.toFixed(2)}% exceeds ${smartDefaults.apyDeltaThreshold}% threshold. Moving $${suggestedAmount} from ${lowestAPY.protocol} (${lowestAPY.currentAPY.toFixed(2)}%) to ${highestAPY.protocol} (${highestAPY.currentAPY.toFixed(2)}%) for +$${expectedGain.toFixed(2)}/month gain.`
    };
  }

  public generateRebalanceAction(opportunity: RebalanceOpportunity): AgentAction | null {
    if (!opportunity.shouldRebalance) return null;

    return {
      id: `rebalance-${Date.now()}`,
      type: 'rebalance',
      status: 'pending',
      amount: opportunity.suggestedAmount,
      token: 'USDC',
      reason: opportunity.reasoning,
      timestamp: new Date(),
      beforeBalance: 0, // Will be updated when executed
      afterBalance: 0,  // Will be updated when executed
      optimizationGain: opportunity.expectedGain
    };
  }

  public updateLiveMetrics(metrics: LiveMetrics, totalVaultValue: number, smartDefaults: SmartDefaults): LiveMetrics {
    this.positions = this.initializePositions(totalVaultValue, smartDefaults.vaultAllocation);
    
    // Calculate weighted average APY
    const totalAllocated = this.positions.reduce((sum, pos) => sum + pos.allocatedAmount, 0);
    const weightedAPY = this.positions.reduce((sum, pos) => {
      return sum + (pos.currentAPY * pos.allocatedAmount / totalAllocated);
    }, 0);

    return {
      ...metrics,
      currentAPY: Math.round(weightedAPY * 100) / 100,
      totalVaultValue,
      yieldEarnedToday: totalVaultValue * (weightedAPY / 100) / 365 // Daily yield
    };
  }

  public getPositions(): VaultPosition[] {
    return this.positions;
  }
}
