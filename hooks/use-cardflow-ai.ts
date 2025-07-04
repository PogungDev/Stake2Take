"use client"

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { VaultMasterAI, type SpendingPrediction, type YieldOptimization, type AIInsight } from '@/lib/ai/cardflow-agent'
import { getVaultMasterAddress, getUSDCAddress } from '@/lib/config/wagmi'
import toast from 'react-hot-toast'

// Contract ABI definitions (simplified for demo)
const VAULTMASTER_ABI = [
  {
    name: 'userProfiles',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'riskTolerance', type: 'uint256' },
      { name: 'targetBalance', type: 'uint256' },
      { name: 'emergencyBuffer', type: 'uint256' },
      { name: 'automationEnabled', type: 'bool' },
      { name: 'lastRebalance', type: 'uint256' },
      { name: 'totalDeposited', type: 'uint256' },
      { name: 'totalWithdrawn', type: 'uint256' }
    ]
  },
  {
    name: 'automatedBalances',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getTotalPortfolioValue',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'createProfile',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_riskTolerance', type: 'uint256' },
      { name: '_targetBalance', type: 'uint256' },
      { name: '_emergencyBuffer', type: 'uint256' }
    ]
  },
  {
    name: 'depositFunds',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }]
  },
  {
    name: 'emergencyWithdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: []
  }
] as const

const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

interface VaultMasterState {
  isInitialized: boolean
  isLoading: boolean
  hasProfile: boolean
  automationEnabled: boolean
  totalPortfolioValue: number
  spendingPrediction: SpendingPrediction | null
  yieldOptimization: YieldOptimization | null
  insights: AIInsight[]
}

