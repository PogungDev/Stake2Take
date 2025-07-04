"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Coins, Shield, Zap, Bot, TrendingUp, Clock, RefreshCw } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Stake2Take</h1>
                <p className="text-sm text-gray-600">Smart Agents & Liquidity Automation</p>
              </div>
            </Link>

            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              How Stake2Take Works
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stake2Take uses AI-powered Smart Agents to automatically manage your USDC between yield-generating
              positions and your MetaMask Card.
            </p>
          </div>

          {/* Step by Step Process */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">The Stake2Take Process</CardTitle>
              <CardDescription>
                Our Smart Agent technology works behind the scenes to optimize your funds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Connect & Configure</h3>
                      <p className="text-gray-600">
                        Connect your wallet and set your target card balance, risk preferences, and automation settings.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Deposit USDC</h3>
                      <p className="text-gray-600">
                        Deposit USDC into your Stake2Take vault. This will be managed by our Smart Agent.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Smart Agent Activation</h3>
                      <p className="text-gray-600">
                        Activate your Smart Agent to begin automated management of your funds between yield positions
                        and your MetaMask Card.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Enjoy Automated Management</h3>
                      <p className="text-gray-600">
                        Your Smart Agent continuously monitors your card usage and automatically tops up your card while
                        maximizing yield on unused funds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-lg mb-4">How the Smart Agent Works</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-blue-600 mt-1" />
                      <p className="text-sm">
                        <span className="font-medium">Monitors Card Balance:</span> Continuously tracks your MetaMask
                        Card balance
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                      <p className="text-sm">
                        <span className="font-medium">Yield Optimization:</span> Allocates unused funds to the
                        highest-yielding protocols
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-purple-600 mt-1" />
                      <p className="text-sm">
                        <span className="font-medium">Predictive Top-ups:</span> Uses AI to predict when you'll need
                        funds and tops up proactively
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-red-600 mt-1" />
                      <p className="text-sm">
                        <span className="font-medium">Risk Management:</span> Maintains emergency buffers based on your
                        risk preferences
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <RefreshCw className="w-5 h-5 text-orange-600 mt-1" />
                      <p className="text-sm">
                        <span className="font-medium">Automatic Rebalancing:</span> Rebalances funds between yield
                        positions as market conditions change
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Benefits */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Key Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <Zap className="h-8 w-8 text-blue-600" />
                  <CardTitle>Zero Effort</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Set it and forget it. Our Smart Agent handles everything automatically, so you don't have to
                    manually manage your funds.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <CardTitle>Maximum Yield</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Earn yield on funds that would otherwise sit idle in your card. Our Smart Agent optimizes for the
                    highest returns.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <Shield className="h-8 w-8 text-purple-600" />
                  <CardTitle>Always Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Never worry about having enough funds on your card. The Smart Agent ensures your card always has
                    enough for your spending needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="yields">Yields</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="p-4 border rounded-md mt-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">What is Stake2Take?</h3>
                    <p className="text-gray-600">
                      Stake2Take is a DeFi Smart Agent that automatically manages your USDC between yield-generating
                      positions and your MetaMask Card, ensuring you always have enough funds while maximizing returns.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">How much does it cost?</h3>
                    <p className="text-gray-600">
                      Stake2Take charges a small fee on the yield generated. There are no subscription fees or upfront
                      costs.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Do I need a MetaMask Card?</h3>
                    <p className="text-gray-600">
                      Yes, Stake2Take is designed specifically to work with the MetaMask Card. You'll need to have a
                      MetaMask Card to use the service.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="security" className="p-4 border rounded-md mt-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Is my money safe?</h3>
                    <p className="text-gray-600">
                      Stake2Take uses non-custodial smart contracts, meaning you always maintain control of your funds.
                      Our contracts have been audited by leading security firms.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">What happens if there's a hack?</h3>
                    <p className="text-gray-600">
                      We use multiple security layers and only interact with battle-tested protocols. In the unlikely
                      event of an issue, our emergency pause feature can halt all operations.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Can I withdraw anytime?</h3>
                    <p className="text-gray-600">
                      Yes, you maintain full control of your funds and can withdraw at any time. There are no lock-up
                      periods.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="yields" className="p-4 border rounded-md mt-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">What yields can I expect?</h3>
                    <p className="text-gray-600">
                      Yields vary based on market conditions, but our Smart Agent optimizes for the highest stable
                      returns, typically ranging from 3-10% APY on USDC.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Which protocols do you use?</h3>
                    <p className="text-gray-600">
                      We integrate with leading DeFi protocols like Aave, Compound, and others to find the best yields
                      while maintaining security.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">How often is yield paid out?</h3>
                    <p className="text-gray-600">
                      Yields accrue continuously and are automatically reinvested to maximize returns through the power
                      of compounding.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="technical" className="p-4 border rounded-md mt-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Which networks are supported?</h3>
                    <p className="text-gray-600">
                      Stake2Take currently supports Ethereum, Base, and Arbitrum networks, with more networks coming
                      soon.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">How does the Smart Agent work?</h3>
                    <p className="text-gray-600">
                      Our Smart Agent uses AI algorithms to predict spending patterns, monitor yield opportunities, and
                      automatically execute transactions to optimize your funds.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">What if gas fees are high?</h3>
                    <p className="text-gray-600">
                      The Smart Agent is gas-aware and will batch transactions when possible. It also prioritizes L2
                      networks with lower gas costs when appropriate.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">
              Start earning yield on your idle funds while ensuring your MetaMask Card is always funded.
            </p>
            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Set Up Your Smart Agent
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
