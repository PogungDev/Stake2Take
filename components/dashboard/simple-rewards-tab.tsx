"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Gift, CreditCard, Zap } from "lucide-react"
import { useSmartAgent } from "@/hooks/use-smart-agent"

export function SimpleRewardsTab() {
  const { agentState, simulateCashback } = useSmartAgent()
  const [selectedMerchant, setSelectedMerchant] = useState("Spotify")
  const [transactionAmount, setTransactionAmount] = useState(15)

  const merchants = [
    { name: "Spotify", category: "Entertainment", rate: 2 },
    { name: "Netflix", category: "Entertainment", rate: 2 },
    { name: "Amazon", category: "Shopping", rate: 1.5 },
    { name: "Starbucks", category: "Food", rate: 3 },
    { name: "Uber", category: "Transport", rate: 2.5 },
  ]

  const selectedMerchantData = merchants.find((m) => m.name === selectedMerchant)
  const expectedCashback = (transactionAmount * (selectedMerchantData?.rate || 2)) / 100

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
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-700">${agentState.cashbackPending.toFixed(2)}</div>
            <div className="text-sm text-green-600 mt-1">Available to Claim</div>
            {agentState.cashbackPending >= 10 && (
              <Badge className="mt-2 bg-green-100 text-green-700">
                <Zap className="w-3 h-3 mr-1" />
                Auto-claim Ready
              </Badge>
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
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{merchant.name}</div>
                  <div className="text-sm text-gray-600">{merchant.category}</div>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
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

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-700">
                Expected Cashback: ${expectedCashback.toFixed(2)}
              </div>
              <div className="text-sm text-orange-600">
                {selectedMerchantData?.rate}% back on ${transactionAmount} at {selectedMerchant}
              </div>
            </div>
          </div>

          <Button
            onClick={() => simulateCashback(selectedMerchant, transactionAmount)}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            Simulate Transaction
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
