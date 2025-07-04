"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Target, DollarSign, AlertTriangle, CheckCircle } from "lucide-react"
import { useSmartAgent } from "@/hooks/use-smart-agent"
import { useToast } from "@/hooks/use-toast"

interface GoalsTabProps {
  onComplete?: () => void
}

export function GoalsTab({ onComplete }: GoalsTabProps) {
  const { agentState, simulateSpending, updateTargetBalance } = useSmartAgent()
  const { toast } = useToast()
  const [newTarget, setNewTarget] = useState(agentState.targetBalance)
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false)
  const [isSimulating, setIsSimulating] = useState<number | null>(null)

  const handleUpdateTarget = async () => {
    if (newTarget <= 0) {
      toast({
        title: "Invalid Target",
        description: "Target balance must be greater than $0",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingTarget(true)
    
    try {
      updateTargetBalance(newTarget)
      toast({
        title: "Target Updated",
        description: `Target balance updated to $${newTarget}`,
      })
      onComplete?.() // Mark tab as completed
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update target balance",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsUpdatingTarget(false)
      }, 1000)
    }
  }

  const handleSimulateSpending = async (amount: number, category: string, index: number) => {
    setIsSimulating(index)
    
    try {
      simulateSpending(amount, category)
      toast({
        title: "Spending Simulated",
        description: `$${amount} ${category} transaction processed`,
      })
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Failed to simulate spending",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsSimulating(null)
      }, 1500)
    }
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
            <div className={`text-center p-4 rounded-lg transition-all duration-500 ${
              agentState.balance >= agentState.targetBalance 
                ? 'bg-green-100 ring-2 ring-green-300' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className={`text-2xl font-bold ${
                agentState.balance >= agentState.targetBalance ? 'text-green-700' : 'text-yellow-700'
              }`}>
                ${agentState.balance}
              </div>
              <div className={`text-sm ${
                agentState.balance >= agentState.targetBalance ? 'text-green-600' : 'text-yellow-600'
              }`}>
                Current Balance
              </div>
              {agentState.balance >= agentState.targetBalance && (
                <div className="text-xs text-green-500 mt-1">🎯 Target Reached!</div>
              )}
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">${agentState.targetBalance}</div>
              <div className="text-sm text-orange-600">Target Balance</div>
              <div className="text-xs text-orange-500 mt-1">💡 Auto top-up trigger</div>
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
            <Button 
              onClick={handleUpdateTarget} 
              disabled={isUpdatingTarget || newTarget <= 0}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
            >
              <CheckCircle className={`w-4 h-4 mr-2 ${isUpdatingTarget ? 'animate-spin' : ''}`} />
              {isUpdatingTarget ? 'Updating...' : 'Update Target'}
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
                  onClick={() => handleSimulateSpending(scenario.amount, scenario.category, index)}
                  disabled={isSimulating === index}
                  className="w-full disabled:opacity-50"
                >
                  <DollarSign className={`w-4 h-4 mr-2 ${isSimulating === index ? 'animate-pulse' : ''}`} />
                  {isSimulating === index ? 'Processing...' : 'Simulate Spending'}
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
