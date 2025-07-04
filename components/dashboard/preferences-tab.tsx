"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Settings, CheckCircle, ArrowRight } from "lucide-react"
import type { AgentState } from "@/hooks/use-core-agent"

interface PreferencesTabProps {
  onComplete: () => void
  onNext: () => void
  agentState: AgentState
  updateAgentState: (updates: Partial<AgentState>) => void
}

export function PreferencesTab({ onComplete, onNext, agentState, updateAgentState }: PreferencesTabProps) {
  const [bridgingEnabled, setBridgingEnabled] = useState(agentState.bridgeChains.length > 0)

  const handleSave = () => {
    updateAgentState({
      bridgeChains: bridgingEnabled ? ["base", "arbitrum"] : [],
    })
    onComplete()
    onNext()
  }

  const isSetupComplete = () => {
    return (
      agentState.targetBalance > 0 &&
      agentState.vaultAllocation.aave + agentState.vaultAllocation.compound === 100 &&
      agentState.rewardCategories.length > 0 &&
      agentState.creditLimit > 0
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Setup Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Target Balance:</span>
                <Badge variant="outline">${agentState.targetBalance}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vault Strategy:</span>
                <Badge variant="outline">
                  {agentState.vaultAllocation.aave}%/{agentState.vaultAllocation.compound}%
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Reward Categories:</span>
                <Badge variant="outline">{agentState.rewardCategories.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Credit Limit:</span>
                <Badge variant="outline">${agentState.creditLimit}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Configuration */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Final Setup</CardTitle>
          <CardDescription className="text-lg">Enable advanced features and review your configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <h4 className="font-medium">Cross-Chain Bridging</h4>
              <p className="text-sm text-gray-600">Automatically bridge funds across chains for better yields</p>
            </div>
            <Switch checked={bridgingEnabled} onCheckedChange={setBridgingEnabled} />
          </div>

          {isSetupComplete() ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Setup Complete!</p>
                  <p className="text-sm text-green-700">
                    All configurations are ready. You can now activate your Smart Agent.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Setup Incomplete:</strong> Please complete all previous tabs before proceeding.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6 text-center">
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            disabled={!isSetupComplete()}
          >
            {isSetupComplete() ? "Complete Setup" : "Finish Previous Steps First"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-600 mt-3">
            {isSetupComplete() ? "Next: Activate Smart Agent" : "Complete all tabs to continue"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
