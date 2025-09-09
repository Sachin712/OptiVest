'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase, TradeFormData } from '@/lib/supabase'
import { getCurrentDateLocal } from '@/lib/dateUtils'
import { generateOptionName } from '@/lib/optionUtils'
import { getBrokerOptions } from '@/lib/brokerConfig'
import { X } from 'lucide-react'

interface AddTradeModalProps {
  isOpen: boolean
  onClose: () => void
  onTradeAdded: () => void
}

export default function AddTradeModal({ isOpen, onClose, onTradeAdded }: AddTradeModalProps) {
  const { user } = useUser()
  const [formData, setFormData] = useState<TradeFormData>({
    stock_ticker: '',
    expiry_date: '',
    strike_price: 0,
    type: 'CALL',
    contracts: 1,
    purchase_price: 0,
    purchase_date: getCurrentDateLocal(),
    notes: '',
    broker: 'Webull'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate required fields
    if (!formData.stock_ticker.trim()) {
      alert('Stock ticker is required.')
      return
    }
    if (!formData.expiry_date) {
      alert('Expiry date is required.')
      return
    }
    if (formData.strike_price <= 0) {
      alert('Strike price must be greater than 0.')
      return
    }

    // Validate purchase date is not in the future
    const today = getCurrentDateLocal()
    if (formData.purchase_date > today) {
      alert('Purchase date cannot be in the future.')
      return
    }

    setIsSubmitting(true)
    try {
      // Generate option name from ticker, expiry, and strike
      const optionName = generateOptionName(
        formData.stock_ticker.toUpperCase(),
        formData.expiry_date,
        formData.strike_price
      )

      // First, create the trade
      const { data: tradeData, error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          option_name: optionName,
          stock_ticker: formData.stock_ticker.toUpperCase(),
          expiry_date: formData.expiry_date,
          strike_price: formData.strike_price,
          type: formData.type,
          status: 'open',
          broker: formData.broker,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (tradeError) throw tradeError

      const tradeId = tradeData[0].id

      // Then, create the first purchase
      const { error: purchaseError } = await supabase
        .from('contract_purchases')
        .insert({
          trade_id: tradeId,
          contracts: formData.contracts,
          purchase_price: formData.purchase_price,
          purchase_date: formData.purchase_date,
          notes: formData.notes,
          broker: formData.broker,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (purchaseError) throw purchaseError

      // Reset form
      setFormData({
        stock_ticker: '',
        expiry_date: '',
        strike_price: 0,
        type: 'CALL',
        contracts: 1,
        purchase_price: 0,
        purchase_date: getCurrentDateLocal(),
        notes: '',
        broker: 'Webull'
      })

      onTradeAdded()
    } catch (error) {
      console.error('Error adding trade:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Trade</h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="stock_ticker" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Ticker *
              </label>
              <input
                type="text"
                id="stock_ticker"
                required
                value={formData.stock_ticker}
                onChange={(e) => setFormData({ ...formData, stock_ticker: e.target.value.toUpperCase() })}
                className="input-field"
                placeholder="QQQ, SPXW, HOOD, etc."
                maxLength={10}
              />
            </div>

            <div>
              <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Option Expiry *
              </label>
              <input
                type="date"
                id="expiry_date"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="strike_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Strike Price *
              </label>
              <input
                type="number"
                id="strike_price"
                required
                step="0.01"
                min="0.01"
                value={formData.strike_price}
                onChange={(e) => setFormData({ ...formData, strike_price: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'CALL' | 'PUT' })}
                className="input-field"
              >
                <option value="CALL">CALL</option>
                <option value="PUT">PUT</option>
              </select>
            </div>

            <div>
              <label htmlFor="broker" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Broker *
              </label>
              <select
                id="broker"
                required
                value={formData.broker}
                onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                className="input-field"
              >
                {getBrokerOptions().map(broker => (
                  <option key={broker} value={broker}>{broker}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contracts" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contracts *
              </label>
              <input
                type="number"
                id="contracts"
                required
                min="1"
                value={formData.contracts}
                onChange={(e) => setFormData({ ...formData, contracts: parseInt(e.target.value) })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Each contract = 100 shares of the underlying stock
              </p>
            </div>

            <div>
              <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Price per Contract *
              </label>
              <input
                type="number"
                id="purchase_price"
                required
                step="0.01"
                min="0"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                className="input-field"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total investment: ${(formData.contracts * formData.purchase_price * 100).toFixed(2)}
              </p>
            </div>

            <div>
              <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                id="purchase_date"
                required
                max={getCurrentDateLocal()}
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Cannot be in the future
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Optional notes about this trade..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Trade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
