"use client"

import { useState } from "react"
import { HeaderBar } from "@/components/dashboard/header-bar"
import { GoalsTab } from "@/components/dashboard/goals-tab"
import { SimpleVaultTab } from "@/components/dashboard/simple-vault-tab"
import { SimpleRewardsTab } from "@/components/dashboard/simple-rewards-tab"
import { SimpleCreditTab } from "@/components/dashboard/simple-credit-tab"
import { AgentControlTab } from "@/components/dashboard/agent-control-tab"
import { LogsTab } from "@/components/dashboard/logs-tab"
import { HowItWorksTab } from "@/components/dashboard/how-it-works-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface TabCompletionState {
  goals: boolean
  vault: boolean
  rewards: boolean
  credit: boolean
  agent: boolean
  logs: boolean
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("how-it-works")
  const [tabCompletion, setTabCompletion] = useState<TabCompletionState>({
    goals: false,
    vault: false,
    rewards: false,
    credit: false,
    agent: false,
    logs: false,
  })

  // Calculate completed tabs
  const completedCount = Object.values(tabCompletion).filter(Boolean).length
  const totalTabs = Object.keys(tabCompletion).length

  // Function to mark tab as completed
  const markTabCompleted = (tabName: keyof TabCompletionState) => {
    setTabCompletion((prev) => ({
      ...prev,
      [tabName]: true,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar completedTabs={completedCount} totalTabs={totalTabs} />

      <main className="container mx-auto px-4 py-6">
        {/* Connection Alert */}
        <Alert className="mb-6 bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Connect your MetaMask wallet</strong> to access all features and start using the Smart Agent
            automation.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="how-it-works" className="text-xs">
              How It Works
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">
              Goals
            </TabsTrigger>
            <TabsTrigger value="vault" className="text-xs">
              Vault
            </TabsTrigger>
            <TabsTrigger value="rewards" className="text-xs">
              Rewards
            </TabsTrigger>
            <TabsTrigger value="credit" className="text-xs">
              Credit
            </TabsTrigger>
            <TabsTrigger value="agent" className="text-xs">
              Agent
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="how-it-works" className="space-y-6">
            <HowItWorksTab />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalsTab onComplete={() => markTabCompleted("goals")} />
          </TabsContent>

          <TabsContent value="vault" className="space-y-6">
            <SimpleVaultTab onComplete={() => markTabCompleted("vault")} />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <SimpleRewardsTab onComplete={() => markTabCompleted("rewards")} />
          </TabsContent>

          <TabsContent value="credit" className="space-y-6">
            <SimpleCreditTab onComplete={() => markTabCompleted("credit")} />
          </TabsContent>

          <TabsContent value="agent" className="space-y-6">
            <AgentControlTab onComplete={() => markTabCompleted("agent")} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogsTab onComplete={() => markTabCompleted("logs")} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
