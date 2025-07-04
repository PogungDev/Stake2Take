import { AgentAction, LiveMetrics, SmartDefaults } from '@/types/app-structure';

export interface CreditAnalysis {
  currentUtilization: number;
  monthlyLimit: number;
  utilizationPercent: number;
  remainingCredit: number;
  projectedEndOfMonth: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  shouldRepay: boolean;
  repayAmount: number;
  reasoning: string;
}

export interface CreditTransaction {
  id: string;
  date: Date;
  merchant: string;
  amount: number;
  category: string;
  isRecurring: boolean;
}

export interface YieldRepayment {
  availableYield: number;
  recommendedRepayAmount: number;
  impactOnYield: number; // percentage of yield used
  netBenefit: number; // credit limit restored vs yield opportunity cost
  shouldExecute: boolean;
}

export class CreditManagementEngine {
  private recentTransactions: CreditTransaction[] = [];
  
  // Simulate recent credit transactions
  private getRecentTransactions(): CreditTransaction[] {
    const now = new Date();
    return [
      {
        id: 'tx-1',
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        merchant: 'Starbucks',
        amount: 12.50,
        category: 'Food & Dining',
        isRecurring: true
      },
      {
        id: 'tx-2',
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        merchant: 'Uber',
        amount: 25.75,
        category: 'Transportation',
        isRecurring: false
      },
      {
        id: 'tx-3',
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        merchant: 'Amazon',
        amount: 89.99,
        category: 'Online Shopping',
        isRecurring: false
      },
      {
        id: 'tx-4',
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        merchant: 'Whole Foods',
        amount: 156.30,
        category: 'Groceries',
        isRecurring: true
      }
    ];
  }

  private calculateProjectedSpending(transactions: CreditTransaction[]): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysRemaining = daysInMonth - daysPassed;
    
    // Calculate daily average from recent transactions
    const dailySpending = transactions.reduce((sum, tx) => sum + tx.amount, 0) / Math.min(transactions.length, 30);
    
    // Factor in recurring transactions
    const recurringDaily = transactions
      .filter(tx => tx.isRecurring)
      .reduce((sum, tx) => sum + tx.amount, 0) / 7; // Weekly recurring
    
