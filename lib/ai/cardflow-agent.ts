import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { z } from 'zod'

// Type definitions for AI responses
const SpendingPredictionSchema = z.object({
  predicted7Days: z.number(),
  predicted30Days: z.number(),
  confidence: z.number().min(0).max(1),
  categories: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    percentage: z.number()
  })),
  insights: z.array(z.string()),
  recommendations: z.array(z.string())
})

const YieldOptimizationSchema = z.object({
  strategies: z.array(z.object({
    protocol: z.string(),
    chain: z.string(),
    allocation: z.number(),
    expectedApy: z.number(),
    riskLevel: z.number(),
    description: z.string()
  })),
  totalExpectedApy: z.number(),
  riskScore: z.number(),
  gasEstimate: z.number(),
  recommendations: z.array(z.string())
})

const AIInsightSchema = z.object({
  type: z.enum(['prediction', 'optimization', 'warning', 'success', 'alert']),
  title: z.string(),
  description: z.string(),
  confidence: z.number(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  actionable: z.boolean(),
  action: z.string().optional()
})

export type SpendingPrediction = z.infer<typeof SpendingPredictionSchema>
export type YieldOptimization = z.infer<typeof YieldOptimizationSchema>
export type AIInsight = z.infer<typeof AIInsightSchema>

// Transaction history interface
interface TransactionData {
  date: string
  amount: number
  category: string
  description?: string
  type: 'debit' | 'credit'
  hash?: string
}

interface UserProfile {
  riskTolerance: number // 1-10
  monthlyIncome?: number
  savingsGoal?: number
  spendingLimits?: Record<string, number>
}

interface MarketData {
  apy: Record<string, number>
  gasPrice: Record<string, number>
  tvl: Record<string, number>
}

export class VaultMasterAI {
  private model: ChatOpenAI
  private isEnabled: boolean

  constructor(apiKey?: string) {
    const openaiKey = apiKey || process.env.OPENAI_API_KEY
    
    if (!openaiKey) {
      console.warn('OpenAI API key not provided. AI features will use mock data.')
      this.isEnabled = false
      this.model = {} as ChatOpenAI
    } else {
      this.isEnabled = true
      this.model = new ChatOpenAI({
        modelName: 'gpt-4',
        temperature: 0.1,
        openAIApiKey: openaiKey,
        maxTokens: 2000,
        timeout: 30000
      })
    }
  }

  /**
   * Predict user spending patterns using AI analysis
   */
  async predictSpending(
    userAddress: string, 
    historicalData: TransactionData[], 
    userProfile?: UserProfile
  ): Promise<SpendingPrediction> {
    if (!this.isEnabled) {
      return this.getMockSpendingPrediction()
    }

    try {
      const systemPrompt = `You are VaultMaster AI, an expert financial analyst specializing in MetaMask Card spending patterns.

CONTEXT:
- User Address: ${userAddress}
- Analysis Period: Last ${historicalData.length} transactions
- User Risk Tolerance: ${userProfile?.riskTolerance || 'Not specified'}/10

HISTORICAL DATA:
${JSON.stringify(historicalData, null, 2)}

TASK:
Analyze the spending patterns and provide accurate predictions for the next 7 and 30 days.

REQUIREMENTS:
1. Calculate predicted spending amounts with high accuracy
2. Categorize spending by type (Food, Transport, Shopping, etc.)
3. Provide confidence score (0-1) based on data consistency
4. Give actionable insights about spending habits
5. Recommend optimization strategies

RESPONSE FORMAT:
Return a valid JSON object matching this schema:
{
  "predicted7Days": number,
  "predicted30Days": number,
  "confidence": number (0-1),
  "categories": [{"name": string, "amount": number, "percentage": number}],
  "insights": [string],
  "recommendations": [string]
}`

      const userPrompt = `Analyze this MetaMask Card user's spending pattern and predict their future expenses. Focus on accuracy and actionable insights that can help with automated financial management.`

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt)
      ]

      const response = await this.model.invoke(messages)
      const content = response.content as string
      
      return this.parseSpendingResponse(content)
    } catch (error) {
      console.error('Error in spending prediction:', error)
      return this.getMockSpendingPrediction()
    }
  }

  /**
   * Optimize yield strategies across multiple protocols and chains
   */
  async optimizeYield(
    amount: number,
    riskLevel: number,
    currentChain: number,
    userProfile?: UserProfile,
    marketData?: MarketData
  ): Promise<YieldOptimization> {
    if (!this.isEnabled) {
      return this.getMockYieldOptimization(amount, riskLevel)
    }

    try {
      const systemPrompt = `You are VaultMaster AI, a DeFi yield optimization expert with deep knowledge of cross-chain protocols.

OPTIMIZATION PARAMETERS:
- Amount: $${amount} USDC
- Risk Level: ${riskLevel}/10 (1=Conservative, 10=Aggressive)
- Current Chain: ${currentChain}
- User Profile: ${JSON.stringify(userProfile || {})}
- Market Data: ${JSON.stringify(marketData || {})}

AVAILABLE PROTOCOLS:
Conservative (Risk 1-3):
- Aave (Multi-chain): 4-8% APY, High safety
- Compound (Ethereum): 3-7% APY, Proven track record
- Circle Yield (Base): 5% APY, USDC native

Moderate (Risk 4-7):
- Uniswap V3 (Multi-chain): 8-15% APY, IL risk
- Curve (Multi-chain): 6-12% APY, Stable pairs
- Yearn (Multi-chain): 8-20% APY, Automated strategies

Aggressive (Risk 8-10):
- GMX (Arbitrum): 15-30% APY, Higher volatility
- Pendle (Multi-chain): 10-25% APY, Yield trading
- Convex (Ethereum): 12-28% APY, Boosted rewards

TASK:
1. Recommend optimal allocation across protocols
2. Consider gas costs and chain efficiency
3. Balance risk vs reward based on user preference
4. Provide expected APY and risk assessment
5. Include cross-chain opportunities

RESPONSE FORMAT:
Return valid JSON matching this schema:
{
  "strategies": [{"protocol": string, "chain": string, "allocation": number, "expectedApy": number, "riskLevel": number, "description": string}],
  "totalExpectedApy": number,
  "riskScore": number,
  "gasEstimate": number,
  "recommendations": [string]
}`

      const userPrompt = `Optimize yield for this portfolio considering the risk tolerance and current market conditions. Prioritize MetaMask Card compatibility and cross-chain efficiency.`

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt)
      ]

      const response = await this.model.invoke(messages)
      const content = response.content as string
      
      return this.parseYieldResponse(content)
    } catch (error) {
      console.error('Error in yield optimization:', error)
      return this.getMockYieldOptimization(amount, riskLevel)
    }
  }

  /**
   * Generate actionable insights for the user
   */
  async generateInsights(
    userAddress: string,
    recentTransactions: TransactionData[],
    portfolioValue: number,
    userProfile?: UserProfile
  ): Promise<AIInsight[]> {
    if (!this.isEnabled) {
      return this.getMockInsights()
    }

    try {
      const systemPrompt = `You are VaultMaster AI, providing intelligent insights for MetaMask Card users.

USER CONTEXT:
- Address: ${userAddress}
- Portfolio Value: $${portfolioValue}
- Recent Transactions: ${recentTransactions.length} transactions
- Profile: ${JSON.stringify(userProfile || {})}

TRANSACTION DATA:
${JSON.stringify(recentTransactions.slice(-10), null, 2)}

TASK:
Generate 3-5 actionable insights that help the user make better financial decisions.

INSIGHT TYPES:
- prediction: Spending forecasts and trends
- optimization: Yield and efficiency improvements
- warning: Risk alerts and overspending
- success: Achievements and positive trends
- alert: Urgent actions needed

RESPONSE FORMAT:
Return valid JSON array of insights:
[{
  "type": "prediction|optimization|warning|success|alert",
  "title": "Short descriptive title",
  "description": "Detailed explanation",
  "confidence": number (0-1),
  "priority": "low|medium|high|critical",
  "actionable": boolean,
  "action": "Specific action user can take (optional)"
}]`

      const userPrompt = `Analyze this user's financial activity and provide intelligent insights that can help optimize their MetaMask Card usage and DeFi strategies.`

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt)
      ]

      const response = await this.model.invoke(messages)
      const content = response.content as string
      
      return this.parseInsightsResponse(content)
    } catch (error) {
      console.error('Error generating insights:', error)
      return this.getMockInsights()
    }
  }

  // Parse AI responses with error handling
  private parseSpendingResponse(content: string): SpendingPrediction {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return SpendingPredictionSchema.parse(parsed)
      }
    } catch (error) {
      console.error('Error parsing spending response:', error)
    }
    return this.getMockSpendingPrediction()
  }

  private parseYieldResponse(content: string): YieldOptimization {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return YieldOptimizationSchema.parse(parsed)
      }
    } catch (error) {
      console.error('Error parsing yield response:', error)
    }
    return this.getMockYieldOptimization(1000, 5)
  }

  private parseInsightsResponse(content: string): AIInsight[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return z.array(AIInsightSchema).parse(parsed)
      }
    } catch (error) {
      console.error('Error parsing insights response:', error)
    }
    return this.getMockInsights()
  }

  // Mock data for development and fallback
  private getMockSpendingPrediction(): SpendingPrediction {
    return {
      predicted7Days: 245,
      predicted30Days: 1050,
      confidence: 0.87,
      categories: [
        { name: 'Food & Dining', amount: 120, percentage: 35 },
        { name: 'Transportation', amount: 80, percentage: 23 },
        { name: 'Shopping', amount: 70, percentage: 20 },
        { name: 'Entertainment', amount: 45, percentage: 13 },
        { name: 'Other', amount: 30, percentage: 9 }
      ],
      insights: [
        'Spending pattern is consistent with previous months',
        'Food expenses are higher than average on weekends',
        'Transportation costs have increased 15% this month'
      ],
      recommendations: [
        'Set up auto top-up of $250 for next week',
        'Consider budgeting $120 for dining expenses',
        'Monitor transportation costs for optimization'
      ]
    }
  }

  private getMockYieldOptimization(amount: number, riskLevel: number): YieldOptimization {
    const strategies = riskLevel <= 3 ? [
      { protocol: 'Aave', chain: 'Base', allocation: 60, expectedApy: 8.5, riskLevel: 2, description: 'Stable lending with USDC' },
      { protocol: 'Compound', chain: 'Ethereum', allocation: 40, expectedApy: 7.2, riskLevel: 2, description: 'Conservative lending protocol' }
    ] : riskLevel <= 7 ? [
      { protocol: 'Aave', chain: 'Base', allocation: 40, expectedApy: 8.5, riskLevel: 2, description: 'Base allocation for stability' },
      { protocol: 'Uniswap V3', chain: 'Arbitrum', allocation: 35, expectedApy: 12.1, riskLevel: 6, description: 'USDC/ETH liquidity pool' },
      { protocol: 'Curve', chain: 'Polygon', allocation: 25, expectedApy: 9.8, riskLevel: 4, description: 'Stable coin pool' }
    ] : [
      { protocol: 'Aave', chain: 'Base', allocation: 25, expectedApy: 8.5, riskLevel: 2, description: 'Conservative base' },
      { protocol: 'Uniswap V3', chain: 'Arbitrum', allocation: 30, expectedApy: 15.2, riskLevel: 7, description: 'High yield LP' },
      { protocol: 'GMX', chain: 'Arbitrum', allocation: 25, expectedApy: 22.5, riskLevel: 9, description: 'Aggressive yield farming' },
      { protocol: 'Pendle', chain: 'Ethereum', allocation: 20, expectedApy: 18.7, riskLevel: 8, description: 'Yield trading' }
    ]

    const totalExpectedApy = strategies.reduce((sum, s) => sum + (s.expectedApy * s.allocation / 100), 0)

    return {
      strategies,
      totalExpectedApy: Number(totalExpectedApy.toFixed(2)),
      riskScore: riskLevel,
      gasEstimate: amount > 1000 ? 85 : 45,
      recommendations: [
        'Consider cross-chain optimization for better yields',
        'Monitor gas prices for optimal execution timing',
        'Set up automated rebalancing for efficiency'
      ]
    }
  }

  private getMockInsights(): AIInsight[] {
    return [
      {
        type: 'prediction',
        title: 'Spending Forecast',
        description: 'Based on your patterns, you\'ll spend ~$245 in the next 7 days. Auto top-up recommended.',
        confidence: 0.89,
        priority: 'medium',
        actionable: true,
        action: 'Enable auto top-up'
      },
      {
        type: 'optimization',
        title: 'Yield Opportunity',
        description: 'Move $500 from idle balance to Aave on Base for +8.5% APY (~$3.50/month extra)',
        confidence: 0.94,
        priority: 'high',
        actionable: true,
        action: 'Optimize yield allocation'
      },
      {
        type: 'warning',
        title: 'High Spending Week',
        description: 'Your spending is 23% higher than usual this week. Check entertainment expenses.',
        confidence: 0.76,
        priority: 'medium',
        actionable: true,
        action: 'Review recent transactions'
      }
    ]
  }
}
