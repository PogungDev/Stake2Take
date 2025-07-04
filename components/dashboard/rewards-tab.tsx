"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Gift, Music, Coffee, ShoppingCart, Car, Gamepad2, Utensils, ArrowRight } from "lucide-react"
import type { AgentState } from "@/hooks/use-core-agent"

interface RewardsTabProps {
  onComplete: () => void
  onNext: () => void
  agentState: AgentState
  updateAgentState: (updates: Partial<AgentState>) => void
  simulateCashback: (merchant: string, amount: number) => void
}

const rewardCategories = [
  { id: "streaming", label: "Streaming", icon: Music, cashback: 2.0 },
  { id: "food", label: "Food & Dining", icon: Utensils, cashback: 3.0 },
  { id: "shopping", label: "Shopping", icon: ShoppingCart, cashback: 1.5 },
  { id: "gas", label: "Gas & Fuel", icon: Car, cashback: 2.5 },
  { id: "gaming", label: "Gaming", icon: Gamepad2, cashback: 2.0 },
  { id: "coffee", label: "Coffee", icon: Coffee, cashback: 4.0 },
]

export function RewardsTab({ onComplete, onNext, agentState, updateAgentState }: RewardsTabProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(agentState.rewardCategories)

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSave = () => {
    updateAgentState({ rewardCategories: selectedCategories })
    onComplete()
    onNext()
  }

  const averageCashback =
    selectedCategories.length > 0
      ? rewardCategories
          .filter((cat) => selectedCategories.includes(cat.id))
          .reduce((sum, cat) => sum + cat.cashback, 0) / selectedCategories.length
      : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Status */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Pending Cashback</p>
              <p className="text-2xl font-bold text-pink-800">${agentState.pendingCashback.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Categories Selected</p>
              <p className="text-2xl font-bold text-purple-800">{selectedCategories.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Cashback</p>
              <p className="text-2xl font-bold text-green-800">{averageCashback.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Configuration */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Choose Cashback Categories</CardTitle>
          <CardDescription className="text-lg">
            Select spending categories to earn automatic cashback rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {rewardCategories.map((category) => {
              const IconComponent = category.icon
              const isSelected = selectedCategories.includes(category.id)

              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-md"
                      : "hover:shadow-md border-gray-200"
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} />
                      <IconComponent className={`w-5 h-5 ${isSelected ? "text-orange-600" : "text-gray-600"}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.label}</span>
                          <Badge variant={isSelected ? "default" : "outline"}>{category.cashback}%</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Auto-Claim:</strong> Smart Agent automatically claims cashback when it reaches $10 and reinvests
              it into your vault for compound growth.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6 text-center">
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            disabled={selectedCategories.length === 0}
          >
            Save {selectedCategories.length} Categories (Avg {averageCashback.toFixed(1)}% back)
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-gray-600 mt-3">
            {selectedCategories.length === 0 ? "Select at least one category" : "Next: Set credit limits"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
