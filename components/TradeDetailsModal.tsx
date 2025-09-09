'use client'

import { useState, useEffect } from 'react'
import { Trade, ContractSale, ContractPurchase, supabase, ContractSaleFormData } from '@/lib/supabase'
import { getCurrentDateLocal } from '@/lib/dateUtils'
import { getBrokerOptions } from '@/lib/brokerConfig'
import { calculateTradeStatsWithFees } from '@/lib/pnlUtils'
import { BROKER_FEES } from '@/lib/brokerConfig'
import { X, Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'

interface TradeDetailsModalProps {
  trade: Trade
  contractPurchases: ContractPurchase[]
  contractSales: ContractSale[]
  isOpen: boolean
  onClose: () => void
  onTradeUpdated: () => void
}

export default function TradeDetailsModal({ 
  trade, 
  contractPurchases,
  contractSales,
  isOpen, 
  onClose, 
  onTradeUpdated 
}: TradeDetailsModalProps) {
  const [isAddingSale, setIsAddingSale] = useState(false)

  // Helper function to calculate trade fees
  const calculateTradeFees = (broker: string, contracts: number): number => {
    const fee = BROKER_FEES.find(f => f.broker === broker)
    if (!fee) return 0
    return fee.contractFee * contracts
  }
  const [saleFormData, setSaleFormData] = useState<ContractSaleFormData>({
    contracts_sold: 1,
    sell_price: 0,
    sell_date: getCurrentDateLocal(),
    broker: trade.broker || 'Webull'
  })

  useEffect(() => {
    if (isOpen && trade) {
      // Always default to today's date
      const today = getCurrentDateLocal()
      setSaleFormData(prev => ({
        ...prev,
        sell_date: today
      }))
    }
  }, [isOpen, trade])

  const calculateTradeStats = () => {
    return calculateTradeStatsWithFees(trade, contractPurchases, contractSales)
  }

  const stats = calculateTradeStats()

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (saleFormData.contracts_sold > stats.remaining) {
      alert(`Cannot sell more contracts than remaining. You have ${stats.remaining} contracts remaining.`)
      return
    }

    const today = getCurrentDateLocal()
    if (saleFormData.sell_date > today) {
      alert('Sell date cannot be in the future.')
      return
    }

    // Check if sell date is on or after earliest purchase date
    if (contractPurchases.length > 0) {
      const earliestPurchaseDate = Math.min(...contractPurchases.map(p => new Date(p.purchase_date).getTime()))
      if (new Date(saleFormData.sell_date).getTime() < earliestPurchaseDate) {
        alert('Sell date cannot be before the earliest purchase date.')
        return
      }
    }

    try {
      const { error } = await supabase
        .from('contract_sales')
        .insert({
          trade_id: trade.id,
          contracts_sold: saleFormData.contracts_sold,
          sell_price: saleFormData.sell_price,
          sell_date: saleFormData.sell_date,
          broker: saleFormData.broker
        })

      if (error) throw error
      
      // Check if all contracts are sold and auto-close the trade
      const currentStats = calculateTradeStats()
      const remainingAfterSale = currentStats.remaining - saleFormData.contracts_sold
      
      if (remainingAfterSale === 0 && trade.status === 'open') {
        const { error: updateError } = await supabase
          .from('trades')
          .update({ 
            status: 'closed',
            updated_at: new Date().toISOString()
          })
          .eq('id', trade.id)
        
        if (updateError) {
          console.error('Error updating trade status:', updateError)
        }
      }
      
      // Reset form
      setSaleFormData({
        contracts_sold: 1,
        sell_price: 0,
        sell_date: getCurrentDateLocal(),
        broker: trade.broker || 'Webull'
      })
      setIsAddingSale(false)
      onTradeUpdated()
    } catch (error) {
      console.error('Error adding sale:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trade Details: {trade.option_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Trade Information */}
        <div className="card mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Trade Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Option Name:</span>
              <span className="font-medium dark:text-white">{trade.option_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Type:</span>
              <span className={`font-medium ${trade.type === 'CALL' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trade.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Contracts:</span>
              <span className="font-medium dark:text-white">{stats.totalContracts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Weighted Avg Price:</span>
              <span className="font-medium dark:text-white">${stats.weightedAvgPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Contracts Sold:</span>
              <span className="font-medium dark:text-white">{stats.totalSold}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Remaining:</span>
              <span className="font-medium dark:text-white">{stats.remaining}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                trade.status === 'closed' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }`}>
                {trade.status === 'closed' ? 'Closed' : 'Open'}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="card mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                stats.netPnL >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
              }`}>
                {stats.netPnL >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total P&L</p>
                <p className={`text-xl font-semibold ${
                  stats.netPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stats.netPnL >= 0 ? '+' : ''}${stats.netPnL.toFixed(2)}
                </p>
                {stats.totalFees > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    (fees: ${stats.totalFees.toFixed(2)})
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Sell Price</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  ${stats.averageSellPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div className="card mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Purchase History</h3>
          {contractPurchases.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No purchases recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contracts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contractPurchases.map((purchase) => {
                    const CONTRACT_SIZE = 100
                    const totalValue = purchase.contracts * purchase.purchase_price * CONTRACT_SIZE
                    return (
                      <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {purchase.contracts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${purchase.purchase_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${totalValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {purchase.notes || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Sale Form */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sell Contracts</h3>
            <button
              onClick={() => setIsAddingSale(!isAddingSale)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isAddingSale ? 'Cancel' : 'Add Sale'}
            </button>
          </div>
          
          {isAddingSale && (
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contracts to Sell *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={stats.remaining}
                    value={saleFormData.contracts_sold}
                    onChange={(e) => setSaleFormData({ ...saleFormData, contracts_sold: parseInt(e.target.value) })}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Max: {stats.remaining} contracts
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sell Price per Contract *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={saleFormData.sell_price}
                    onChange={(e) => setSaleFormData({ ...saleFormData, sell_price: parseFloat(e.target.value) })}
                    className="input-field"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total proceeds: ${(saleFormData.contracts_sold * saleFormData.sell_price * 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Broker *
                  </label>
                  <select
                    required
                    value={saleFormData.broker}
                    onChange={(e) => setSaleFormData({ ...saleFormData, broker: e.target.value })}
                    className="input-field"
                  >
                    {getBrokerOptions().map(broker => (
                      <option key={broker} value={broker}>{broker}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sell Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={contractPurchases.length > 0 ? contractPurchases.map(p => p.purchase_date).sort()[0] : getCurrentDateLocal()}
                    max={getCurrentDateLocal()}
                    value={saleFormData.sell_date}
                    onChange={(e) => setSaleFormData({ ...saleFormData, sell_date: e.target.value })}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Between {contractPurchases.length > 0 ? contractPurchases.map(p => p.purchase_date).sort()[0] : 'today'} and today
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSale(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Sale
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sales History */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sales History</h3>
          {contractSales.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No sales recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contracts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Proceeds
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      P&L
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {contractSales.map((sale) => {
                    const CONTRACT_SIZE = 100
                    const proceeds = sale.contracts_sold * sale.sell_price * CONTRACT_SIZE
                    
                    // Calculate weighted average price at the time of this sale
                    const purchasesUpToSale = contractPurchases.filter(p => p.purchase_date <= sale.sell_date)
                    const totalContractsUpToSale = purchasesUpToSale.reduce((sum, p) => sum + p.contracts, 0)
                    const totalInvestmentUpToSale = purchasesUpToSale.reduce((sum, p) => 
                      sum + (p.purchase_price * p.contracts), 0)
                    const weightedAvgPriceAtSale = totalContractsUpToSale > 0 ? 
                      totalInvestmentUpToSale / totalContractsUpToSale : 0
                    
                    const grossSalePnL = (sale.sell_price - weightedAvgPriceAtSale) * sale.contracts_sold * CONTRACT_SIZE
                    
                    // Calculate fees for this specific sale
                    const saleFees = calculateTradeFees(sale.broker, sale.contracts_sold)
                    
                    // Calculate proportional purchase fees for the contracts being sold
                    const proportionalPurchaseFees = purchasesUpToSale.reduce((sum, purchase) => {
                      const purchaseFees = calculateTradeFees(purchase.broker, purchase.contracts)
                      // Calculate the proportion of this purchase that's being sold
                      const proportion = sale.contracts_sold / totalContractsUpToSale
                      return sum + (purchaseFees * proportion)
                    }, 0)
                    
                    const totalFeesForSale = saleFees + proportionalPurchaseFees
                    const salePnL = grossSalePnL - totalFeesForSale
                    return (
                      <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(sale.sell_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {sale.contracts_sold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${sale.sell_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${proceeds.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium ${
                            salePnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {salePnL >= 0 ? '+' : ''}${salePnL.toFixed(2)}
                          </span>
                          {totalFeesForSale > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              (fees: ${totalFeesForSale.toFixed(2)})
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}