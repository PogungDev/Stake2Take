"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Gift, CreditCard, Zap, ShoppingCart } from "lucide-react"
import { useSmartAgent } from "@/hooks/use-smart-agent"
import { useToast } from "@/hooks/use-toast"

interface SimpleRewardsTabProps {
  onComplete?: () => void
}

export function SimpleRewardsTab({ onComplete }: SimpleRewardsTabProps) {
  const { agentState, simulateCashback } = useSmartAgent()
  const { toast } = useToast()
  const [selectedMerchant, setSelectedMerchant] = useState("Spotify")
  const [transactionAmount, setTransactionAmount] = useState(15)
  const [isSimulating, setIsSimulating] = useState(false)
  const [lastCashback, setLastCashback] = useState(agentState.cashbackPending)

  const merchants = [
    { name: "Spotify", category: "Entertainment", rate: 2 },
    { name: "Netflix", category: "Entertainment", rate: 2 },
    { name: "Amazon", category: "Shopping", rate: 1.5 },
    { name: "Starbucks", category: "Food", rate: 3 },
    { name: "Uber", category: "Transport", rate: 2.5 },
  ]

  const selectedMerchantData = merchants.find((m) => m.name === selectedMerchant)
  const expectedCashback = (transactionAmount * (selectedMerchantData?.rate || 2)) / 100

  // Track cashback changes for visual feedback
  useEffect(() => {
    if (agentState.cashbackPending > lastCashback) {
      const earnedAmount = agentState.cashbackPending - lastCashback
      toast({
        title: "🎉 Cashback Earned!",
        description: `You earned $${earnedAmount.toFixed(2)} cashback`,
      })
    }
    setLastCashback(agentState.cashbackPending)
  }, [agentState.cashbackPending, lastCashback, toast])

  const handleSimulateTransaction = async () => {
    if (!selectedMerchantData || transactionAmount <= 0) {
      toast({
        title: "Invalid Transaction",
        description: "Please enter a valid amount greater than $0",
        variant: "destructive",
      })
      return
    }

    setIsSimulating(true)
    
    try {
      // Simulate the transaction
      simulateCashback(selectedMerchant, transactionAmount)
      
      toast({
        title: "Transaction Simulated",
        description: `$${transactionAmount} transaction at ${selectedMerchant} processed`,
      })
      
      onComplete?.() // Mark tab as completed
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Something went wrong during transaction simulation",
        variant: "destructive",
      })
    } finally {
      // Add small delay for better UX
      setTimeout(() => {
        setIsSimulating(false)
      }, 1500)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Cashback Rewards</h2>
        <p className="text-gray-600">Automated cashback optimization and claiming</p>
      </div>

      {/* Current Cashback Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-orange-600" />
            Pending Cashback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-center p-6 rounded-lg transition-all duration-500 ${
            agentState.cashbackPending >= 10 
              ? 'bg-green-100 ring-2 ring-green-300' 
              : 'bg-green-50'
          }`}>
            <div className={`text-3xl font-bold text-green-700 transition-all duration-300 ${
              agentState.cashbackPending > lastCashback ? 'animate-pulse' : ''
            }`}>
              ${agentState.cashbackPending.toFixed(2)}
            </div>
            <div className="text-sm text-green-600 mt-1">Available to Claim</div>
            {agentState.cashbackPending >= 10 && (
              <Badge className="mt-2 bg-green-100 text-green-700 animate-bounce">
                <Zap className="w-3 h-3 mr-1" />
                Auto-claim Ready
              </Badge>
            )}
            {agentState.cashbackPending < 10 && (
              <div className="text-xs text-green-500 mt-2">
                ${(10 - agentState.cashbackPending).toFixed(2)} more to auto-claim
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">💡 Agent auto-claims cashback when balance reaches $10.00</p>
          </div>
        </CardContent>
      </Card>

      {/* Cashback Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Cashback Categories</CardTitle>
          <CardDescription>Different merchants offer varying cashback rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {merchants.map((merchant, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  merchant.name === selectedMerchant 
                    ? 'bg-orange-50 ring-2 ring-orange-200 border border-orange-300' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedMerchant(merchant.name)}
              >
                <div>
                  <div className={`font-medium ${
                    merchant.name === selectedMerchant ? 'text-orange-700' : 'text-gray-900'
                  }`}>
                    {merchant.name}
                    {merchant.name === selectedMerchant && (
                      <span className="ml-2 text-orange-600">✓</span>
                    )}
                  </div>
                  <div className={`text-sm ${
                    merchant.name === selectedMerchant ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {merchant.category}
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    merchant.name === selectedMerchant 
                      ? 'bg-orange-100 text-orange-700 border-orange-300' 
                      : 'bg-orange-50 text-orange-700'
                  }
                >
                  {merchant.rate}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            Simulate Transaction
          </CardTitle>
          <CardDescription>Test cashback earning from different merchants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="merchant">Merchant</Label>
              <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {merchants.map((merchant) => (
                    <SelectItem key={merchant.name} value={merchant.name}>
                      {merchant.name} ({merchant.rate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Transaction Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(Number(e.target.value))}
                placeholder="15"
              />
            </div>
          </div>

          <div className={`p-4 rounded-lg transition-all duration-300 ${
            expectedCashback > 0 
              ? 'bg-orange-50 border border-orange-200' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                expectedCashback > 0 ? 'text-orange-700' : 'text-gray-500'
              }`}>
                Expected Cashback: ${expectedCashback.toFixed(2)}
              </div>
              <div className={`text-sm ${
                expectedCashback > 0 ? 'text-orange-600' : 'text-gray-400'
              }`}>
                {selectedMerchantData?.rate}% back on ${transactionAmount} at {selectedMerchant}
              </div>
              {expectedCashback > 0 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">
                    Ready to earn!
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSimulateTransaction}
            disabled={isSimulating || transactionAmount <= 0}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
            size="lg"
          >
            <ShoppingCart className={`w-4 h-4 mr-2 ${isSimulating ? 'animate-pulse' : ''}`} />
            {isSimulating ? 'Processing...' : 'Simulate Transaction'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
