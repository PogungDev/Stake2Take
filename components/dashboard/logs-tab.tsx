"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { FileText, Trash2, Download } from "lucide-react"
import { useSmartAgent } from "@/hooks/use-smart-agent"

export function LogsTab() {
  const { logs, agentState } = useSmartAgent()

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "balance":
        return "bg-green-100 text-green-700"
      case "vault":
        return "bg-blue-100 text-blue-700"
      case "rewards":
        return "bg-purple-100 text-purple-700"
      case "credit":
        return "bg-orange-100 text-orange-700"
      case "system":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const clearLogs = () => {
    // This would clear logs in a real implementation
    console.log("Clear logs functionality would be implemented here")
  }

  const exportLogs = () => {
    const logData = logs.map((log) => `[${log.timestamp}] ${log.emoji} ${log.message}`).join("\n")

    const blob = new Blob([logData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `stake2take-logs-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Agent Activity Logs</h2>
        <p className="text-gray-600">Real-time monitoring and automation history</p>
      </div>

      {/* Status Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Log Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={agentState.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                {agentState.isActive ? "🟢 Live Monitoring" : "⚫ Monitoring Paused"}
              </Badge>
              <span className="text-sm text-gray-600">{logs.length} total entries</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportLogs} disabled={logs.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs} disabled={logs.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>
            {agentState.isActive
              ? "Agent is actively monitoring - new entries appear every 5 seconds"
              : "Activate the agent to start real-time monitoring"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
              <p className="text-sm">
                {agentState.isActive
                  ? "Waiting for agent actions..."
                  : "Activate the agent or run simulations to see logs here"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg">{log.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-gray-500">[{log.timestamp}]</span>
                        <Badge variant="outline" className={getLogTypeColor(log.type)}>
                          {log.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Log Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Log Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center">
              <Badge className="bg-green-100 text-green-700 mb-1">balance</Badge>
              <p className="text-xs text-gray-600">Balance & Top-ups</p>
            </div>
            <div className="text-center">
              <Badge className="bg-blue-100 text-blue-700 mb-1">vault</Badge>
              <p className="text-xs text-gray-600">Vault Rebalancing</p>
            </div>
            <div className="text-center">
              <Badge className="bg-purple-100 text-purple-700 mb-1">rewards</Badge>
              <p className="text-xs text-gray-600">Cashback & Claims</p>
            </div>
            <div className="text-center">
              <Badge className="bg-orange-100 text-orange-700 mb-1">credit</Badge>
              <p className="text-xs text-gray-600">Credit Management</p>
            </div>
            <div className="text-center">
              <Badge className="bg-gray-100 text-gray-700 mb-1">system</Badge>
              <p className="text-xs text-gray-600">Agent Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
