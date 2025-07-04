"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Wallet, TrendingUp, ArrowUp, ArrowDown, DollarSign, CreditCard } from "lucide-react"

export function BalanceTab() {
  const [currentBalance] = useState(245.67)
  const [targetBalance] = useState(500)
  const [monthlySpending] = useState(1250)
  const [avgTransaction] = useState(35.5)

  const balancePercentage = (currentBalance / targetBalance) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            MetaMask Card Balance Management
          </CardTitle>
          <CardDescription>
            Monitor your card balance and configure automatic top-ups from your staked USDC vault
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${currentBalance.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">+$12.50 today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Target Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${targetBalance.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">Auto top-up threshold</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${monthlySpending.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDown className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">-8% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${avgTransaction.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">Per transaction</div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Balance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current vs Target Balance</span>
              <Badge
                variant={balancePercentage < 50 ? "destructive" : balancePercentage < 80 ? "secondary" : "default"}
              >
                {balancePercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={balancePercentage} className="h-3" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${currentBalance.toFixed(2)}</span>
              <span>${targetBalance.toFixed(2)}</span>
            </div>
          </div>

          {balancePercentage < 50 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <CreditCard className="w-4 h-4" />
                <span className="font-medium">Low Balance Alert</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Your balance is below 50% of target. Consider enabling auto top-up or manually adding funds.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest MetaMask Card activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { merchant: "Starbucks", amount: -5.75, date: "Today, 2:30 PM", category: "Food & Dining" },
              { merchant: "Uber", amount: -18.5, date: "Today, 1:15 PM", category: "Transportation" },
              { merchant: "Auto Top-up", amount: +100.0, date: "Yesterday, 11:00 PM", category: "Top-up" },
              { merchant: "Netflix", amount: -15.99, date: "Yesterday, 6:45 PM", category: "Streaming" },
              { merchant: "Grocery Store", amount: -67.23, date: "Yesterday, 4:20 PM", category: "Groceries" },
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${transaction.amount > 0 ? "bg-green-500" : "bg-red-500"}`} />
                  <div>
                    <div className="font-medium">{transaction.merchant}</div>
                    <div className="text-sm text-gray-600">{transaction.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2">
              <DollarSign className="w-6 h-6" />
              <span>Manual Top-up</span>
              <span className="text-xs opacity-75">Add funds now</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <TrendingUp className="w-6 h-6" />
              <span>Set Auto Top-up</span>
              <span className="text-xs opacity-75">Configure automation</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <CreditCard className="w-6 h-6" />
              <span>View Full History</span>
              <span className="text-xs opacity-75">All transactions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
