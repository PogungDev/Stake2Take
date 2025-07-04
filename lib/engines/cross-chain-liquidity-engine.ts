import { AgentAction, LiveMetrics, SmartDefaults } from '@/types/app-structure';

export interface ChainLiquidity {
  chainId: number;
  chainName: string;
  availableBalance: number;
  requiredBalance: number;
  deficit: number;
  bridgeTime: number; // seconds
  bridgeCost: number; // USD
}

export interface BridgeRoute {
  fromChain: number;
  toChain: number;
  amount: number;
  estimatedTime: number; // seconds
  estimatedCost: number; // USD
  provider: 'lifi' | 'circle-cctp';
  confidence: number; // 0-1
}

export interface LiquidityRebalanceOpportunity {
  routes: BridgeRoute[];
  totalAmount: number;
  totalTime: number;
  totalCost: number;
  shouldBridge: boolean;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high';
}

export class CrossChainLiquidityEngine {
  private chainLiquidity: ChainLiquidity[] = [];
  
  // Simulate current chain liquidity (in production, this would query actual balances)
  private getCurrentChainLiquidity(preferredChains: number[]): ChainLiquidity[] {
    const chainData = {
      1: { name: 'Ethereum', balance: 850, required: 200 },
      8453: { name: 'Base', balance: 120, required: 400 }, // Deficit scenario
      42161: { name: 'Arbitrum', balance: 95, required: 300 } // Deficit scenario
    };
    
    return preferredChains.map(chainId => {
      const data = chainData[chainId as keyof typeof chainData];
      const deficit = Math.max(0, data.required - data.balance);
      
      return {
        chainId,
        chainName: data.name,
        availableBalance: data.balance,
        requiredBalance: data.required,
        deficit,
        bridgeTime: this.estimateBridgeTime(chainId),
        bridgeCost: this.estimateBridgeCost(chainId)
      };
    });
  }

  private estimateBridgeTime(chainId: number): number {
    const baseTimes = {
      1: 25,    // Ethereum: 25 seconds
      8453: 18, // Base: 18 seconds  
      42161: 21 // Arbitrum: 21 seconds
    };
    
    return baseTimes[chainId as keyof typeof baseTimes] || 30;
  }

  private estimateBridgeCost(chainId: number): number {
    const baseCosts = {
      1: 8.50,   // Ethereum: $8.50
      8453: 0.25, // Base: $0.25
      42161: 0.80 // Arbitrum: $0.80
    };
    
    return baseCosts[chainId as keyof typeof baseCosts] || 5.0;
  }

  private findOptimalBridgeRoutes(
    chainLiquidity: ChainLiquidity[], 
    maxBridgeTime: number
  ): BridgeRoute[] {
    const routes: BridgeRoute[] = [];
    const surplusChains = chainLiquidity.filter(c => c.deficit === 0 && c.availableBalance > c.requiredBalance);
    const deficitChains = chainLiquidity.filter(c => c.deficit > 0);
    
    for (const deficitChain of deficitChains) {
      for (const surplusChain of surplusChains) {
        const availableSurplus = surplusChain.availableBalance - surplusChain.requiredBalance;
        const transferAmount = Math.min(deficitChain.deficit, availableSurplus);
        
        if (transferAmount > 0) {
          const estimatedTime = Math.max(surplusChain.bridgeTime, deficitChain.bridgeTime);
          
          if (estimatedTime <= maxBridgeTime) {
            routes.push({
              fromChain: surplusChain.chainId,
              toChain: deficitChain.chainId,
              amount: transferAmount,
              estimatedTime,
              estimatedCost: surplusChain.bridgeCost + deficitChain.bridgeCost,
              provider: estimatedTime <= 25 ? 'circle-cctp' : 'lifi',
              confidence: estimatedTime <= 20 ? 0.95 : 0.85
            });
          }
        }
      }
    }
    
    return routes.sort((a, b) => a.estimatedTime - b.estimatedTime);
  }

