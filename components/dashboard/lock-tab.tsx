"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, DollarSign, Calendar, Shield, TrendingUp, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react"

interface LockTabProps {
  settings?: any
  onUpdateSettings?: (updates: any) => void
  onComplete?: () => void
  onNext?: () => void
}

export function LockTab({ settings, onUpdateSettings, onComplete, onNext }: LockTabProps) {
  const [stakeAmount, setStakeAmount] = useState(settings?.stakeAmount || 1000)
  const [stakeDuration, setStakeDuration] = useState(settings?.stakeDuration || 30)
  const [targetBalance, setTargetBalance] = useState(settings?.targetBalance || 300)
  const [bufferAmount, setBufferAmount] = useState(settings?.bufferAmount || 50)
  const [isStaking, setIsStaking] = useState(false)

  // Calculate APY based on stake duration
  const calculateAPY = (days: number) => {
    if (days < 7) return 4.5
    if (days < 30) return 6.2
    if (days < 90) return 8.5
    if (days < 180) return 10.1
    return 12.3
  }

  const currentAPY = calculateAPY(stakeDuration)
  const dailyEarnings = (stakeAmount * currentAPY) / 100 / 365
  const totalEarnings = dailyEarnings * stakeDuration

  const handleStakeFunds = async () => {
    setIsStaking(true)

    // Simulate staking process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    if (onUpdateSettings) {
      onUpdateSettings({
        stakeAmount,
        stakeDuration,
        targetBalance,
        bufferAmount,
      })
    }

    setIsStaking(false)
    if (onComplete) onComplete()
  }

  const isValidAmount = stakeAmount >= 100 && stakeAmount <= 100000
  const isValidDuration = stakeDuration >= 7 && stakeDuration <= 365
  const isValidBalance = targetBalance >= 50 && targetBalance <= stakeAmount * 0.5
  const canProceed = isValidAmount && isValidDuration && isValidBalance

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange-600" />
            Stake Your USDC
          </CardTitle>
          <CardDescription>
            Stake your USDC to start earning yield while maintaining access for MetaMask Card top-ups
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stake Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stake Settings</CardTitle>
            <CardDescription>Configure your USDC stake parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="stakeAmount">Stake Amount (USDC)</Label>
              <Input
                id="stakeAmount"
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                placeholder="1000"
                min="100"
                max="100000"
              />
              <div className="text-xs text-gray-500">Minimum: $100, Maximum: $100,000</div>
              {!isValidAmount && stakeAmount > 0 && (
                <div className="text-xs text-red-500">Amount must be between $100 and $100,000</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stakeDuration">Stake Duration (Days)</Label>
              <Input
                id="stakeDuration"
                type="number"
                value={stakeDuration}
                onChange={(e) => setStakeDuration(Number(e.target.value))}
                placeholder="30"
                min="7"
                max="365"
              />
              <div className="text-xs text-gray-500">Minimum: 7 days, Maximum: 365 days</div>
              {!isValidDuration && stakeDuration > 0 && (
                <div className="text-xs text-red-500">Duration must be between 7 and 365 days</div>
              )}
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Expected Returns</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">APY:</span>
                  <span className="font-medium text-blue-800">{currentAPY.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Daily Earnings:</span>
                  <span className="font-medium text-blue-800">${dailyEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Earnings:</span>
                  <span className="font-medium text-blue-800">${totalEarnings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Card Management</CardTitle>
            <CardDescription>Configure MetaMask Card balance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetBalance">Target Card Balance ($)</Label>
              <Input
                id="targetBalance"
                type="number"
                value={targetBalance}
                onChange={(e) => setTargetBalance(Number(e.target.value))}
                placeholder="300"
                min="50"
                max={stakeAmount * 0.5}
              />
              <div className="text-xs text-gray-500">Ideal balance to maintain on your card</div>
              {!isValidBalance && targetBalance > 0 && (
                <div className="text-xs text-red-500">
                  Balance must be between $50 and ${(stakeAmount * 0.5).toFixed(0)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bufferAmount">Emergency Buffer ($)</Label>
              <Input
                id="bufferAmount"
                type="number"
                value={bufferAmount}
                onChange={(e) => setBufferAmount(Number(e.target.value))}
                placeholder="50"
                min="25"
                max="200"
              />
              <div className="text-xs text-gray-500">Extra amount for unexpected expenses</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Auto Top-up Logic</span>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                <div>• Monitor card balance every hour</div>
                <div>• Top-up when balance drops below ${targetBalance - bufferAmount}</div>
                <div>
                  • Maintain ${targetBalance} + ${bufferAmount} buffer
                </div>
                <div>• Use staked funds yield for top-ups</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stake Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Stake Summary</CardTitle>
          <CardDescription>Review your Stake2Take configuration before proceeding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">${stakeAmount.toLocaleString()}</div>
              <div className="text-sm text-orange-700">Stake Amount</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stakeDuration}</div>
              <div className="text-sm text-blue-700">Days Staked</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{currentAPY.toFixed(1)}%</div>
              <div className="text-sm text-green-700">Expected APY</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">${targetBalance}</div>
              <div className="text-sm text-purple-700">Card Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation & Action */}
      <Card>
        <CardContent className="p-6">
          {!canProceed ? (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please correct the validation errors above before proceeding with the stake.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Configuration looks good! Ready to stake your USDC and start earning.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ready to Stake Your USDC?</h3>
              <p className="text-gray-600">
                Your funds will be staked for {stakeDuration} days and start earning {currentAPY.toFixed(1)}% APY
                immediately.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleStakeFunds}
                disabled={!canProceed || isStaking}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isStaking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Staking USDC...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Stake ${stakeAmount.toLocaleString()} USDC
                  </>
                )}
              </Button>

              {onNext && (
                <Button
                  onClick={onNext}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 bg-transparent"
                >
                  Next: Configure Earning
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
