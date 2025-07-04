import { AgentAction, LiveMetrics } from '@/types/app-structure';

export interface SpendingPattern {
  dayOfWeek: number;
  averageSpend: number;
  category: string;
  confidence: number;
}

export interface SpendingForecast {
  nextSevenDays: number;
  dailyBreakdown: { day: string; predicted: number; confidence: number }[];
  emergencyBuffer: number;
  topUpAmount: number;
  shouldTopUp: boolean;
  reasoning: string;
}

export class SpendingPredictionEngine {
  private patterns: SpendingPattern[] = [];
  
  // Simulate historical spending patterns
  private getHistoricalPatterns(): SpendingPattern[] {
    return [
      { dayOfWeek: 1, averageSpend: 45, category: 'Coffee & Food', confidence: 0.85 },
      { dayOfWeek: 2, averageSpend: 38, category: 'Coffee & Food', confidence: 0.82 },
      { dayOfWeek: 3, averageSpend: 42, category: 'Coffee & Food', confidence: 0.88 },
      { dayOfWeek: 4, averageSpend: 48, category: 'Coffee & Food', confidence: 0.79 },
      { dayOfWeek: 5, averageSpend: 55, category: 'Coffee & Food + Entertainment', confidence: 0.91 },
      { dayOfWeek: 6, averageSpend: 25, category: 'Groceries', confidence: 0.76 },
      { dayOfWeek: 0, averageSpend: 20, category: 'Miscellaneous', confidence: 0.68 }
    ];
  }

  private getDayName(dayIndex: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  }

  public analyzePrediction(currentBalance: number, emergencyBuffer: number = 50): SpendingForecast {
    this.patterns = this.getHistoricalPatterns();
    
    const today = new Date();
    const dailyBreakdown = [];
    let totalPredicted = 0;

    // Generate 7-day forecast
    for (let i = 0; i < 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const dayOfWeek = futureDate.getDay();
      
      const pattern = this.patterns.find(p => p.dayOfWeek === dayOfWeek);
      const predicted = pattern ? pattern.averageSpend : 30;
      const confidence = pattern ? pattern.confidence : 0.5;
      
      // Add some variance for realism
      const variance = predicted * 0.15 * (Math.random() - 0.5);
      const adjustedPredicted = Math.max(0, predicted + variance);
      
      totalPredicted += adjustedPredicted;
      
      dailyBreakdown.push({
        day: this.getDayName(dayOfWeek),
        predicted: Math.round(adjustedPredicted * 100) / 100,
        confidence: Math.round(confidence * 100) / 100
      });
    }

    const requiredAmount = totalPredicted + emergencyBuffer;
    const shortfall = requiredAmount - currentBalance;
    const shouldTopUp = shortfall > 0;
    const topUpAmount = shouldTopUp ? Math.ceil(shortfall / 10) * 10 : 0; // Round up to nearest $10

    let reasoning = '';
    if (shouldTopUp) {
      reasoning = `Current balance $${currentBalance} insufficient for 7-day forecast $${Math.round(totalPredicted)} + buffer $${emergencyBuffer}. Auto top-up $${topUpAmount} recommended.`;
    } else {
      reasoning = `Current balance $${currentBalance} sufficient for 7-day forecast $${Math.round(totalPredicted)} + buffer $${emergencyBuffer}. No top-up needed.`;
    }

    return {
      nextSevenDays: Math.round(totalPredicted * 100) / 100,
      dailyBreakdown,
      emergencyBuffer,
      topUpAmount,
      shouldTopUp,
      reasoning
    };
  }

  public generateTopUpAction(forecast: SpendingForecast): AgentAction | null {
    if (!forecast.shouldTopUp) return null;

    return {
      id: `topup-${Date.now()}`,
      type: 'top-up',
      status: 'pending',
      amount: forecast.topUpAmount,
      token: 'USDC',
      reason: forecast.reasoning,
      timestamp: new Date(),
      beforeBalance: 0, // Will be updated when executed
      afterBalance: 0   // Will be updated when executed
    };
  }

  public updateLiveMetrics(metrics: LiveMetrics, forecast: SpendingForecast): LiveMetrics {
    return {
      ...metrics,
      spendingForecast: forecast.nextSevenDays,
      nextTopUp: forecast.shouldTopUp ? forecast.topUpAmount : 0
    };
  }
}
