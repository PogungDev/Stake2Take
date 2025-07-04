"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Shield, ArrowRight } from "lucide-react"
import type { AgentState } from "@/hooks/use-core-agent"

interface CreditTabProps {
  onComplete: () => void
  onNext: () => void
  agentState: AgentState
  updateAgentState: (updates: Partial<AgentState>) => void
  simulateCreditUsage: (amount: number) => void
}

export function CreditTab({ onComplete, onNext, agentState, updateAgentState }: CreditTabProps) {
  const [creditLimit, setCreditLimit] = useState(agentState.creditLimit)
  const [autoRepay, setAutoRepay] = useState(agentState.autoRepay)

  const handleSave = () => {
    updateAgentState({
      creditLimit,
      autoRepay,
    })
    onComplete()
    onNext()
  }

  const utilizationPercent = (agentState.creditUtilization / creditLimit) * 100
  const availableCredit = creditLimit - agentState.creditUtilization

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Status */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Credit Limit</p>
                <p className="text-2xl font-bold text-blue-800">${creditLimit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Used</p>
                <p className="text-2xl font-bold text-red-800">${agentState.creditUtilization}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-800">${availableCredit}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Credit Utilization</span>
                <Badge variant={utilizationPercent > 80 ? "destructive" : "default"}>
                  {utilizationPercent.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={utilizationPercent} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Configuration */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Set Credit Limit</CardTitle>
          <CardDescription className="text-lg">Configure emergency credit and automatic repayment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="credit-limit" className="text-lg font-medium">
                Credit Limit ($)
              </Label>
              <Input
                id="credit-limit"
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                placeholder="500"
                className="text-2xl h-14 text-center"
                min="100"
                max="2000"
              />
              <p className="text-center text-gray-600">Emergency credit for unexpected expenses</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-medium">Auto-Repayment</h4>
                  <p className="text-sm text-gray-600">Repay from vault when usage &gt; 80%</p>
                </div>
              </div>
              <Switch checked={autoRepay} onCheckedChange={setAutoRepay} />
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>How it works:</strong> When credit usage exceeds 80% (${(creditLimit * 0.8).toFixed(0)}), Smart
              Agent will automatically repay from your vault to keep credit healthy.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6 text-center">
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Set Credit Limit ${creditLimit} {autoRepay && "(Auto-Repay ON)"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-600 mt-3">Next: Final setup</p>
        </CardContent>
      </Card>
    </div>
  )
}
