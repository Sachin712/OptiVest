'use client'

import { useState, useMemo } from 'react'
import { Trade, ContractPurchase, ContractSale } from '@/lib/supabase'
import TradeRow from './TradeRow'
import Pagination from './Pagination'
import TradeFilters, { FilterState } from './TradeFilters'
import { Edit, Trash2 } from 'lucide-react'

interface TradeListProps {
  trades: Trade[]
  contractPurchases: ContractPurchase[]
  contractSales: ContractSale[]
  onTradeUpdated: () => void
  onTradeDeleted: () => void
  currentPage: number
  pageSize: number
  totalTrades: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export default function TradeList({ 
  trades, 
  contractPurchases, 
  contractSales, 
  onTradeUpdated, 
  onTradeDeleted,
  currentPage,
  pageSize,
  totalTrades,
  onPageChange,
  onPageSizeChange
}: TradeListProps) {
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    selectedTickers: [],
    selectedTypes: [],
    selectedStatuses: []
  })

  // Apply filters to trades
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      // Filter by ticker
      if (filters.selectedTickers.length > 0 && !filters.selectedTickers.includes(trade.stock_ticker)) {
        return false
      }
      
      // Filter by type
      if (filters.selectedTypes.length > 0 && !filters.selectedTypes.includes(trade.type)) {
        return false
      }
      
      // Filter by status
      if (filters.selectedStatuses.length > 0 && !filters.selectedStatuses.includes(trade.status)) {
        return false
      }
      
      return true
    })
  }, [trades, filters])

  const totalPages = Math.ceil(filteredTrades.length / pageSize)

  if (trades.length === 0 && currentPage === 1) {
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
    <div className="card overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <TradeFilters trades={trades} onFiltersChange={setFilters} />
        
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Trades</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all your options trades and their current status. Click any row to view details and manage contracts.
              {filteredTrades.length !== trades.length && (
                <span className="text-blue-600 dark:text-blue-400">
                  {' '}(Showing {filteredTrades.length} of {trades.length} trades)
                </span>
              )}
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
                  {filteredTrades.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((trade) => {
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
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          pageSize={pageSize}
          totalItems={filteredTrades.length}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  )
}
