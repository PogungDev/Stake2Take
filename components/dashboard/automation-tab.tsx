"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, CreditCard, Gift, DollarSign, ArrowRight, CheckCircle, Zap } from "lucide-react"

interface AutomationTabProps {
  settings?: any
  onUpdateSettings?: (updates: any) => void
  onComplete?: () => void
  onNext?: () => void
}

export function AutomationTab({ settings, onUpdateSettings, onComplete, onNext }: AutomationTabProps) {
  const [autoTopUp, setAutoTopUp] = useState(settings?.autoTopUp ?? true)
  const [autoClaimRewards, setAutoClaimRewards] = useState(settings?.autoClaimRewards ?? true)
  const [autoRepayCredit, setAutoRepayCredit] = useState(settings?.autoRepayCredit ?? true)
  const [autoBridge, setAutoBridge] = useState(settings?.autoBridge ?? false)

  // Mock data for context
  const mockData = {
    currentCardBalance: 180,
    targetCardBalance: settings?.targetBalance || 300,
    emergencyBuffer: settings?.bufferAmount || 50,
    pendingRewards: 15.75,
    currentCreditUtilization: 70, // %
    monthlyYield: 55,
    crossChainOpportunity: "Arbitrum for lower gas fees",
  }

  const handleSaveAutomation = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        autoTopUp,
        autoClaimRewards,
        autoRepayCredit,
        autoBridge,
      })
    }
    if (onComplete) onComplete()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Smart Automation Preferences
          </CardTitle>
          <CardDescription>
            Enable or disable key automation features for your MetaMask Card and staked USDC.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Balance Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Auto Card Top-up
            </CardTitle>
            <CardDescription>Automatically top-up your MetaMask Card from your staked USDC vault.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto Top-up</Label>
                  <div className="text-xs text-gray-500">
                    Ensures your card always has sufficient balance base on your preferences.
                  </div>
                </div>
                <Switch checked={autoTopUp} onCheckedChange={setAutoTopUp} />
              </div>

              {autoTopUp && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700">
                    <strong>Current Status:</strong>
                    <br />
                    Card Balance: ${mockData.currentCardBalance} / ${mockData.targetCardBalance} target
                    <br />
                    Next top-up: When balance drops below ${mockData.targetCardBalance - mockData.emergencyBuffer}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rewards Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5" /> Auto Reward Claims
            </CardTitle>
            <CardDescription>Automatically claim and compound your DeFi protocol rewards.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto Claim</Label>
                  <div className="text-xs text-gray-500">
                    Claims rewards when gas costs are optimal and compounds them back into your vault.
                  </div>
                </div>
                <Switch checked={autoClaimRewards} onCheckedChange={setAutoClaimRewards} />
              </div>

              {autoClaimRewards && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-700">
                    <strong>Pending Rewards:</strong> ${mockData.pendingRewards}
                    <br />
                    Next claim: When rewards exceed $20 or gas is below 15 gwei
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credit Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Auto Credit Repay
            </CardTitle>
            <CardDescription>Automatically repay MetaMask Card credit from your yield earnings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto Repay</Label>
                  <div className="text-xs text-gray-500">
                    Uses monthly yield to automatically pay down credit balance and optimize credit utilization.
                  </div>
                </div>
                <Switch checked={autoRepayCredit} onCheckedChange={setAutoRepayCredit} />
              </div>

              {autoRepayCredit && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-700">
                    <strong>Credit Status:</strong>
                    <br />
                    Current Utilization: {mockData.currentCreditUtilization}%
                    <br />
                    Monthly Yield Available: ${mockData.monthlyYield}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cross-Chain Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" /> Cross-Chain Bridge
            </CardTitle>
            <CardDescription>Automatically bridge funds to chains with better yields or lower fees.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto Bridge</Label>
                  <div className="text-xs text-gray-500">
                    Moves funds across Base, Arbitrum, and Polygon for optimal gas costs and yields.
                  </div>
                </div>
                <Switch checked={autoBridge} onCheckedChange={setAutoBridge} />
              </div>

              {autoBridge && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-700">
                    <strong>Opportunity:</strong> {mockData.crossChainOpportunity}
                    <br />
                    Estimated savings: $5-15/month in gas fees
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Summary</CardTitle>
          <CardDescription>Review your Stake2Take automation preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-3 rounded-lg ${autoTopUp ? "bg-green-50" : "bg-gray-50"}`}>
              <CreditCard className={`w-6 h-6 mx-auto mb-2 ${autoTopUp ? "text-green-600" : "text-gray-400"}`} />
              <div className="text-sm font-medium">Card Top-up</div>
              <div className={`text-xs ${autoTopUp ? "text-green-600" : "text-gray-500"}`}>
                {autoTopUp ? "Enabled" : "Disabled"}
              </div>
            </div>

            <div className={`text-center p-3 rounded-lg ${autoClaimRewards ? "bg-green-50" : "bg-gray-50"}`}>
              <Gift className={`w-6 h-6 mx-auto mb-2 ${autoClaimRewards ? "text-green-600" : "text-gray-400"}`} />
              <div className="text-sm font-medium">Reward Claims</div>
              <div className={`text-xs ${autoClaimRewards ? "text-green-600" : "text-gray-500"}`}>
                {autoClaimRewards ? "Enabled" : "Disabled"}
              </div>
            </div>

            <div className={`text-center p-3 rounded-lg ${autoRepayCredit ? "bg-green-50" : "bg-gray-50"}`}>
              <DollarSign className={`w-6 h-6 mx-auto mb-2 ${autoRepayCredit ? "text-green-600" : "text-gray-400"}`} />
              <div className="text-sm font-medium">Credit Repay</div>
              <div className={`text-xs ${autoRepayCredit ? "text-green-600" : "text-gray-500"}`}>
                {autoRepayCredit ? "Enabled" : "Disabled"}
              </div>
            </div>

            <div className={`text-center p-3 rounded-lg ${autoBridge ? "bg-green-50" : "bg-gray-50"}`}>
              <Zap className={`w-6 h-6 mx-auto mb-2 ${autoBridge ? "text-green-600" : "text-gray-400"}`} />
              <div className="text-sm font-medium">Cross-Chain</div>
              <div className={`text-xs ${autoBridge ? "text-green-600" : "text-gray-500"}`}>
                {autoBridge ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings & Recommendations */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Recommendation:</strong> Enable all automation features for the best Stake2Take experience. You can
          always disable specific features later if needed.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Automation Configured!</h3>
              <p className="text-purple-700">
                Your Stake2Take agent will handle{" "}
                {[autoTopUp, autoClaimRewards, autoRepayCredit, autoBridge].filter(Boolean).length} automated tasks for
                you.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleSaveAutomation} className="bg-purple-600 hover:bg-purple-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Automation Settings
              </Button>
              {onNext && (
                <Button
                  onClick={onNext}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  Next: Configure Rewards
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
