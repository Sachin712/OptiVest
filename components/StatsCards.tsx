'use client'

import { useState, useEffect } from 'react'
import { Trade, ContractSale, ContractPurchase } from '@/lib/supabase'
import { calculatePortfolioStatsWithFees } from '@/lib/pnlUtils'
import { TrendingUp, TrendingDown, DollarSign, Target, CheckCircle } from 'lucide-react'

interface StatsCardsProps {
  trades: Trade[]
  contractPurchases: ContractPurchase[]
  contractSales: ContractSale[]
}

export default function StatsCards({ trades, contractPurchases, contractSales }: StatsCardsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const calculateStats = () => {
    return calculatePortfolioStatsWithFees(trades, contractPurchases, contractSales)
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="ml-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Successful Trades */}
      <div className="card">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Successful Trades</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.successfulTradesPercentage}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Profitable trades with sales
            </p>
          </div>
        </div>
      </div>

      {/* Total PnL */}
      <div className="card">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              stats.isPnLPositive ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              {stats.isPnLPositive ? (
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total P&L</p>
            <p className={`text-2xl font-semibold ${
              stats.isPnLPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {stats.isPnLPositive ? '+' : ''}${stats.netPnL}
            </p>
          </div>
        </div>
      </div>

      {/* Total Trades */}
      <div className="card">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Trades</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {trades.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Active and closed trades
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
