'use client'

import { useState, useEffect, useRef } from 'react'
import { Trade } from '@/lib/supabase'
import { Filter, X, ChevronDown } from 'lucide-react'

interface TradeFiltersProps {
  trades: Trade[]
  onFiltersChange: (filters: FilterState) => void
}

export interface FilterState {
  selectedTickers: string[]
  selectedTypes: ('CALL' | 'PUT')[]
  selectedStatuses: ('open' | 'closed')[]
}

export default function TradeFilters({ trades, onFiltersChange }: TradeFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    selectedTickers: [],
    selectedTypes: [],
    selectedStatuses: []
  })
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTickerDropdownOpen, setIsTickerDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get unique values for filter options
  const uniqueTickers = Array.from(new Set(trades.map(trade => trade.stock_ticker))).sort()
  const uniqueTypes = Array.from(new Set(trades.map(trade => trade.type))) as ('CALL' | 'PUT')[]
  const uniqueStatuses = Array.from(new Set(trades.map(trade => trade.status))) as ('open' | 'closed')[]

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const toggleTicker = (ticker: string) => {
    const newTickers = filters.selectedTickers.includes(ticker)
      ? filters.selectedTickers.filter(t => t !== ticker)
      : [...filters.selectedTickers, ticker]
    updateFilters({ selectedTickers: newTickers })
  }

  const toggleType = (type: 'CALL' | 'PUT') => {
    const newTypes = filters.selectedTypes.includes(type)
      ? filters.selectedTypes.filter(t => t !== type)
      : [...filters.selectedTypes, type]
    updateFilters({ selectedTypes: newTypes })
  }

  const toggleStatus = (status: 'open' | 'closed') => {
    const newStatuses = filters.selectedStatuses.includes(status)
      ? filters.selectedStatuses.filter(s => s !== status)
      : [...filters.selectedStatuses, status]
    updateFilters({ selectedStatuses: newStatuses })
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      selectedTickers: [],
      selectedTypes: [],
      selectedStatuses: []
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = filters.selectedTickers.length > 0 || 
                          filters.selectedTypes.length > 0 || 
                          filters.selectedStatuses.length > 0

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTickerDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
              {filters.selectedTickers.length + filters.selectedTypes.length + filters.selectedStatuses.length} active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Stock Ticker Filters */}
          {uniqueTickers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Tickers</h4>
              <div className="space-y-2">
                {/* Custom Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsTickerDropdownOpen(!isTickerDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors flex items-center justify-between"
                  >
                    <span className="text-left">
                      {filters.selectedTickers.length === 0 
                        ? 'Select tickers...' 
                        : `${filters.selectedTickers.length} ticker${filters.selectedTickers.length === 1 ? '' : 's'} selected`
                      }
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isTickerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isTickerDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {uniqueTickers.map(ticker => (
                        <label
                          key={ticker}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.selectedTickers.includes(ticker)}
                            onChange={() => toggleTicker(ticker)}
                            className="mr-2 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{ticker}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected Ticker Tags */}
                {filters.selectedTickers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.selectedTickers.map(ticker => (
                      <span
                        key={ticker}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      >
                        {ticker}
                        <button
                          onClick={() => toggleTicker(ticker)}
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Type Filters */}
          {uniqueTypes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Option Types</h4>
              <div className="flex flex-wrap gap-2">
                {uniqueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.selectedTypes.includes(type)
                        ? type === 'CALL'
                          ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Filters */}
          {uniqueStatuses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trade Status</h4>
              <div className="flex flex-wrap gap-2">
                {uniqueStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.selectedStatuses.includes(status)
                        ? status === 'closed'
                          ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status === 'closed' ? 'Closed' : 'Open'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
