"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CreditCard, AlertTriangle, Shield } from "lucide-react"
import { useSmartAgent } from "@/hooks/use-smart-agent"

export function SimpleCreditTab() {
  const { agentState, simulateCreditUsage, updateCreditLimit } = useSmartAgent()
  const [newLimit, setNewLimit] = useState(agentState.creditLimit)
  const [usageAmount, setUsageAmount] = useState(100)

  const utilization = (agentState.creditUsed / agentState.creditLimit) * 100
  const available = agentState.creditLimit - agentState.creditUsed

  const getUtilizationColor = (util: number) => {
    if (util >= 80) return "text-red-700 bg-red-50"
    if (util >= 60) return "text-yellow-700 bg-yellow-50"
    return "text-green-700 bg-green-50"
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Credit Management</h2>
        <p className="text-gray-600">Automated credit monitoring and repayment</p>
      </div>

      {/* Credit Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            Credit Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-700">${agentState.creditUsed}</div>
                <div className="text-sm text-blue-600">Used</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-700">${available}</div>
                <div className="text-sm text-green-600">Available</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-700">${agentState.creditLimit}</div>
                <div className="text-sm text-gray-600">Limit</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Credit Utilization</span>
                <Badge className={getUtilizationColor(utilization)}>{utilization.toFixed(1)}%</Badge>
              </div>
              <Progress value={utilization} className="h-3" />
            </div>

            {utilization >= 80 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">High utilization - Agent will auto-repay $100 soon</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Credit Limit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Update Credit Limit
          </CardTitle>
          <CardDescription>Agent monitors utilization and auto-repays when above 80%</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="limit">Credit Limit ($)</Label>
              <Input
                id="limit"
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(Number(e.target.value))}
                placeholder="500"
              />
            </div>
            <Button onClick={() => updateCreditLimit(newLimit)} className="bg-orange-600 hover:bg-orange-700">
              Update Limit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credit Usage Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage Simulation</CardTitle>
          <CardDescription>Test different spending scenarios to see agent responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="usage">Usage Amount ($)</Label>
              <Input
                id="usage"
                type="number"
                value={usageAmount}
                onChange={(e) => setUsageAmount(Number(e.target.value))}
                placeholder="100"
              />
            </div>
            <Button onClick={() => simulateCreditUsage(usageAmount)} className="bg-orange-600 hover:bg-orange-700">
              Simulate Usage
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[50, 150, 300].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => simulateCreditUsage(amount)}
                className="text-center"
              >
                Use ${amount}
              </Button>
            ))}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Auto-Repay:</strong> When utilization exceeds 80%, the agent automatically repays $100 to
              maintain healthy credit usage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
