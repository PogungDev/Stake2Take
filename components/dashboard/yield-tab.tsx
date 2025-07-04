"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Zap, BarChart3, Percent, ArrowUp, Activity } from "lucide-react"

interface YieldTabProps {
  onSuccess?: () => void
}

export function YieldTab({ onSuccess }: YieldTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Vault Yield Strategy & Optimization
          </CardTitle>
          <CardDescription>
            Configure how your idle balance earns passive income through optimized LP positions
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Vault Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Current Vault Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">8.47%</div>
                <div className="text-sm text-gray-600">Current APY</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Deposited</span>
                  <span className="text-sm font-medium">$8,500 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Earned (30 days)</span>
                  <span className="text-sm font-medium text-green-600">+$186.34</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Strategy</span>
                  <Badge variant="outline" className="text-blue-600">
                    Balanced
                  </Badge>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">+$12.34 today</span>
                </div>
                <div className="text-xs text-green-600">ETH-USDC LP fees + yield farming rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Strategy Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">ETH-USDC LP (Uniswap V3)</span>
                  <span className="text-sm font-medium">65%</span>
                </div>
                <Progress value={65} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">USDC Lending (Aave)</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <Progress value={25} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Stablecoin LP (Curve)</span>
                  <span className="text-sm font-medium">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-700">Risk Level: Balanced</div>
                <div className="text-xs text-blue-600">Moderate risk, optimized for consistent yields</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Preference Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Yield Strategy Configuration
          </CardTitle>
          <CardDescription>Choose your preferred risk level and yield optimization approach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conservative */}
            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold text-blue-600">Conservative</div>
                <div className="text-sm text-gray-600">Low risk, stable returns</div>
                <div className="text-2xl font-bold text-blue-600">4-6%</div>
                <div className="text-xs text-gray-500">Expected APY</div>
                <div className="text-xs bg-blue-50 p-2 rounded text-blue-600">80% Stablecoins, 20% ETH</div>
              </div>
            </div>

            {/* Balanced - Currently Selected */}
            <div className="p-4 border-2 border-green-400 bg-green-50 rounded-lg">
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold text-green-600">Balanced ✓</div>
                <div className="text-sm text-gray-600">Moderate risk, optimal yield</div>
                <div className="text-2xl font-bold text-green-600">8-12%</div>
                <div className="text-xs text-gray-500">Expected APY</div>
                <div className="text-xs bg-green-100 p-2 rounded text-green-600">60% LP, 40% Lending</div>
              </div>
            </div>

            {/* Aggressive */}
            <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer">
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold text-purple-600">Aggressive</div>
                <div className="text-sm text-gray-600">High risk, maximum yield</div>
                <div className="text-2xl font-bold text-purple-600">15-25%</div>
                <div className="text-xs text-gray-500">Expected APY</div>
                <div className="text-xs bg-purple-50 p-2 rounded text-purple-600">80% Volatile LP, 20% DeFi</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="font-semibold text-yellow-700 mb-2">🚀 Yield Boost Available</div>
                <div className="text-sm text-yellow-600 mb-3">
                  Move 15% allocation to new ARB-USDC pool for +1.2% APY increase
                </div>
                <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Apply Optimization (+$8.5/month)
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="font-semibold text-blue-700 mb-2">⚡ Rebalance Opportunity</div>
                <div className="text-sm text-blue-600 mb-3">
                  Current ETH-USDC range is 90% out of range. Rebalance for +0.8% APY
                </div>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  Schedule Rebalance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Yield Performance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium">Best month: September</div>
                  <div className="text-sm text-gray-600">11.2% APY • $247.80 earned</div>
                </div>
                <Badge variant="outline" className="text-green-600">
                  +11.2%
                </Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium">30-day average</div>
                  <div className="text-sm text-gray-600">8.7% APY • $186.34 earned</div>
                </div>
                <Badge variant="outline" className="text-blue-600">
                  +8.7%
                </Badge>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700">vs Traditional Savings</div>
                <div className="text-xs text-gray-600">Earning 340x more than 0.25% savings account</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Complete Action */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-green-900">Yield Strategy Configured!</h3>
              <p className="text-green-700">Your idle balance is now earning optimized yields automatically</p>
            </div>
            <Button onClick={onSuccess} className="bg-green-600 hover:bg-green-700">
              Next: Set Your Preferences →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
