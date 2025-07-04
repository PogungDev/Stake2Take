"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Shield, TrendingUp, RotateCcw } from "lucide-react"
import { useSmartAgent } from "@/hooks/use-smart-agent"
import { useToast } from "@/hooks/use-toast"

interface SimpleVaultTabProps {
  onComplete?: () => void
}

export function SimpleVaultTab({ onComplete }: SimpleVaultTabProps) {
  const { agentState, simulateAPYChange } = useSmartAgent()
  const { toast } = useToast()
  const [allocation, setAllocation] = useState([agentState.vaultAave])
  const [isSimulating, setIsSimulating] = useState(false)

  // Sync allocation with agentState changes
  useEffect(() => {
    setAllocation([agentState.vaultAave])
  }, [agentState.vaultAave])

  const aaveAPY = 4.2
  const compoundAPY = 3.8
  const aaveAllocation = allocation[0]
  const compoundAllocation = 100 - aaveAllocation

  const handleSimulateAPY = async () => {
    setIsSimulating(true)
    
    try {
      simulateAPYChange()
      toast({
        title: "APY Simulation Triggered",
        description: "Agent checked APY rates and executed rebalancing logic",
      })
      onComplete?.() // Mark tab as completed
    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Something went wrong during APY simulation",
        variant: "destructive",
      })
    } finally {
      // Add small delay for better UX
      setTimeout(() => {
        setIsSimulating(false)
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">USDC Vault</h2>
        <p className="text-gray-600">Automated allocation between Aave and Compound</p>
      </div>

      {/* Current Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Current Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className={`text-center p-4 rounded-lg transition-all duration-500 ${
              aaveAllocation >= 60 ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-blue-50'
            }`}>
              <div className="text-2xl font-bold text-blue-700">{aaveAllocation}%</div>
              <div className="text-sm text-blue-600">Aave Protocol</div>
              <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700">
                {aaveAPY}% APY
              </Badge>
              {aaveAllocation >= 60 && (
                <div className="text-xs text-blue-500 mt-1">🎯 Optimized</div>
              )}
            </div>
            <div className={`text-center p-4 rounded-lg transition-all duration-500 ${
              compoundAllocation >= 60 ? 'bg-purple-100 ring-2 ring-purple-300' : 'bg-purple-50'
            }`}>
              <div className="text-2xl font-bold text-purple-700">{compoundAllocation}%</div>
              <div className="text-sm text-purple-600">Compound Protocol</div>
              <Badge variant="outline" className="mt-2 bg-purple-50 text-purple-700">
                {compoundAPY}% APY
              </Badge>
              {compoundAllocation >= 60 && (
                <div className="text-xs text-purple-500 mt-1">🎯 Optimized</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Adjust Allocation
          </CardTitle>
          <CardDescription>Agent will rebalance automatically when APY difference exceeds 1.5%</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Aave: {aaveAllocation}%</span>
              <span>Compound: {compoundAllocation}%</span>
            </div>
            <Slider value={allocation} onValueChange={setAllocation} max={100} step={5} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0% Aave</span>
              <span>100% Aave</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              Weighted APY: {((aaveAPY * aaveAllocation + compoundAPY * compoundAllocation) / 100).toFixed(2)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* APY Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>APY Change Simulation</CardTitle>
          <CardDescription>Test how the agent responds to APY fluctuations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSimulateAPY} 
            disabled={isSimulating}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50" 
            size="lg"
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Simulating...' : 'Simulate APY Change'}
          </Button>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>How it works:</strong> When APY difference between protocols exceeds 1.5%, the agent
              automatically rebalances your allocation to maximize yield.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
