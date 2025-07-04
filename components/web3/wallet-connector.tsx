"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, CheckCircle } from "lucide-react"

export function WalletConnector() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    setIsConnecting(true)

    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true)
      setAddress("0x1234...5678")
      setIsConnecting(false)
    }, 1500)
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress("")
  }

  if (isConnected) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-sm font-medium text-green-800">Connected</div>
              <div className="text-xs text-green-600 font-mono">{address}</div>
            </div>
            <Button variant="outline" size="sm" onClick={disconnectWallet} className="ml-auto bg-transparent">
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Button onClick={connectWallet} disabled={isConnecting} className="bg-orange-500 hover:bg-orange-600 text-white">
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Connect MetaMask
        </>
      )}
    </Button>
  )
}

// Hook for other components to use
export function useAccount() {
  return {
    address: "0x1234...5678", // Mock address
    isConnected: true,
  }
}