    return (dailySpending + recurringDaily) * daysRemaining;
  }

  public analyzeCreditUsage(
    currentUtilization: number, 
    monthlyLimit: number, 
    availableYield: number,
    smartDefaults: SmartDefaults
  ): CreditAnalysis {
    this.recentTransactions = this.getRecentTransactions();
    
    const utilizationPercent = (currentUtilization / monthlyLimit) * 100;
    const remainingCredit = monthlyLimit - currentUtilization;
    const projectedSpending = this.calculateProjectedSpending(this.recentTransactions);
    const projectedEndOfMonth = currentUtilization + projectedSpending;
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (utilizationPercent < 50) riskLevel = 'low';
    else if (utilizationPercent < 75) riskLevel = 'medium';
    else if (utilizationPercent < 90) riskLevel = 'high';
    else riskLevel = 'critical';
    
    // Enhanced risk if projected to exceed limit
    if (projectedEndOfMonth > monthlyLimit) {
      riskLevel = utilizationPercent > 85 ? 'critical' : 'high';
    }
    
    // Determine if should repay based on smart defaults and risk
    const shouldRepay = smartDefaults.autoRepayFromYield && 
                       (utilizationPercent >= 85 || projectedEndOfMonth > monthlyLimit * 0.95) &&
                       availableYield >= 50; // Minimum $50 yield required
    
    // Calculate optimal repay amount
    let repayAmount = 0;
    if (shouldRepay) {
      const excessProjected = Math.max(0, projectedEndOfMonth - monthlyLimit * 0.8); // Target 80% utilization
      const safetyBuffer = monthlyLimit * 0.1; // 10% safety buffer
      const targetRepay = Math.max(excessProjected, safetyBuffer);
      repayAmount = Math.min(targetRepay, availableYield, currentUtilization);
      repayAmount = Math.max(50, Math.min(repayAmount, 200)); // Between $50-$200
    }
    
    // Generate reasoning
    let reasoning = '';
    if (shouldRepay) {
      reasoning = `Credit utilization ${utilizationPercent.toFixed(1)}% (${currentUtilization}/${monthlyLimit}). `;
      if (projectedEndOfMonth > monthlyLimit) {
        reasoning += `Projected to exceed limit by $${(projectedEndOfMonth - monthlyLimit).toFixed(2)}. `;
      }
      reasoning += `Auto-repaying $${repayAmount} from vault yield to restore capacity.`;
    } else if (riskLevel === 'critical') {
      reasoning = `Critical: ${utilizationPercent.toFixed(1)}% utilization. Insufficient yield ($${availableYield}) for auto-repay.`;
    } else {
      reasoning = `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk: ${utilizationPercent.toFixed(1)}% utilization. Monitoring closely.`;
    }
    
    return {
      currentUtilization,
      monthlyLimit,
      utilizationPercent: Math.round(utilizationPercent * 10) / 10,
      remainingCredit: Math.round(remainingCredit * 100) / 100,
      projectedEndOfMonth: Math.round(projectedEndOfMonth * 100) / 100,
      riskLevel,
      shouldRepay,
      repayAmount: Math.round(repayAmount * 100) / 100,
      reasoning
    };
  }

  public analyzeYieldRepayment(
    creditAnalysis: CreditAnalysis, 
    availableYield: number,
    currentAPY: number
  ): YieldRepayment {
    const impactOnYield = (creditAnalysis.repayAmount / availableYield) * 100;
    
    // Calculate opportunity cost of using yield vs keeping it invested
    const annualYieldOpportunityCost = (creditAnalysis.repayAmount * currentAPY) / 100;
    const monthlyOpportunityCost = annualYieldOpportunityCost / 12;
    
    // Benefit of restoring credit capacity (avoiding overlimit fees, maintaining flexibility)
    const creditCapacityValue = creditAnalysis.repayAmount * 0.02; // 2% monthly value of available credit
    const overlimitAvoidance = creditAnalysis.projectedEndOfMonth > creditAnalysis.monthlyLimit ? 35 : 0; // $35 overlimit fee
    
    const netBenefit = creditCapacityValue + overlimitAvoidance - monthlyOpportunityCost;
    
    return {
      availableYield: Math.round(availableYield * 100) / 100,
      recommendedRepayAmount: creditAnalysis.repayAmount,
      impactOnYield: Math.round(impactOnYield * 10) / 10,
      netBenefit: Math.round(netBenefit * 100) / 100,
      shouldExecute: creditAnalysis.shouldRepay && netBenefit > 0
    };
  }

  public generateCreditAction(analysis: CreditAnalysis): AgentAction | null {
    if (!analysis.shouldRepay) return null;

    return {
      id: `credit-repay-${Date.now()}`,
      type: 'repay-credit',
      status: 'pending',
      amount: analysis.repayAmount,
      token: 'USDC',
      reason: analysis.reasoning,
      timestamp: new Date(),
      beforeBalance: analysis.currentUtilization,
      afterBalance: analysis.currentUtilization - analysis.repayAmount
    };
  }

  public updateLiveMetrics(
    metrics: LiveMetrics, 
    creditAnalysis: CreditAnalysis
  ): LiveMetrics {
    return {
      ...metrics,
      creditUtilization: creditAnalysis.currentUtilization,
      monthlySpendingCap: creditAnalysis.monthlyLimit
    };
  }

  public getCreditInsights(): {
    topCategories: { category: string; amount: number; percentage: number }[];
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
    recurringTransactions: CreditTransaction[];
  } {
    this.recentTransactions = this.getRecentTransactions();
    
    // Calculate spending by category
    const categoryTotals = this.recentTransactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round((amount / totalSpending) * 100 * 10) / 10
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Simple trend analysis (would be more sophisticated in production)
    const spendingTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    
    const recurringTransactions = this.recentTransactions.filter(tx => tx.isRecurring);
    
    return {
      topCategories,
      spendingTrend,
      recurringTransactions
    };
  }
}
