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
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-1.5">
        <div className="flex items-center justify-between">
          {/* Compact Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Stake2Take</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5">
              Track 1: Smart Agents
            </Badge>
            <Link href="/how-it-works">
              <Button variant="ghost" size="sm" className="gap-1 h-7 px-2 text-xs">
                <BookOpen className="h-3 w-3" />
                How It Works
              </Button>
            </Link>
            <WalletConnector />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-1 border-t mt-1 space-y-1">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5 w-fit"
            >
              Track 1: Smart Agents
            </Badge>
            <Link href="/how-it-works">
              <Button variant="ghost" size="sm" className="w-full justify-start h-7 text-xs">
                <BookOpen className="mr-1 h-3 w-3" />
                How It Works
              </Button>
            </Link>
            <WalletConnector />
          </div>
        )}

        {/* Ultra Compact Progress */}
        <div className="mt-1.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-gray-600">Setup Progress</span>
            <span className="text-xs text-gray-500">
              {completedTabs}/{totalTabs}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1" />
        </div>
      </div>
    </header>
  )
}

export default HeaderBar
