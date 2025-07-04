"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Play, Pause, Activity, CheckCircle, ArrowRight } from "lucide-react"
import type { AgentState } from "@/hooks/use-core-agent"

interface AgentTabProps {
  onComplete: () => void
  onNext: () => void
  agentState: AgentState
  updateAgentState: (updates: Partial<AgentState>) => void
}

export function AgentTab({ onComplete, onNext, agentState, updateAgentState }: AgentTabProps) {
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleAgent = async () => {
    setIsToggling(true)

    // Simulate activation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    updateAgentState({
      isActive: !agentState.isActive,
    })

    if (!agentState.isActive) {
      onComplete()
    }

    setIsToggling(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Agent Status */}
      <Card
        className={`${
          agentState.isActive
            ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
            : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  agentState.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              >
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Smart Agent {agentState.isActive ? "Active" : "Inactive"}</h3>
                <p className="text-gray-600">
                  {agentState.isActive
                    ? "Monitoring and optimizing every 5 seconds"
                    : "Ready to start automated management"}
                </p>
              </div>
            </div>
            <Badge
              variant={agentState.isActive ? "default" : "outline"}
              className={`text-lg px-4 py-2 ${agentState.isActive ? "animate-pulse" : ""}`}
            >
              {agentState.isActive ? (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Running
                </>
              ) : (
                "Standby"
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* What Agent Does */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Your Smart Agent</CardTitle>
          <CardDescription className="text-lg">Automated financial management for your MetaMask Card</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {[
              "Monitors balance and auto top-ups when needed",
              "Rebalances vault between Aave/Compound for best APY",
              "Claims cashback rewards and reinvests automatically",
              "Manages credit usage and triggers repayments",
              "Bridges funds across chains for optimal yields",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Runs every 5 seconds</strong> when active, making smart decisions based on your preferences and
              market conditions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6 text-center">
          <Button
            onClick={handleToggleAgent}
            disabled={isToggling}
            size="lg"
            className={`w-full h-16 text-xl ${
              agentState.isActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            }`}
          >
            {isToggling ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                {agentState.isActive ? "Stopping..." : "Starting..."}
              </>
            ) : (
              <>
                {agentState.isActive ? (
                  <>
                    <Pause className="w-6 h-6 mr-3" />
                    Stop Smart Agent
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-3" />
                    Start Smart Agent
                  </>
                )}
              </>
            )}
          </Button>

          {agentState.isActive && (
            <div className="mt-4">
              <Button onClick={onNext} variant="outline" size="lg">
                <Activity className="w-5 h-5 mr-2" />
                View Live Activity
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          <p className="text-sm text-gray-600 mt-3">
            {agentState.isActive ? "Agent is actively managing your finances" : "Click to start automated management"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
