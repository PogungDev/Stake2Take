"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/components/providers/web3-provider"
import { Wallet, Copy, ExternalLink, AlertCircle } from "lucide-react"

interface WalletConnectorProps {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
}

const NETWORK_NAMES: { [key: number]: string } = {
  1: "ETH",
  11155111: "Sepolia",
  8453: "Base",
  42161: "ARB",
  137: "MATIC",
  59144: "Linea",
  10: "OP",
}

export function WalletConnector({ onConnect, onDisconnect }: WalletConnectorProps) {
  const { account, isConnected, chainId, connect, disconnect } = useWeb3()
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
      if (onConnect && account) {
        onConnect(account)
      }
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    if (onDisconnect) {
      onDisconnect()
    }
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from MetaMask",
    })
  }

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const openEtherscan = () => {
    if (account && chainId) {
      const baseUrls: { [key: number]: string } = {
        1: "https://etherscan.io",
        11155111: "https://sepolia.etherscan.io",
        8453: "https://basescan.org",
        42161: "https://arbiscan.io",
        137: "https://polygonscan.com",
        59144: "https://lineascan.build",
        10: "https://optimistic.etherscan.io",
      }
      const baseUrl = baseUrls[chainId] || "https://etherscan.io"
      window.open(`${baseUrl}/address/${account}`, "_blank")
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Button onClick={handleConnect} disabled={isConnecting} size="sm" className="h-6 px-3 text-xs">
          <Wallet className="w-3 h-3 mr-1" />
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>

        {typeof window !== "undefined" && !window.ethereum && (
          <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>MetaMask not detected</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        <span className="font-medium text-green-700">
          {account?.slice(0, 4)}...{account?.slice(-3)}
        </span>
        {chainId && (
          <Badge variant="outline" className="text-xs px-1 py-0 ml-1">
            {NETWORK_NAMES[chainId] || chainId}
          </Badge>
        )}
      </div>

      <Button variant="outline" size="sm" className="h-6 w-6 p-0 bg-transparent" onClick={copyAddress}>
        <Copy className="w-2.5 h-2.5" />
      </Button>

      <Button variant="outline" size="sm" className="h-6 w-6 p-0 bg-transparent" onClick={openEtherscan}>
        <ExternalLink className="w-2.5 h-2.5" />
      </Button>

      <Button variant="outline" size="sm" className="h-6 px-2 text-xs bg-transparent" onClick={handleDisconnect}>
        Disconnect
      </Button>
    </div>
  )
}
