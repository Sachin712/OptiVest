'use client'

import { useState, useEffect } from 'react'
import { Trade, ContractSale, ContractPurchase } from '@/lib/supabase'
import { TrendingUp, TrendingDown, DollarSign, Target, CheckCircle } from 'lucide-react'

interface StatsCardsProps {
  trades: Trade[]
  contractPurchases: ContractPurchase[]
  contractSales: ContractSale[]
}

export default function StatsCards({ trades, contractPurchases, contractSales }: StatsCardsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const calculateStats = () => {
    // Each options contract = 100 shares
    const CONTRACT_SIZE = 100
    
    // Calculate total investment using: Total Purchases - Total Sales
    const totalPurchases = contractPurchases.reduce((sum, purchase) => {
      return sum + (purchase.purchase_price * purchase.contracts * CONTRACT_SIZE)
    }, 0)
    
    const totalSales = contractSales.reduce((sum, sale) => {
      return sum + (sale.sell_price * sale.contracts_sold * CONTRACT_SIZE)
    }, 0)
    
    const totalInvestment = totalPurchases - totalSales

    // Calculate P&L using weighted average purchase price
    const totalPnL = contractSales.reduce((sum, sale) => {
      // Find all purchases for this trade
      const tradePurchases = contractPurchases.filter(p => p.trade_id === sale.trade_id)
      
      if (tradePurchases.length === 0) return sum
      
      // Calculate weighted average purchase price for this trade
      const totalContracts = tradePurchases.reduce((sum, p) => sum + p.contracts, 0)
      const weightedAvgPrice = tradePurchases.reduce((sum, p) => 
        sum + (p.purchase_price * p.contracts), 0) / totalContracts
      
      // P&L = (sell_price - weighted_avg_price) × contracts_sold × 100 shares per contract
      const profit = (sale.sell_price - weightedAvgPrice) * sale.contracts_sold * CONTRACT_SIZE
      return sum + profit
    }, 0)

    // Calculate successful trades percentage
    // A trade is considered successful if it has any sales and the overall P&L for that trade is positive
    const tradesWithSales = trades.filter(trade => {
      const tradeSales = contractSales.filter(s => s.trade_id === trade.id)
      return tradeSales.length > 0
    })

    const profitableTrades = tradesWithSales.filter(trade => {
      const tradePurchases = contractPurchases.filter(p => p.trade_id === trade.id)
      const tradeSales = contractSales.filter(s => s.trade_id === trade.id)
      
      if (tradePurchases.length === 0 || tradeSales.length === 0) return false
      
      // Calculate total P&L for this trade
      const totalContracts = tradePurchases.reduce((sum, p) => sum + p.contracts, 0)
      const weightedAvgPrice = tradePurchases.reduce((sum, p) => 
        sum + (p.purchase_price * p.contracts), 0) / totalContracts
      
      const tradePnL = tradeSales.reduce((sum, sale) => {
        const profit = (sale.sell_price - weightedAvgPrice) * sale.contracts_sold * CONTRACT_SIZE
        return sum + profit
      }, 0)
      
      return tradePnL > 0
    })

    const successfulTradesPercentage = tradesWithSales.length > 0 
      ? (profitableTrades.length / tradesWithSales.length) * 100 
      : 0

    return {
      totalInvestment: totalInvestment.toFixed(2),
      totalPnL: totalPnL.toFixed(2),
      successfulTradesPercentage: successfulTradesPercentage.toFixed(1),
      isPnLPositive: totalPnL >= 0
    }
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
              {stats.isPnLPositive ? '+' : ''}${stats.totalPnL}
            </p>
            {/* <p className="text-xs text-gray-500">(100 shares per contract)</p> */}
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
