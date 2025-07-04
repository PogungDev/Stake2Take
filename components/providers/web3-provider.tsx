"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Web3ContextType {
  account: string | null
  isConnected: boolean
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })

        setAccount(accounts[0])
        setChainId(Number.parseInt(chainId, 16))
        setIsConnected(true)

        localStorage.setItem("walletConnected", "true")
      } catch (error) {
        console.error("Failed to connect wallet:", error)
      }
    }
  }

  const disconnect = () => {
    setAccount(null)
    setChainId(null)
    setIsConnected(false)
    localStorage.removeItem("walletConnected")
  }

  const switchNetwork = async (targetChainId: number) => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        })
      } catch (error) {
        console.error("Failed to switch network:", error)
      }
    }
  }

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const wasConnected = localStorage.getItem("walletConnected")
        if (wasConnected) {
          try {
            const accounts = await window.ethereum.request({
              method: "eth_accounts",
            })
            if (accounts.length > 0) {
              const chainId = await window.ethereum.request({
                method: "eth_chainId",
              })
              setAccount(accounts[0])
              setChainId(Number.parseInt(chainId, 16))
              setIsConnected(true)
            }
          } catch (error) {
            console.error("Failed to check connection:", error)
          }
        }
      }
    }

    checkConnection()

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAccount(accounts[0])
        }
      })

      window.ethereum.on("chainChanged", (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
      })
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected,
        chainId,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}
