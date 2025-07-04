"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, CheckCircle, AlertTriangle, TrendingUp, DollarSign, Zap } from "lucide-react"

interface ReviewTabProps {
  state: any
  onSave: (data: any) => void
  appState: any
}

export function ReviewTab({ state, onSave, appState }: ReviewTabProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSave({ ...state, completed: true })
    setIsLoading(false)
  }

  // Calculate configuration completeness
  const configSections = [
    { name: "Balance", completed: appState.balance?.completed || false },
    { name: "Vault", completed: appState.vault?.completed || false },
    { name: "Rewards", completed: appState.rewards?.completed || false },
    { name: "Credit", completed: appState.credit?.completed || false },
    { name: "Preferences", completed: appState.preferences?.completed || false },
  ]

  const completedSections = configSections.filter((section) => section.completed).length
  const completionPercentage = (completedSections / configSections.length) * 100

  // Calculate projected earnings
  const vaultDeposit = appState.vault?.totalDeposited || 2500
  const avgAPY = 5.2 // Weighted average
  const monthlyYield = (vaultDeposit * avgAPY) / 100 / 12
  const yearlyYield = vaultDeposit * (avgAPY / 100)

  const cashbackCategories = appState.rewards?.selectedCategories?.length || 3
  const avgCashback = cashbackCategories * 15 // $15 per category per month
  const yearlyCashback = avgCashback * 12

  const totalProjectedEarnings = yearlyYield + yearlyCashback

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Configuration Review</CardTitle>
              <CardDescription>
                Review your Smart Agent configuration and projected performance before activation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Completion</span>
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completionPercentage.toFixed(0)}% Complete
              </Badge>
            </div>

            <div className="space-y-2">
              {configSections.map((section) => (
                <div key={section.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {section.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium">{section.name} Configuration</span>
                  </div>
                  <Badge variant={section.completed ? "default" : "secondary"}>
                    {section.completed ? "Complete" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>

            {completionPercentage < 100 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Complete all configuration sections for optimal Smart Agent performance.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projected Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Projected Performance
          </CardTitle>
          <CardDescription>Estimated earnings and optimization potential</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">${monthlyYield.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Monthly Vault Yield</div>
              <div className="text-xs text-muted-foreground">{avgAPY}% APY</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">${avgCashback.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Monthly Cashback</div>
              <div className="text-xs text-muted-foreground">{cashbackCategories} categories</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">${totalProjectedEarnings.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Yearly Earnings</div>
              <div className="text-xs text-muted-foreground">Vault + Cashback</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Agent Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Smart Agent Features
          </CardTitle>
          <CardDescription>Automation features that will be active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Active Automations</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Auto Card Top-ups</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Vault Rebalancing</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Cashback Auto-Claim</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Credit Auto-Repayment</span>
                </div>
                {appState.preferences?.bridgingEnabled && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Cross-Chain Bridging</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Monitoring Frequency</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Agent Loop</span>
                  <Badge variant="outline">Every 5 seconds</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">APY Updates</span>
                  <Badge variant="outline">Real-time</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Balance Checks</span>
                  <Badge variant="outline">Continuous</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Risk Assessment</span>
                  <Badge variant="outline">Per transaction</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Balance Management</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Target Balance:</span>
                  <span>${appState.balance?.targetBalance || 500}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Buffer:</span>
                  <span>${appState.balance?.emergencyBuffer || 100}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto Top-up:</span>
                  <span>{appState.balance?.autoTopUp ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Vault Strategy</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Total Deposited:</span>
                  <span>${appState.vault?.totalDeposited || 2500}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Level:</span>
                  <span className="capitalize">{appState.vault?.riskLevel || "moderate"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Rebalancing:</span>
                  <span>Enabled</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Rewards & Credit</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Cashback Categories:</span>
                  <span>{appState.rewards?.selectedCategories?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto-Claim:</span>
                  <span>{appState.rewards?.autoClaimEnabled ? "Enabled" : "Disabled"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Limit:</span>
                  <span>${appState.credit?.creditLimit || 1000}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Automation</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Risk Tolerance:</span>
                  <span className="capitalize">{appState.preferences?.riskTolerance || "moderate"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Automation Level:</span>
                  <span className="capitalize">{appState.preferences?.automationLevel || "balanced"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cross-Chain:</span>
                  <span>{appState.preferences?.bridgingEnabled ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Activate</CardTitle>
          <CardDescription>Your Smart Agent configuration is ready for deployment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completionPercentage === 100 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ All configurations complete! Your Smart Agent is ready to activate and start optimizing your DeFi
                  strategy.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  ⚠️ Complete remaining configurations before activating your Smart Agent for optimal performance.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Confirm Configuration"}
              </Button>
              <Button variant="outline">Export Config</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
