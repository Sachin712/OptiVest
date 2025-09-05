'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Trade, ContractSale, ContractPurchase } from '@/lib/supabase'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface AccountValueChartProps {
  trades: Trade[]
  contractPurchases: ContractPurchase[]
  contractSales: ContractSale[]
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | 'All Time'

interface ChartDataPoint {
  date: string
  totalValue: number
  totalInvestment: number
  realizedPnL: number
  unrealizedPnL: number
  totalPnL: number
}

export default function AccountValueChart({ trades, contractPurchases, contractSales }: AccountValueChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M')

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: 'YTD', label: 'YTD' },
    { value: '1Y', label: '1 Year' },
    { value: 'All Time', label: 'All Time' }
  ]

  const getDateRange = (range: TimeRange): { start: Date; end: Date } => {
    const now = new Date()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (range) {
      case '1D':
        return { start: new Date(end.getTime() - 1 * 24 * 60 * 60 * 1000), end }
      case '1W':
        return { start: new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000), end }
      case '1M':
        return { start: new Date(end.getFullYear(), end.getMonth() - 1, end.getDate()), end }
      case '3M':
        return { start: new Date(end.getFullYear(), end.getMonth() - 3, end.getDate()), end }
      case 'YTD':
        return { start: new Date(end.getFullYear(), 0, 1), end }
      case '1Y':
        return { start: new Date(end.getFullYear() - 1, end.getMonth(), end.getDate()), end }
      case 'All Time':
        // Find the earliest purchase date
        const earliestPurchase = contractPurchases.reduce((earliest, purchase) => {
          const purchaseDate = new Date(purchase.purchase_date)
          return purchaseDate < earliest ? purchaseDate : earliest
        }, new Date())
        return { start: earliestPurchase, end }
      default:
        return { start: new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000), end }
    }
  }

  const generateDateRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = []
    const current = new Date(start)
    
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const calculateAccountValue = (date: Date): ChartDataPoint => {
    const dateStr = date.toISOString().split('T')[0]
    
    // Filter purchases that occurred on or before this date
    const purchasesUpToDate = contractPurchases.filter(purchase => purchase.purchase_date <= dateStr)
    
    // Filter contract sales that occurred on or before this date
    const salesUpToDate = contractSales.filter(sale => sale.sell_date <= dateStr)
    
    // Calculate total investment (all purchases up to this date)
    const totalInvestment = purchasesUpToDate.reduce((sum, purchase) => {
      return sum + (purchase.purchase_price * purchase.contracts * 100) // 100 shares per contract
    }, 0)
    
    // Calculate realized P&L using weighted average purchase prices
    const realizedPnL = salesUpToDate.reduce((sum, sale) => {
      // Find all purchases for this trade up to the sale date
      const tradePurchases = purchasesUpToDate.filter(p => p.trade_id === sale.trade_id)
      
      if (tradePurchases.length === 0) return sum
      
      // Calculate weighted average purchase price for this trade
      const totalContracts = tradePurchases.reduce((sum, p) => sum + p.contracts, 0)
      const weightedAvgPrice = tradePurchases.reduce((sum, p) => 
        sum + (p.purchase_price * p.contracts), 0) / totalContracts
      
      const profit = (sale.sell_price - weightedAvgPrice) * sale.contracts_sold * 100
      return sum + profit
    }, 0)
    
    // Calculate unrealized P&L (remaining contracts)
    const totalSold = salesUpToDate.reduce((sum, sale) => sum + sale.contracts_sold, 0)
    const totalContracts = purchasesUpToDate.reduce((sum, purchase) => sum + purchase.contracts, 0)
    const remainingContracts = totalContracts - totalSold
    
    // For unrealized P&L, we'll use a simple approach: assume current value is same as weighted average purchase price
    // In a real app, you'd want to fetch current market prices
    const unrealizedPnL = 0 // This would need real-time data
    
    const totalPnL = realizedPnL + unrealizedPnL
    const totalValue = totalInvestment + totalPnL
    
    return {
      date: dateStr,
      totalValue,
      totalInvestment,
      realizedPnL,
      unrealizedPnL,
      totalPnL
    }
  }

  const chartData = useMemo(() => {
    const { start, end } = getDateRange(selectedRange)
    const dates = generateDateRange(start, end)
    
    return dates.map(date => calculateAccountValue(date))
  }, [selectedRange, trades, contractPurchases, contractSales])

  const formatTooltipValue = (value: number, name: string) => {
    const formattedValue = `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    
    switch (name) {
      case 'totalValue':
        return [formattedValue, 'Total Value']
      case 'totalInvestment':
        return [formattedValue, 'Total Investment']
      case 'realizedPnL':
        return [formattedValue, 'Realized P&L']
      case 'unrealizedPnL':
        return [formattedValue, 'Unrealized P&L']
      case 'totalPnL':
        return [formattedValue, 'Total P&L']
      default:
        return [formattedValue, name]
    }
  }

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (diffDays <= 365) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }
  }

  const getPerformanceIndicator = () => {
    if (chartData.length < 2) return null
    
    const firstValue = chartData[0].totalValue
    const lastValue = chartData[chartData.length - 1].totalValue
    const change = lastValue - firstValue
    const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0
    
    return {
      change,
      changePercent,
      isPositive: change >= 0
    }
  }

  const performance = getPerformanceIndicator()

  if (trades.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Add some trades to see your account performance chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Account Performance</h3>
          {performance && (
            <div className="flex items-center mt-1">
              {performance.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                performance.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {performance.isPositive ? '+' : ''}${performance.change.toFixed(2)} ({performance.changePercent.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedRange(range.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedRange === range.value
                  ? 'bg-primary-600 dark:bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="currentColor"
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              stroke="currentColor"
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
            />
            <Tooltip 
              formatter={formatTooltipValue}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="totalValue" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
