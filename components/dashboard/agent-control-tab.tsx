"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bot, Play, Square, Activity, Settings, CheckCircle } from "lucide-react"
import { useSmartAgent } from "@/hooks/use-smart-agent"

export function AgentControlTab() {
  const { agentState, activateAgent, deactivateAgent } = useSmartAgent()

  const agentSettings = [
    { label: "Target Balance", value: `$${agentState.targetBalance}`, status: "configured" },
    {
      label: "Vault Allocation",
      value: `${agentState.vaultAave}% Aave / ${agentState.vaultCompound}% Compound`,
      status: "configured",
    },
    { label: "Auto-Claim Threshold", value: "$10.00", status: "configured" },
    { label: "Credit Auto-Repay", value: "80% utilization", status: "configured" },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Smart Agent Control</h2>
        <p className="text-gray-600">Activate and monitor your AI-powered automation</p>
      </div>

      {/* Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-600" />
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                agentState.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${agentState.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
              />
              {agentState.isActive ? "Active - Monitoring Every 5s" : "Inactive"}
            </div>

            <div className="flex justify-center gap-4">
              {!agentState.isActive ? (
                <Button onClick={activateAgent} className="bg-green-600 hover:bg-green-700" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Activate Agent
                </Button>
              ) : (
                <Button onClick={deactivateAgent} variant="destructive" size="lg">
                  <Square className="w-4 h-4 mr-2" />
                  Deactivate Agent
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-600" />
            Configuration Summary
          </CardTitle>
          <CardDescription>Current agent settings and monitoring parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentSettings.map((setting, index) => (
              <div key={index}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{setting.label}</div>
                    <div className="text-sm text-gray-600">{setting.value}</div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {setting.status}
                  </Badge>
                </div>
                {index < agentSettings.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Monitoring Activities
          </CardTitle>
          <CardDescription>What the agent checks every 5 seconds when active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">💰 Balance Monitoring</h4>
              <p className="text-sm text-gray-600">Auto top-up when balance falls below ${agentState.targetBalance}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">🔄 Vault Rebalancing</h4>
              <p className="text-sm text-gray-600">Rebalance when APY difference exceeds 1.5%</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">🎁 Cashback Claims</h4>
              <p className="text-sm text-gray-600">Auto-claim when pending rewards reach $10</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">💳 Credit Management</h4>
              <p className="text-sm text-gray-600">Auto-repay when utilization exceeds 80%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {agentState.isActive && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Activity className="w-5 h-5" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-700">24/7</div>
                <div className="text-sm text-green-600">Monitoring</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700">5s</div>
                <div className="text-sm text-blue-600">Check Interval</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700">100%</div>
                <div className="text-sm text-purple-600">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
