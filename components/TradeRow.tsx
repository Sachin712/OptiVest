'use client'

import { useState, useEffect } from 'react'
import { Trade, ContractSale, ContractPurchase, supabase } from '@/lib/supabase'
import { getCurrentDateLocal } from '@/lib/dateUtils'
import { generateOptionName } from '@/lib/optionUtils'
import { Edit, Trash2, Eye, Plus } from 'lucide-react'
import TradeDetailsModal from './TradeDetailsModal'

interface TradeRowProps {
  trade: Trade
  contractPurchases: ContractPurchase[]
  contractSales: ContractSale[]
  isEditing: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onDelete: () => void
  onTradeUpdated: () => void
}

export default function TradeRow({ 
  trade, 
  contractPurchases,
  contractSales,
  isEditing, 
  onEdit, 
  onCancelEdit, 
  onSave, 
  onDelete,
  onTradeUpdated
}: TradeRowProps) {
  const [formData, setFormData] = useState({
    stock_ticker: trade.stock_ticker || '',
    expiry_date: trade.expiry_date || '',
    strike_price: trade.strike_price || 0,
    type: trade.type,
  })
  const [showDetails, setShowDetails] = useState(false)
  const [showAddPurchase, setShowAddPurchase] = useState(false)
  const [purchaseFormData, setPurchaseFormData] = useState({
    contracts: 1,
    purchase_price: 0,
    purchase_date: getCurrentDateLocal(),
    notes: ''
  })

  const calculateTradeStats = () => {
    const CONTRACT_SIZE = 100
    
    // Calculate total contracts from all purchases
    const totalContracts = contractPurchases.reduce((sum, purchase) => sum + purchase.contracts, 0)
    
    // Calculate weighted average purchase price
    const totalInvestment = contractPurchases.reduce((sum, purchase) => 
      sum + (purchase.purchase_price * purchase.contracts), 0)
    const weightedAvgPrice = totalContracts > 0 ? totalInvestment / totalContracts : 0
    
    // Calculate total contracts sold
    const totalSold = contractSales.reduce((sum, sale) => sum + sale.contracts_sold, 0)
    const remaining = totalContracts - totalSold
    
    // Calculate P&L using weighted average price
    const totalPnL = contractSales.reduce((sum, sale) => {
      const profit = (sale.sell_price - weightedAvgPrice) * sale.contracts_sold * CONTRACT_SIZE
      return sum + profit
    }, 0)
    
    // Calculate average sell price
    const totalSellValue = contractSales.reduce((sum, sale) => 
      sum + (sale.sell_price * sale.contracts_sold), 0)
    const averageSellPrice = totalSold > 0 ? totalSellValue / totalSold : 0

    return {
      totalContracts,
      weightedAvgPrice,
      totalSold,
      remaining,
      totalPnL,
      averageSellPrice
    }
  }

  const stats = calculateTradeStats()

  const handleSave = async () => {
    try {
      // Generate new option name from updated fields
      const optionName = generateOptionName(
        formData.stock_ticker.toUpperCase(),
        formData.expiry_date,
        formData.strike_price,
        formData.type
      )

      const { error } = await supabase
        .from('trades')
        .update({
          option_name: optionName,
          stock_ticker: formData.stock_ticker.toUpperCase(),
          expiry_date: formData.expiry_date,
          strike_price: formData.strike_price,
          type: formData.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', trade.id)

      if (error) throw error
      onSave()
    } catch (error) {
      console.error('Error updating trade:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trade? This will also delete all associated purchases and sales.')) {
      try {
        const { error } = await supabase
          .from('trades')
          .delete()
          .eq('id', trade.id)

        if (error) throw error
        onDelete()
      } catch (error) {
        console.error('Error deleting trade:', error)
      }
    }
  }

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const today = getCurrentDateLocal()
    if (purchaseFormData.purchase_date > today) {
      alert('Purchase date cannot be in the future.')
      return
    }

    try {
      const { error } = await supabase
        .from('contract_purchases')
        .insert({
          trade_id: trade.id,
          contracts: purchaseFormData.contracts,
          purchase_price: purchaseFormData.purchase_price,
          purchase_date: purchaseFormData.purchase_date,
          notes: purchaseFormData.notes
        })

      if (error) throw error
      
      // Reset form
      setPurchaseFormData({
        contracts: 1,
        purchase_price: 0,
        purchase_date: getCurrentDateLocal(),
        notes: ''
      })
      setShowAddPurchase(false)
      onTradeUpdated()
    } catch (error) {
      console.error('Error adding purchase:', error)
    }
  }

  if (isEditing) {
    return (
      <tr className="bg-blue-50 dark:bg-blue-900/20">
        <td className="py-4 pl-4 pr-3 sm:pl-0">
          <input
            type="text"
            value={formData.stock_ticker}
            onChange={(e) => setFormData({ ...formData, stock_ticker: e.target.value.toUpperCase() })}
            className="input-field text-sm"
            placeholder="Ticker"
            maxLength={10}
          />
        </td>
        <td className="px-3 py-4">
          <input
            type="date"
            value={formData.expiry_date}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            className="input-field text-sm"
          />
        </td>
        <td className="px-3 py-4">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.strike_price}
            onChange={(e) => setFormData({ ...formData, strike_price: parseFloat(e.target.value) || 0 })}
            className="input-field text-sm"
            placeholder="0.00"
          />
        </td>
        <td className="px-3 py-4">
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'CALL' | 'PUT' })}
            className="input-field text-sm"
          >
            <option value="CALL">CALL</option>
            <option value="PUT">PUT</option>
          </select>
        </td>
        <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
          {stats.totalContracts}
        </td>
        <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
          ${stats.weightedAvgPrice.toFixed(2)}
        </td>
        <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
          {stats.totalSold > 0 ? (
            <span>{stats.totalSold} sold, {stats.remaining} remaining</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">All open</span>
          )}
        </td>
        <td className="px-3 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trade.status === 'closed' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
          }`}>
            {trade.status === 'closed' ? 'Closed' : 'Open'}
          </span>
        </td>
        <td className="px-3 py-4">
          <span className={`text-sm font-medium ${
            stats.totalPnL >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
          </span>
        </td>
        <td className="px-3 py-4">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
            >
              ✓
            </button>
            <button
              onClick={onCancelEdit}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <>
      <tr 
        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        onClick={() => setShowDetails(true)}
      >
        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0">
          {trade.option_name}
        </td>
        <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trade.type === 'CALL' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {trade.type}
          </span>
        </td>
        <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
          {stats.totalContracts}
        </td>
        <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
          ${stats.weightedAvgPrice.toFixed(2)}
        </td>
        <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
          {stats.totalSold > 0 ? (
            <span>{stats.totalSold} sold, {stats.remaining} remaining</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">All open</span>
          )}
        </td>
        <td className="px-3 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            trade.status === 'closed' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
          }`}>
            {trade.status === 'closed' ? 'Closed' : 'Open'}
          </span>
        </td>
        <td className="px-3 py-4">
          <span className={`text-sm font-medium ${
            stats.totalPnL >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}
          </span>
        </td>
        <td className="px-3 py-4">
          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDetails(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
              title="Edit Trade"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddPurchase(true)}
              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
              title="Add Purchase"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
              title="Delete Trade"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Add Purchase Modal */}
      {showAddPurchase && (
        <tr>
          <td colSpan={8} className="px-4 py-4 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-md mx-auto">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Add Purchase for {trade.option_name}
              </h4>
              <form onSubmit={handleAddPurchase} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contracts *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={purchaseFormData.contracts}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, contracts: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Price per Contract *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={purchaseFormData.purchase_price}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, purchase_price: parseFloat(e.target.value) })}
                    className="input-field"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total investment: ${(purchaseFormData.contracts * purchaseFormData.purchase_price * 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    max={getCurrentDateLocal()}
                    value={purchaseFormData.purchase_date}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, purchase_date: e.target.value })}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Cannot be in the future
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={purchaseFormData.notes}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, notes: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Optional notes about this purchase..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Add Purchase
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPurchase(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </td>
        </tr>
      )}

      {/* Trade Details Modal */}
      {showDetails && (
        <TradeDetailsModal
          trade={trade}
          contractPurchases={contractPurchases}
          contractSales={contractSales}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onTradeUpdated={onTradeUpdated}
        />
      )}
    </>
  )
}