"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Shield, TrendingUp, BarChart3, Zap, DollarSign } from "lucide-react"

export function VaultTab() {
  const [aaveAllocation, setAaveAllocation] = useState([60])
  const [compoundAllocation, setCompoundAllocation] = useState([40])
  const [totalDeposited] = useState(2500)
  const [currentAPY] = useState(5.2)
  const [monthlyEarnings] = useState(10.83)

  const handleAaveChange = (value: number[]) => {
    setAaveAllocation(value)
    setCompoundAllocation([100 - value[0]])
  }

  const handleCompoundChange = (value: number[]) => {
    setCompoundAllocation(value)
    setAaveAllocation([100 - value[0]])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            USDC Vault Management
          </CardTitle>
          <CardDescription>Your staked USDC earning yield through Aave and Compound protocols</CardDescription>
        </CardHeader>
      </Card>

      {/* Current Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deposited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalDeposited.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">USDC Staked</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current APY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentAPY}%</div>
            <div className="text-sm text-green-500 mt-1">+0.3% this week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${monthlyEarnings}</div>
            <div className="text-sm text-gray-500 mt-1">Projected</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$127.45</div>
            <div className="text-sm text-gray-500 mt-1">All time</div>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Protocol Allocation
          </CardTitle>
          <CardDescription>Distribute your USDC between Aave and Compound for optimal yield</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aave Allocation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <div>
                  <div className="font-medium">Aave Protocol</div>
                  <div className="text-sm text-gray-600">Current APY: 4.8%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{aaveAllocation[0]}%</div>
                <div className="text-sm text-gray-600">
                  ${((totalDeposited * aaveAllocation[0]) / 100).toLocaleString()}
                </div>
              </div>
            </div>
            <Slider value={aaveAllocation} onValueChange={handleAaveChange} max={100} step={5} className="w-full" />
          </div>

          {/* Compound Allocation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <div>
                  <div className="font-medium">Compound Protocol</div>
                  <div className="text-sm text-gray-600">Current APY: 5.6%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{compoundAllocation[0]}%</div>
                <div className="text-sm text-gray-600">
                  ${((totalDeposited * compoundAllocation[0]) / 100).toLocaleString()}
                </div>
              </div>
            </div>
            <Slider
              value={compoundAllocation}
              onValueChange={handleCompoundChange}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Allocation</span>
              <span className="font-bold text-green-600">100%</span>
            </div>
            <Progress value={100} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Yield Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            AI Yield Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-700">Optimization Opportunity</span>
              </div>
              <p className="text-sm text-yellow-600 mb-3">
                Compound APY increased to 5.6%. Consider rebalancing to 30% Aave / 70% Compound for +0.4% APY boost.
              </p>
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                Apply Optimization (+$8.33/month)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-700 mb-2">Current Strategy</div>
                <div className="text-sm text-blue-600">
                  <div>
                    • Aave: {aaveAllocation[0]}% (${((totalDeposited * aaveAllocation[0]) / 100).toLocaleString()})
                  </div>
                  <div>
                    • Compound: {compoundAllocation[0]}% ($
                    {((totalDeposited * compoundAllocation[0]) / 100).toLocaleString()})
                  </div>
                  <div className="mt-2 font-medium">Weighted APY: {currentAPY}%</div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="font-medium text-green-700 mb-2">Optimized Strategy</div>
                <div className="text-sm text-green-600">
                  <div>• Aave: 30% ($750)</div>
                  <div>• Compound: 70% ($1,750)</div>
                  <div className="mt-2 font-medium">Projected APY: 5.6%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
          <CardDescription>Your vault's earning performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { period: "This Month", earned: "$10.83", apy: "5.2%", status: "current" },
              { period: "Last Month", earned: "$9.67", apy: "4.6%", status: "completed" },
              { period: "2 Months Ago", earned: "$11.25", apy: "5.4%", status: "completed" },
              { period: "3 Months Ago", earned: "$8.90", apy: "4.3%", status: "completed" },
            ].map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${record.status === "current" ? "bg-green-500" : "bg-gray-400"}`}
                  />
                  <span className="font-medium">{record.period}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium text-green-600">{record.earned}</div>
                    <div className="text-sm text-gray-600">{record.apy} APY</div>
                  </div>
                  <Badge variant={record.status === "current" ? "default" : "secondary"}>
                    {record.status === "current" ? "Current" : "Completed"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Vault Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2">
              <DollarSign className="w-6 h-6" />
              <span>Deposit More USDC</span>
              <span className="text-xs opacity-75">Increase vault size</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <Zap className="w-6 h-6" />
              <span>Auto-Rebalance</span>
              <span className="text-xs opacity-75">Enable optimization</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <BarChart3 className="w-6 h-6" />
              <span>Detailed Analytics</span>
              <span className="text-xs opacity-75">View full report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
