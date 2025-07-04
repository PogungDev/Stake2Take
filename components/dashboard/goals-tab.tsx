"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Target, DollarSign, AlertTriangle } from "lucide-react"
import { useSmartAgent } from "@/hooks/use-smart-agent"

export function GoalsTab() {
  const { agentState, simulateSpending, updateTargetBalance } = useSmartAgent()
  const [newTarget, setNewTarget] = useState(agentState.targetBalance)

  const handleUpdateTarget = () => {
    updateTargetBalance(newTarget)
  }

  const spendingScenarios = [
    { amount: 180, category: "Emergency", color: "bg-red-100 text-red-700" },
    { amount: 75, category: "Groceries", color: "bg-blue-100 text-blue-700" },
    { amount: 120, category: "Gas", color: "bg-green-100 text-green-700" },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Balance Goals</h2>
        <p className="text-gray-600">Set your target balance and simulate spending scenarios</p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">${agentState.balance}</div>
              <div className="text-sm text-green-600">Current Balance</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">${agentState.targetBalance}</div>
              <div className="text-sm text-orange-600">Target Balance</div>
            </div>
          </div>

          {agentState.balance < agentState.targetBalance && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Balance is ${agentState.targetBalance - agentState.balance} below target
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Target Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            Update Target Balance
          </CardTitle>
          <CardDescription>Agent will auto top-up when balance falls below this amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="target">Target Balance ($)</Label>
              <Input
                id="target"
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(Number(e.target.value))}
                placeholder="300"
              />
            </div>
            <Button onClick={handleUpdateTarget} className="bg-orange-600 hover:bg-orange-700">
              Update Target
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spending Simulations */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Simulations</CardTitle>
          <CardDescription>Test different spending scenarios to see agent responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spendingScenarios.map((scenario, index) => (
              <div key={index} className="text-center space-y-3">
                <Badge className={scenario.color}>{scenario.category}</Badge>
                <div className="text-lg font-semibold">-${scenario.amount}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateSpending(scenario.amount, scenario.category)}
                  className="w-full"
                >
                  Simulate Spending
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> When balance drops below target, the agent will automatically trigger a top-up
              within 5 seconds if activated.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