  public analyzeLiquidityRebalance(smartDefaults: SmartDefaults): LiquidityRebalanceOpportunity {
    this.chainLiquidity = this.getCurrentChainLiquidity(smartDefaults.preferredChains);
    
    const totalDeficit = this.chainLiquidity.reduce((sum, chain) => sum + chain.deficit, 0);
    const shouldBridge = totalDeficit > 0;
    
    if (!shouldBridge) {
      return {
        routes: [],
        totalAmount: 0,
        totalTime: 0,
        totalCost: 0,
        shouldBridge: false,
        reasoning: 'All chains have sufficient liquidity. No cross-chain rebalancing needed.',
        urgency: 'low'
      };
    }
    
    const optimalRoutes = this.findOptimalBridgeRoutes(this.chainLiquidity, smartDefaults.maxBridgeTime);
    
    if (optimalRoutes.length === 0) {
      return {
        routes: [],
        totalAmount: totalDeficit,
        totalTime: 0,
        totalCost: 0,
        shouldBridge: false,
        reasoning: `No viable bridge routes found within ${smartDefaults.maxBridgeTime}s time limit.`,
        urgency: 'high'
      };
    }
    
    const totalAmount = optimalRoutes.reduce((sum, route) => sum + route.amount, 0);
    const totalTime = Math.max(...optimalRoutes.map(route => route.estimatedTime));
    const totalCost = optimalRoutes.reduce((sum, route) => sum + route.estimatedCost, 0);
    
    const urgency = totalTime <= 20 ? 'low' : totalTime <= 25 ? 'medium' : 'high';
    
    const reasoning = `Cross-chain liquidity rebalancing needed: ${optimalRoutes.length} bridge(s) totaling $${totalAmount} in ${totalTime}s via ${optimalRoutes[0]?.provider.toUpperCase()}.`;
    
    return {
      routes: optimalRoutes,
      totalAmount,
      totalTime,
      totalCost,
      shouldBridge: true,
      reasoning,
      urgency
    };
  }

  public generateBridgeActions(opportunity: LiquidityRebalanceOpportunity): AgentAction[] {
    if (!opportunity.shouldBridge) return [];

    return opportunity.routes.map(route => ({
      id: `bridge-${route.fromChain}-${route.toChain}-${Date.now()}`,
      type: 'bridge' as const,
      status: 'pending' as const,
      fromChain: route.fromChain,
      toChain: route.toChain,
      amount: route.amount,
      token: 'USDC',
      reason: `Bridge $${route.amount} from ${this.getChainName(route.fromChain)} to ${this.getChainName(route.toChain)} via ${route.provider.toUpperCase()}`,
      timestamp: new Date(),
      beforeBalance: 0, // Will be updated when executed
      afterBalance: 0,  // Will be updated when executed
      executionTimeMs: route.estimatedTime * 1000,
      gasUsedUSD: route.estimatedCost
    }));
  }

  private getChainName(chainId: number): string {
    const names = {
      1: 'Ethereum',
      8453: 'Base', 
      42161: 'Arbitrum'
    };
    return names[chainId as keyof typeof names] || `Chain ${chainId}`;
  }

  public updateLiveMetrics(metrics: LiveMetrics, smartDefaults: SmartDefaults): LiveMetrics {
    this.chainLiquidity = this.getCurrentChainLiquidity(smartDefaults.preferredChains);
    
    const opportunity = this.analyzeLiquidityRebalance(smartDefaults);
    const bridgesPending = opportunity.shouldBridge ? opportunity.routes.length : 0;
    const averageBridgeTime = opportunity.routes.length > 0 
      ? opportunity.routes.reduce((sum, route) => sum + route.estimatedTime, 0) / opportunity.routes.length
      : 0;

    return {
      ...metrics,
      bridgesPending,
      averageBridgeTime: Math.round(averageBridgeTime)
    };
  }

  public getChainLiquidity(): ChainLiquidity[] {
    return this.chainLiquidity;
  }
}
