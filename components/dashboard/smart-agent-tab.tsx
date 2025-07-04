"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Play, Pause, BarChart3, Zap, CheckCircle, Clock } from "lucide-react"
import { useSmartAgent } from "@/hooks/use-smart-agent"

interface SmartAgentTabProps {
  state: any
  onSave: (data: any) => void
  appState: any
  connectedAddress: string
}

export function SmartAgentTab({ state, onSave, appState, connectedAddress }: SmartAgentTabProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { agentState, activateAgent, deactivateAgent, clearLogs } = useSmartAgent()

  const handleActivate = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    activateAgent()
    onSave({ ...state, activated: true, activatedAt: new Date().toISOString() })
    setIsLoading(false)
  }

  const handleDeactivate = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    deactivateAgent()
    onSave({ ...state, activated: false })
    setIsLoading(false)
  }

  const recentLogs = agentState.logs.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Smart Agent Control Center</CardTitle>
              <CardDescription>
                Activate and monitor your Smart Agent for automated DeFi optimization with 5-second monitoring loops.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {agentState.isActive ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    Active
                  </div>
                ) : (
                  "Inactive"
                )}
              </div>
              <div className="text-sm text-gray-600">Current Status</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{agentState.stats.totalActions}</div>
              <div className="text-sm text-gray-600">Total Actions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{agentState.stats.successfulActions}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">${agentState.stats.totalSaved.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Optimized</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">Last Action</div>
              <div className="text-sm text-muted-foreground">{agentState.stats.lastAction}</div>
            </div>
            <Badge variant={agentState.isRunning ? "default" : "secondary"}>
              {agentState.isRunning ? "Running" : "Stopped"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Agent Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Agent Controls
          </CardTitle>
          <CardDescription>Start, stop, and configure your Smart Agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {!agentState.isActive ? (
              <Button onClick={handleActivate} disabled={isLoading} className="flex-1" size="lg">
                <Play className="h-4 w-4 mr-2" />
                {isLoading ? "Activating..." : "Activate Smart Agent"}
              </Button>
            ) : (
              <Button
                onClick={handleDeactivate}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                <Pause className="h-4 w-4 mr-2" />
                {isLoading ? "Deactivating..." : "Deactivate Agent"}
              </Button>
            )}
            <Button onClick={clearLogs} variant="outline" size="lg">
              Clear Logs
            </Button>
          </div>

          {agentState.isActive && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🚀 Smart Agent is active and monitoring your positions every 5 seconds. All automations are running.
              </AlertDescription>
            </Alert>
          )}

          {!agentState.isActive && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                ⏸️ Smart Agent is inactive. Click "Activate" to start automated optimization and monitoring.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Live Activity Feed
            {agentState.isActive && (
              <Badge variant="outline" className="animate-pulse">
                Live
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Real-time Smart Agent actions and optimizations</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Activate the Smart Agent to see live actions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl">{log.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {log.type}
                      </Badge>
                      <Badge variant={log.status === "success" ? "default" : "secondary"} className="text-xs">
                        {log.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{log.description}</p>
                    {log.amount && <p className="text-xs text-green-600 mt-1">Amount: ${log.amount.toFixed(2)} USDC</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {agentState.logs.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All Logs ({agentState.logs.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>Current Smart Agent settings and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Active Monitoring</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Card Balance (Every 5s)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Vault APY Tracking (Real-time)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Credit Utilization (Every 5s)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cashback Accumulation (Every 5s)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cross-Chain Opportunities (Every 5s)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Automation Triggers</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Balance Top-up</span>
                  <Badge variant="outline">{"< $100"}</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Vault Rebalance</span>
                  <Badge variant="outline">APY Δ {">"} 1.5%</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Cashback Claim</span>
                  <Badge variant="outline">{">"} $10</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Credit Repay</span>
                  <Badge variant="outline">{">"} 80% util</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Cross-Chain Bridge</span>
                  <Badge variant="outline">Yield opportunity</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {agentState.stats.totalActions > 0
                  ? ((agentState.stats.successfulActions / agentState.stats.totalActions) * 100).toFixed(1)
                  : "0"}
                %
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {agentState.stats.totalActions > 0
                  ? (agentState.stats.totalSaved / agentState.stats.totalActions).toFixed(2)
                  : "0"}
              </div>
              <div className="text-sm text-gray-600">Avg Optimization</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">5s</div>
              <div className="text-sm text-gray-600">Monitoring Interval</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
