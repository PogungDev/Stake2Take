"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Copy, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { truncateAddress, formatCurrency } from "@/lib/utils" // Corrected import
import { ethers } from "ethers"
import { chains } from "@/types/chains"

interface RealWalletConnectorProps {
  onConnect?: (address: string, provider: ethers.BrowserProvider, signer: ethers.Signer) => void
  onDisconnect?: () => void
}

export function RealWalletConnector({ onConnect, onDisconnect }: RealWalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [network, setNetwork] = useState("")
  const [balance, setBalance] = useState(0)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const currentProvider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await currentProvider.listAccounts()
        if (accounts.length > 0) {
          const account = accounts[0]
          const currentSigner = await currentProvider.getSigner(account.address)
          const network = await currentProvider.getNetwork()
          const balanceWei = await currentProvider.getBalance(account.address)
          const balanceEth = Number.parseFloat(ethers.formatEther(balanceWei))

          setIsConnected(true)
          setWalletAddress(account.address)
          setNetwork(chains.find((c) => c.id === Number(network.chainId))?.name || network.name)
          setBalance(balanceEth)
          setProvider(currentProvider)
          setSigner(currentSigner)
          onConnect?.(account.address, currentProvider, currentSigner)
        }

        // Listen for account changes
        window.ethereum.on("accountsChanged", (accounts: string[]) => {
          if (accounts.length > 0) {
            handleConnect() // Reconnect with new account
          } else {
            handleDisconnect()
          }
        })

        // Listen for chain changes
        window.ethereum.on("chainChanged", (chainId: string) => {
          handleConnect() // Reconnect to update network info
        })
      }
    }

    checkWalletConnection()

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {})
        window.ethereum.removeListener("chainChanged", () => {})
      }
    }
  }, [])

  const handleConnect = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const currentProvider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await currentProvider.listAccounts()
        if (accounts.length > 0) {
          const account = accounts[0]
          const currentSigner = await currentProvider.getSigner(account.address)
          const network = await currentProvider.getNetwork()
          const balanceWei = await currentProvider.getBalance(account.address)
          const balanceEth = Number.parseFloat(ethers.formatEther(balanceWei))

          setIsConnected(true)
          setWalletAddress(account.address)
          setNetwork(chains.find((c) => c.id === Number(network.chainId))?.name || network.name)
          setBalance(balanceEth)
          setProvider(currentProvider)
          setSigner(currentSigner)
          onConnect?.(account.address, currentProvider, currentSigner)
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        setIsConnected(false)
        setWalletAddress("")
        setNetwork("")
        setBalance(0)
        setProvider(null)
        setSigner(null)
      }
    } else {
      alert("MetaMask or a compatible Web3 wallet is not detected. Please install one.")
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress("")
    setNetwork("")
    setBalance(0)
    setProvider(null)
    setSigner(null)
    onDisconnect?.()
  }

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      // Optionally, show a toast notification
      console.log("Address copied!")
    }
  }

  return (
    <>
      {!isConnected ? (
        <Button onClick={handleConnect} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">{truncateAddress(walletAddress)}</span>
              <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                {network}
              </Badge>
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Connected:</span>
                <Badge>{network}</Badge>
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Address:</span>
                <span className="font-mono">{truncateAddress(walletAddress)}</span>
                <Button variant="ghost" size="sm" onClick={handleCopyAddress} className="h-6 w-6 p-0 ml-2">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium">Balance:</span>
                <span className="text-sm font-bold">{formatCurrency(balance)} ETH</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDisconnect} className="text-red-500">
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}