export function useVaultMasterAI() {
  const { address, isConnected, chain } = useAccount()
  const { writeContract, isPending: isWritePending } = useWriteContract()
  
  // State management
  const [state, setState] = useState<VaultMasterState>({
    isInitialized: false,
    isLoading: false,
    hasProfile: false,
    automationEnabled: false,
    totalPortfolioValue: 0,
    spendingPrediction: null,
    yieldOptimization: null,
    insights: []
  })

  // AI agent instance
  const [agent] = useState(() => new VaultMasterAI())

  // Contract addresses
  const vaultmasterAddress = chain ? getVaultMasterAddress(chain.id) : undefined
  const usdcAddress = chain ? getUSDCAddress(chain.id) : undefined

  // Read user profile from contract
  const { data: userProfile, refetch: refetchProfile } = useReadContract({
    address: vaultmasterAddress as `0x${string}`,
    abi: VAULTMASTER_ABI,
    functionName: 'userProfiles',
    args: address ? [address] : undefined,
    query: {
      enabled: !!(address && vaultmasterAddress)
    }
  })

  // Read automated balance
  const { data: automatedBalance, refetch: refetchBalance } = useReadContract({
    address: vaultmasterAddress as `0x${string}`,
    abi: VAULTMASTER_ABI,
    functionName: 'automatedBalances',
    args: address ? [address] : undefined,
    query: {
      enabled: !!(address && vaultmasterAddress)
    }
  })

  // Read total portfolio value
  const { data: portfolioValue, refetch: refetchPortfolio } = useReadContract({
    address: vaultmasterAddress as `0x${string}`,
    abi: VAULTMASTER_ABI,
    functionName: 'getTotalPortfolioValue',
    args: address ? [address] : undefined,
    query: {
      enabled: !!(address && vaultmasterAddress)
    }
  })

  // Read wallet balance
  const { data: walletBalance } = useBalance({
    address: address,
    token: usdcAddress as `0x${string}`,
    query: {
      enabled: !!(address && usdcAddress)
    }
  })

  // Read USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address && vaultmasterAddress ? [address, vaultmasterAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!(address && usdcAddress && vaultmasterAddress)
    }
  })

  // Update state when contract data changes
  useEffect(() => {
    if (userProfile && Array.isArray(userProfile) && userProfile.length >= 4) {
      setState(prev => ({
        ...prev,
        hasProfile: userProfile[3] as boolean, // automationEnabled
        automationEnabled: userProfile[3] as boolean,
        isInitialized: true
      }))
    }
  }, [userProfile])

  useEffect(() => {
    if (portfolioValue) {
      const valueInUSD = Number(formatEther(portfolioValue as bigint))
      setState(prev => ({
        ...prev,
        totalPortfolioValue: valueInUSD
      }))
    }
  }, [portfolioValue])

  // Create user profile
  const createProfile = useCallback(async (
    riskTolerance: number,
    targetBalance: number,
    emergencyBuffer: number
  ) => {
    if (!address || !vaultmasterAddress) {
      toast.error('Wallet not connected')
      return { error: 'Wallet not connected' }
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      await writeContract({
        address: vaultmasterAddress as `0x${string}`,
        abi: VAULTMASTER_ABI,
        functionName: 'createProfile',
        args: [
          BigInt(riskTolerance),
          parseEther(targetBalance.toString()),
          parseEther(emergencyBuffer.toString())
        ]
      })

      toast.success('Profile created successfully!')
      
      // Refetch data
      setTimeout(() => {
        refetchProfile()
        refetchBalance()
        refetchPortfolio()
      }, 2000)

      return { success: true }
    } catch (error: any) {
      console.error('Error creating profile:', error)
      toast.error(error?.message || 'Failed to create profile')
      return { error: error?.message || 'Failed to create profile' }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, vaultmasterAddress, writeContract, refetchProfile, refetchBalance, refetchPortfolio])

  // Approve USDC spending
  const approveUSDC = useCallback(async (amount: string) => {
    if (!address || !usdcAddress || !vaultmasterAddress) {
      toast.error('Missing contract addresses')
      return { error: 'Missing contract addresses' }
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      await writeContract({
        address: usdcAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [vaultmasterAddress as `0x${string}`, parseEther(amount)]
      })

      toast.success('USDC approval successful!')
      
      // Refetch allowance
      setTimeout(() => {
        refetchAllowance()
      }, 2000)

      return { success: true }
    } catch (error: any) {
      console.error('Error approving USDC:', error)
      toast.error(error?.message || 'Failed to approve USDC')
      return { error: error?.message || 'Failed to approve USDC' }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, usdcAddress, vaultmasterAddress, writeContract, refetchAllowance])

  // Deposit funds
  const depositFunds = useCallback(async (amount: string) => {
    if (!address || !vaultmasterAddress) {
      toast.error('Wallet not connected')
      return { error: 'Wallet not connected' }
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      // Check allowance first
      const amountBigInt = parseEther(amount)
      if (!allowance || (allowance as bigint) < amountBigInt) {
        const approveResult = await approveUSDC(amount)
        if (approveResult.error) {
          return approveResult
        }
        
        // Wait for approval to be mined
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      await writeContract({
        address: vaultmasterAddress as `0x${string}`,
        abi: VAULTMASTER_ABI,
        functionName: 'depositFunds',
        args: [amountBigInt]
      })

      toast.success(`Deposited $${amount} successfully!`)
      
      // Refetch data
      setTimeout(() => {
        refetchBalance()
        refetchPortfolio()
      }, 2000)

      return { success: true }
    } catch (error: any) {
      console.error('Error depositing funds:', error)
      toast.error(error?.message || 'Failed to deposit funds')
      return { error: error?.message || 'Failed to deposit funds' }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, vaultmasterAddress, writeContract, allowance, approveUSDC, refetchBalance, refetchPortfolio])

  // Emergency withdraw
  const emergencyWithdraw = useCallback(async () => {
    if (!address || !vaultmasterAddress) {
      toast.error('Wallet not connected')
      return { error: 'Wallet not connected' }
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      await writeContract({
        address: vaultmasterAddress as `0x${string}`,
        abi: VAULTMASTER_ABI,
        functionName: 'emergencyWithdraw',
        args: []
      })

      toast.success('Emergency withdrawal successful!')
      
      // Refetch data
      setTimeout(() => {
        refetchBalance()
        refetchPortfolio()
      }, 2000)

      return { success: true }
    } catch (error: any) {
      console.error('Error in emergency withdrawal:', error)
      toast.error(error?.message || 'Failed to withdraw funds')
      return { error: error?.message || 'Failed to withdraw funds' }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, vaultmasterAddress, writeContract, refetchBalance, refetchPortfolio])

  // AI Functions
  const predictSpending = useCallback(async () => {
    if (!address) return null

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      // Mock transaction data for demo (replace with real API call)
      const mockTransactions = [
        { date: '2024-01-15', amount: 120, category: 'Food', type: 'debit' as const },
        { date: '2024-01-14', amount: 45, category: 'Transport', type: 'debit' as const },
        { date: '2024-01-13', amount: 200, category: 'Shopping', type: 'debit' as const },
        { date: '2024-01-12', amount: 75, category: 'Entertainment', type: 'debit' as const },
        { date: '2024-01-11', amount: 30, category: 'Food', type: 'debit' as const }
      ]

      const prediction = await agent.predictSpending(address, mockTransactions)
      
      setState(prev => ({
        ...prev,
        spendingPrediction: prediction
      }))

      return prediction
    } catch (error) {
      console.error('Error predicting spending:', error)
      return null
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, agent])

  const optimizeYield = useCallback(async (amount: number, riskLevel: number) => {
    if (!address || !chain) return null

    try {
      setState(prev => ({ ...prev, isLoading: true }))

      const optimization = await agent.optimizeYield(amount, riskLevel, chain.id)
      
      setState(prev => ({
        ...prev,
        yieldOptimization: optimization
      }))

      return optimization
    } catch (error) {
      console.error('Error optimizing yield:', error)
      return null
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, chain, agent])

  const generateInsights = useCallback(async () => {
    if (!address) return []

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      // Mock data for demo
      const mockTransactions = [
        { date: '2024-01-15', amount: 120, category: 'Food', type: 'debit' as const },
        { date: '2024-01-14', amount: 45, category: 'Transport', type: 'debit' as const }
      ]

      const insights = await agent.generateInsights(address, mockTransactions, state.totalPortfolioValue)
      
      setState(prev => ({
        ...prev,
        insights
      }))

      return insights
    } catch (error) {
      console.error('Error generating insights:', error)
      return []
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, agent, state.totalPortfolioValue])

  // Auto-generate insights when portfolio changes
  useEffect(() => {
    if (address && state.hasProfile && state.totalPortfolioValue > 0) {
      generateInsights()
    }
  }, [address, state.hasProfile, state.totalPortfolioValue, generateInsights])

  return {
    // State
    ...state,
    isLoading: state.isLoading || isWritePending,
    
    // Contract data
    userProfile,
    automatedBalance: automatedBalance ? Number(formatEther(automatedBalance as bigint)) : 0,
    walletBalance: walletBalance ? Number(formatEther(walletBalance.value)) : 0,
    allowance: allowance ? Number(formatEther(allowance as bigint)) : 0,
    
    // Actions
    createProfile,
    approveUSDC,
    depositFunds,
    emergencyWithdraw,
    
    // AI Functions
    predictSpending,
    optimizeYield,
    generateInsights,
    
    // Utility
    refetchData: () => {
      refetchProfile()
      refetchBalance()
      refetchPortfolio()
      refetchAllowance()
    }
  }
}
