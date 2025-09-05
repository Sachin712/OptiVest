'use client'

import { useState } from 'react'
import { Trade, ContractPurchase, ContractSale } from '@/lib/supabase'
import TradeRow from './TradeRow'
import { Edit, Trash2 } from 'lucide-react'

interface TradeListProps {
  trades: Trade[]
  contractPurchases: ContractPurchase[]
  contractSales: ContractSale[]
  onTradeUpdated: () => void
  onTradeDeleted: () => void
}

export default function TradeList({ trades, contractPurchases, contractSales, onTradeUpdated, onTradeDeleted }: TradeListProps) {
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)

  if (trades.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No trades yet</p>
          <p className="text-sm">Start by adding your first options trade</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Trades</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all your options trades and their current status. Click any row to view details and manage contracts.
            </p>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0">
                      Option Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Type
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Contracts
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Purchase Price
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Trade Status
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      P&L
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {trades.map((trade) => {
                    const tradePurchases = contractPurchases.filter(p => p.trade_id === trade.id)
                    const tradeSales = contractSales.filter(s => s.trade_id === trade.id)
                    
                    return (
                      <TradeRow
                        key={trade.id}
                        trade={trade}
                        contractPurchases={tradePurchases}
                        contractSales={tradeSales}
                        isEditing={editingTrade?.id === trade.id}
                        onEdit={() => setEditingTrade(trade)}
                        onCancelEdit={() => setEditingTrade(null)}
                        onSave={() => {
                          setEditingTrade(null)
                          onTradeUpdated()
                        }}
                        onDelete={() => onTradeDeleted()}
                        onTradeUpdated={onTradeUpdated}
                      />
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
