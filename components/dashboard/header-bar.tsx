"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { WalletConnector } from "@/components/shared/wallet-connector"
import { Coins, Menu, X, BookOpen } from "lucide-react"

interface HeaderBarProps {
  completedTabs: number
  totalTabs: number
}

export function HeaderBar({ completedTabs, totalTabs }: HeaderBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const progressPercentage = (completedTabs / totalTabs) * 100

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-1.5">
        {/* Main Header Row */}
        <div className="flex items-center justify-between">
          {/* Logo Section - Horizontal Layout */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-none">Stake2Take</h1>
                <p className="text-xs text-gray-600 leading-none">Stake More, Take More</p>
              </div>
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5 hidden sm:flex"
              >
                MetaMask Card Dev Cook-Off
              </Badge>
            </div>
          </Link>

          {/* Right Section - Horizontal Layout */}
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5">
              Track 1: Smart Agents
            </Badge>
            <Link href="/how-it-works">
              <Button variant="ghost" size="sm" className="gap-1 h-6 px-2 text-xs">
                <BookOpen className="h-3 w-3" />
                Guide
              </Button>
            </Link>
            <WalletConnector />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Progress Row - Inline with minimal height */}
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Setup Progress</span>
            <span className="text-xs text-gray-500">
              ({completedTabs}/{totalTabs})
            </span>
          </div>
          <div className="flex-1 mx-3">
            <Progress value={progressPercentage} className="h-1" />
          </div>
          <span className="text-xs text-gray-500">{Math.round(progressPercentage)}%</span>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-1 border-t mt-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5">
                Track 1: Smart Agents
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5">
                MetaMask Card Dev Cook-Off
              </Badge>
              <Link href="/how-it-works">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  Guide
                </Button>
              </Link>
            </div>
            <WalletConnector />
          </div>
        )}
      </div>
    </header>
  )
}
