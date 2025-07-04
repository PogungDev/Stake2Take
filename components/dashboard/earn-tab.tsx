"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Zap, Shield, ArrowRight, CheckCircle, BarChart3 } from "lucide-react"

interface EarnTabProps {
  settings?: any
  onUpdateSettings?: (updates: any) => void
  onComplete?: () => void
  onNext?: () => void
}

export function EarnTab({ settings, onUpdateSettings, onComplete, onNext }: EarnTabProps) {
  const [aaveAllocation, setAaveAllocation] = useState(settings?.vaultAllocations?.[0] || 40)
  const [compoundAllocation, setCompoundAllocation] = useState(settings?.vaultAllocations?.[1] || 40)
  const [uniswapAllocation, setUniswapAllocation] = useState(settings?.vaultAllocations?.[2] || 20)
  const [autoRebalance, setAutoRebalance] = useState(settings?.autoRebalance ?? true)
  const [riskLevel, setRiskLevel] = useState(settings?.riskLevel || "moderate")

  // Protocol data
  const protocols = [
    {
      name: "Aave",
      apy: 8.5,
      risk: "Low",
      allocation: aaveAllocation,
      setAllocation: setAaveAllocation,
      color: "blue",
      description: "Stable lending protocol with proven track record",
    },
    {
      name: "Compound",
      apy: 7.2,
      risk: "Low",
      allocation: compoundAllocation,
      setAllocation: setCompoundAllocation,
      color: "green",
      description: "Decentralized lending with algorithmic interest rates",
    },
    {
      name: "Uniswap V3",
      apy: 12.1,
      risk: "Medium",
      allocation: uniswapAllocation,
      setAllocation: setUniswapAllocation,
      color: "purple",
      description: "Concentrated liquidity providing with higher yields",
    },
  ]

  const totalAllocation = aaveAllocation + compoundAllocation + uniswapAllocation
  const weightedAPY = protocols.reduce((sum, protocol) => sum + (protocol.apy * protocol.allocation) / 100, 0)

  const handleAllocationChange = (protocolIndex: number, newValue: number[]) => {
    const newAllocation = newValue[0]
    const oldAllocation = protocols[protocolIndex].allocation
    const difference = newAllocation - oldAllocation

    // Adjust other allocations proportionally
    const otherProtocols = protocols.filter((_, i) => i !== protocolIndex)
    const totalOtherAllocation = otherProtocols.reduce((sum, p) => sum + p.allocation, 0)

    if (totalOtherAllocation > 0) {
      otherProtocols.forEach((protocol, i) => {
        const adjustmentRatio = protocol.allocation / totalOtherAllocation
        const adjustment = difference * adjustmentRatio
        const newValue = Math.max(0, Math.min(100, protocol.allocation - adjustment))

        if (protocolIndex === 0 && i === 0) setCompoundAllocation(newValue)
        else if (protocolIndex === 0 && i === 1) setUniswapAllocation(newValue)
        else if (protocolIndex === 1 && i === 0) setAaveAllocation(newValue)
        else if (protocolIndex === 1 && i === 1) setUniswapAllocation(newValue)
        else if (protocolIndex === 2 && i === 0) setAaveAllocation(newValue)
        else if (protocolIndex === 2 && i === 1) setCompoundAllocation(newValue)
      })
    }

    protocols[protocolIndex].setAllocation(newAllocation)
  }

  const handleSaveConfiguration = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        vaultAllocations: [aaveAllocation, compoundAllocation, uniswapAllocation],
        autoRebalance,
        riskLevel,
      })
    }
    if (onComplete) onComplete()
  }

  const riskLevels = [
    { id: "conservative", label: "Conservative", description: "Focus on stable yields, lower risk" },
    { id: "moderate", label: "Moderate", description: "Balanced approach with moderate risk" },
    { id: "aggressive", label: "Aggressive", description: "Higher yields with increased risk" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Configure Your Earning Strategy
          </CardTitle>
          <CardDescription>
            Optimize your USDC allocation across DeFi protocols for maximum yield with Stake2Take
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Expected Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{weightedAPY.toFixed(2)}%</div>
              <div className="text-sm text-green-700">Weighted APY</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                ${(((settings?.stakeAmount || 1000) * weightedAPY) / 100 / 365).toFixed(2)}
              </div>
              <div className="text-sm text-blue-700">Daily Earnings</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                ${(((settings?.stakeAmount || 1000) * weightedAPY) / 100 / 12).toFixed(2)}
              </div>
              <div className="text-sm text-purple-700">Monthly Earnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Protocol Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Allocation</CardTitle>
          <CardDescription>Distribute your USDC across different DeFi protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {protocols.map((protocol, index) => (
              <div key={protocol.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-${protocol.color}-500`}></div>
                    <div>
                      <div className="font-medium">{protocol.name}</div>
                      <div className="text-sm text-gray-600">{protocol.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{protocol.apy}% APY</div>
                    <Badge variant="outline" className={`text-${protocol.color}-700 border-${protocol.color}-200`}>
                      {protocol.risk} Risk
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Allocation</span>
                    <span className="font-medium">{protocol.allocation}%</span>
                  </div>
                  <Slider
                    value={[protocol.allocation]}
                    onValueChange={(value) => handleAllocationChange(index, value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Allocation</span>
                <span className={`font-bold ${totalAllocation === 100 ? "text-green-600" : "text-red-600"}`}>
                  {totalAllocation}%
                </span>
              </div>
              <Progress value={totalAllocation} className="mt-2" />
              {totalAllocation !== 100 && (
                <div className="text-sm text-red-600 mt-1">Total allocation must equal 100%</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Risk Preference
          </CardTitle>
          <CardDescription>Choose your risk tolerance for automated rebalancing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskLevels.map((level) => (
              <div
                key={level.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  riskLevel === level.id
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => setRiskLevel(level.id)}
              >
                <div className="text-center">
                  <div className="font-medium mb-2">{level.label}</div>
                  <div className="text-sm text-gray-600">{level.description}</div>
                  {riskLevel === level.id && <CheckCircle className="w-5 h-5 text-orange-600 mx-auto mt-2" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Rebalancing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Automation Settings
          </CardTitle>
          <CardDescription>Configure automatic rebalancing for optimal yields</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-rebalance" className="text-base font-medium">
                  Auto-Rebalancing
                </Label>
                <div className="text-sm text-gray-600">
                  Automatically rebalance allocations when APY differences exceed 2%
                </div>
              </div>
              <Switch id="auto-rebalance" checked={autoRebalance} onCheckedChange={setAutoRebalance} />
            </div>

            {autoRebalance && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700">
                  <strong>Auto-Rebalancing Active:</strong> Your Stake2Take agent will monitor APY rates across
                  protocols and automatically rebalance your allocation to maximize yields while respecting your risk
                  preferences.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Complete */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-green-900">Earning Strategy Configured!</h3>
              <p className="text-green-700">
                Your USDC will be optimally allocated across protocols to earn an estimated {weightedAPY.toFixed(2)}%
                APY.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleSaveConfiguration} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              {onNext && (
                <Button
                  onClick={onNext}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  Next: Setup Automation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
