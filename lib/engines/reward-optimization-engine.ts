import { AgentAction, LiveMetrics, SmartDefaults } from '@/types/app-structure';

export interface RewardOpportunity {
  category: string;
  merchant: string;
  currentCashback: number; // %
  potentialCashback: number; // %
  estimatedSpending: number; // monthly
  potentialGain: number; // USD
  cardRecommendation?: string;
  isOptimal: boolean;
}

export interface PendingReward {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  earnedDate: Date;
  expiryDate: Date;
  canAutoClaim: boolean;
  claimMethod: 'instant' | 'statement' | 'app';
}

export interface RewardAnalysis {
  totalPendingRewards: number;
  autoClaimableAmount: number;
  expiringRewards: PendingReward[];
  categoryOptimization: RewardOpportunity[];
  shouldClaim: boolean;
  reasoning: string;
}

export class RewardOptimizationEngine {
  private pendingRewards: PendingReward[] = [];
  
  // Simulate current reward opportunities (in production, this would integrate with card providers)
  private getCurrentRewardOpportunities(): RewardOpportunity[] {
    return [
      {
        category: 'Food & Dining',
        merchant: 'Starbucks',
        currentCashback: 5.0,
        potentialCashback: 5.0,
        estimatedSpending: 150,
        potentialGain: 7.50,
        isOptimal: true
      },
      {
        category: 'Gas Stations',
        merchant: 'Shell',
        currentCashback: 2.0,
        potentialCashback: 4.0,
        estimatedSpending: 80,
        potentialGain: 1.60,
        cardRecommendation: 'Switch to Discover Card for Q4',
        isOptimal: false
      },
      {
        category: 'Groceries',
        merchant: 'Whole Foods',
        currentCashback: 1.0,
        potentialCashback: 3.0,
        estimatedSpending: 200,
        potentialGain: 4.00,
        cardRecommendation: 'Use Amazon Prime Card',
        isOptimal: false
      },
      {
        category: 'Travel',
        merchant: 'Airlines',
        currentCashback: 2.0,
        potentialCashback: 5.0,
        estimatedSpending: 300,
        potentialGain: 9.00,
        cardRecommendation: 'Use Chase Sapphire for travel',
        isOptimal: false
      }
    ];
  }

  private getPendingRewards(): PendingReward[] {
    const now = new Date();
    return [
      {
        id: 'reward-starbucks-1',
        merchant: 'Starbucks',
        category: 'Food & Dining',
        amount: 7.50,
        earnedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        expiryDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        canAutoClaim: true,
        claimMethod: 'instant'
      },
      {
        id: 'reward-amazon-1',
        merchant: 'Amazon',
        category: 'Online Shopping',
        amount: 3.25,
        earnedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        expiryDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        canAutoClaim: true,
        claimMethod: 'app'
      },
      {
        id: 'reward-gas-1',
        merchant: 'Shell',
        category: 'Gas Stations',
        amount: 2.40,
        earnedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        expiryDate: new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000), // 29 days from now
        canAutoClaim: false,
        claimMethod: 'statement'
      }
    ];
  }

  public analyzeRewardOptimization(smartDefaults: SmartDefaults): RewardAnalysis {
    this.pendingRewards = this.getPendingRewards();
    const opportunities = this.getCurrentRewardOpportunities();
    
    // Calculate totals
    const totalPendingRewards = this.pendingRewards.reduce((sum, reward) => sum + reward.amount, 0);
    const autoClaimableRewards = this.pendingRewards.filter(r => r.canAutoClaim);
    const autoClaimableAmount = autoClaimableRewards.reduce((sum, reward) => sum + reward.amount, 0);
    
    // Find expiring rewards (within 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const expiringRewards = this.pendingRewards.filter(r => r.expiryDate <= sevenDaysFromNow);
    
    // Category optimization based on user preferences
    const relevantCategories = opportunities.filter(opp => 
      smartDefaults.rewardCategories.includes(opp.category) || 
      smartDefaults.rewardCategories.some(cat => opp.category.toLowerCase().includes(cat.toLowerCase()))
    );
    
    const shouldClaim = smartDefaults.autoClaimRewards && (autoClaimableAmount > 0 || expiringRewards.length > 0);
    
    let reasoning = '';
    if (shouldClaim) {
      if (autoClaimableAmount > 0) {
        reasoning = `Auto-claiming $${autoClaimableAmount.toFixed(2)} in available rewards`;
      }
      if (expiringRewards.length > 0) {
        const expiringAmount = expiringRewards.reduce((sum, r) => sum + r.amount, 0);
        reasoning += reasoning ? ` and $${expiringAmount.toFixed(2)} expiring soon` : `Claiming $${expiringAmount.toFixed(2)} in expiring rewards`;
      }
    } else {
      reasoning = `No auto-claimable rewards available. Total pending: $${totalPendingRewards.toFixed(2)}`;
    }
    
    return {
      totalPendingRewards: Math.round(totalPendingRewards * 100) / 100,
      autoClaimableAmount: Math.round(autoClaimableAmount * 100) / 100,
      expiringRewards,
      categoryOptimization: relevantCategories,
      shouldClaim,
      reasoning
    };
  }

  public generateRewardActions(analysis: RewardAnalysis): AgentAction[] {
    if (!analysis.shouldClaim) return [];

    const actions: AgentAction[] = [];
    const autoClaimableRewards = this.pendingRewards.filter(r => r.canAutoClaim);
    
    // Generate claim actions for auto-claimable rewards
    autoClaimableRewards.forEach(reward => {
      actions.push({
        id: `claim-${reward.id}-${Date.now()}`,
        type: 'claim-reward',
        status: 'pending',
        amount: reward.amount,
        token: 'USDC',
        reason: `🎁 Auto-claimed $${reward.amount} cashback from ${reward.merchant} (${reward.category})`,
        timestamp: new Date(),
        beforeBalance: 0, // Will be updated when executed
        afterBalance: 0   // Will be updated when executed
      });
    });

    return actions;
  }

  public updateLiveMetrics(metrics: LiveMetrics, smartDefaults: SmartDefaults): LiveMetrics {
    const analysis = this.analyzeRewardOptimization(smartDefaults);
    
    return {
      ...metrics,
      pendingRewards: analysis.totalPendingRewards
    };
  }

  public getRewardOpportunities(): RewardOpportunity[] {
    return this.getCurrentRewardOpportunities();
  }

  public getPendingRewardsList(): PendingReward[] {
    return this.pendingRewards;
  }
}
