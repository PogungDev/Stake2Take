"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Zap, Shield, Target, Gift, CreditCard, Bot } from "lucide-react"

export function HowItWorksTab() {
  const steps = [
    {
      icon: Target,
      title: "Set Your Goals",
      description: "Define target balance, spending categories, and risk preferences",
      example: "Target: $300, Emergency buffer: $50",
    },
    {
      icon: Shield,
      title: "Configure Vault",
      description: "Set USDC allocation between Aave and Compound protocols",
      example: "Aave 60% / Compound 40%",
    },
    {
      icon: Gift,
      title: "Setup Rewards",
      description: "Choose cashback categories and auto-claim thresholds",
      example: "2% on Spotify, auto-claim at $10",
    },
    {
      icon: CreditCard,
      title: "Credit Management",
      description: "Set credit limits and auto-repay triggers",
      example: "Auto-repay when >80% utilization",
    },
    {
      icon: Bot,
      title: "Activate Agent",
      description: "Smart agent monitors all conditions every 5 seconds",
      example: "Real-time automation starts",
    },
    {
      icon: Zap,
      title: "Automated Actions",
      description: "Agent executes top-ups, rebalancing, claims, and repayments",
      example: "Balance low → Auto top-up $180",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">How Stake2Take Works</h2>
        <p className="text-gray-600">AI-powered automation for your MetaMask Card</p>
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Zap className="w-4 h-4 mr-2" />
          Smart Agent Technology
        </Badge>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-orange-600 font-bold">#{index + 1}</span>
                    {step.title}
                  </CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </div>
                {index < steps.length - 1 && <ArrowRight className="w-5 h-5 text-gray-400" />}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-gray-50 rounded-lg p-3">
                <code className="text-sm text-gray-700">{step.example}</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Loop Code */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-600" />
            Agent Monitoring Loop
          </CardTitle>
          <CardDescription>The smart agent runs this logic every 5 seconds when activated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
            <div className="space-y-1">
              <div>{"// Every 5 seconds when agent is active"}</div>
              <div>{"if (balance < targetBalance) {"}</div>
              <div className="ml-4">{"topUp(targetBalance - balance)"}</div>
              <div>{"}"}</div>
              <div>{"if (apyDelta > 1.5%) {"}</div>
              <div className="ml-4">{"rebalanceVault()"}</div>
              <div>{"}"}</div>
              <div>{"if (cashback > $10) {"}</div>
              <div className="ml-4">{"autoClaim()"}</div>
              <div>{"}"}</div>
              <div>{"if (creditUtilization > 80%) {"}</div>
              <div className="ml-4">{"autoRepay($100)"}</div>
              <div>{"}"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">🎯 Never Miss Opportunities</h4>
              <p className="text-sm text-gray-600">Automatic rebalancing when APY changes</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">💰 Maximize Cashback</h4>
              <p className="text-sm text-gray-600">Auto-claim rewards at optimal thresholds</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">🛡️ Credit Protection</h4>
              <p className="text-sm text-gray-600">Prevent over-utilization with auto-repay</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">⚡ Real-time Monitoring</h4>
              <p className="text-sm text-gray-600">5-second checks ensure instant responses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
