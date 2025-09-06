'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase, Trade, ContractSale, ContractPurchase } from '@/lib/supabase'
import Navigation from './Navigation'
import StatsCards from './StatsCards'
import TradeList from './TradeList'
import AddTradeModal from './AddTradeModal'
import AccountValueChart from './AccountValueChart'
// import UserCount from './UserCount' // TODO: Uncomment for Phase 2
import { Plus } from 'lucide-react'

export default function Dashboard() {
  const { user } = useUser()
  const [trades, setTrades] = useState<Trade[]>([])
  const [contractSales, setContractSales] = useState<ContractSale[]>([])
  const [contractPurchases, setContractPurchases] = useState<ContractPurchase[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [totalTrades, setTotalTrades] = useState(0)

  useEffect(() => {
    if (user) {
      fetchTrades()
      fetchContractSales()
      fetchContractPurchases()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchTrades()
    }
  }, [user, currentPage, pageSize])

  const fetchTrades = async () => {
    try {
      // First, get the total count for pagination
      const { count, error: countError } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

      if (countError) throw countError
      setTotalTrades(count || 0)

      // Then fetch the paginated data
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)

      if (error) throw error
      setTrades(data || [])
    } catch (error) {
      console.error('Error fetching trades:', error)
      // Reset to safe state on error
      setTrades([])
      setTotalTrades(0)
    }
  }

  const fetchContractSales = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_sales')
        .select('*')
        .order('sell_date', { ascending: true })

      if (error) throw error
      setContractSales(data || [])
    } catch (error) {
      console.error('Error fetching contract sales:', error)
    }
  }

  const fetchContractPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_purchases')
        .select('*')
        .order('purchase_date', { ascending: true })

      if (error) throw error
      setContractPurchases(data || [])
    } catch (error) {
      console.error('Error fetching contract purchases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTradeAdded = () => {
    setCurrentPage(1) // Reset to first page when adding new trade
    fetchTrades()
    fetchContractSales()
    fetchContractPurchases()
    setIsAddModalOpen(false)
  }

  const handleTradeUpdated = () => {
    fetchTrades()
    fetchContractSales()
    fetchContractPurchases()
  }

  const handleTradeDeleted = () => {
    fetchTrades()
    fetchContractSales()
    fetchContractPurchases()
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.ceil(totalTrades / pageSize)) {
      setCurrentPage(page)
    }
  }

  const handlePageSizeChange = (size: number) => {
    const validSizes = [10, 25, 50, 100]
    if (validSizes.includes(size)) {
      setPageSize(size)
      setCurrentPage(1) // Reset to first page when changing page size
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navigation />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trading Dashboard</h2>
                          <p className="text-gray-600 dark:text-gray-300">Track your options trades (in USD only) and analyze performance</p>
                          {/* PHASE 2: User Count - Commented out for now */}
                          {/* 
                          <div className="mt-2">
                            <UserCount />
                          </div>
                          */}
                        </div>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Trade
                        </button>
                      </div>
                    </div>

        {/* Stats Cards */}
        <StatsCards trades={trades} contractPurchases={contractPurchases} contractSales={contractSales} />

        {/* Trades List */}
        <div className="mt-8">
          <TradeList
            trades={trades}
            contractPurchases={contractPurchases}
            contractSales={contractSales}
            onTradeUpdated={handleTradeUpdated}
            onTradeDeleted={handleTradeDeleted}
            currentPage={currentPage}
            pageSize={pageSize}
            totalTrades={totalTrades}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>

        {/* Account Performance Chart */}
        <div className="mt-8">
          <AccountValueChart trades={trades} contractPurchases={contractPurchases} contractSales={contractSales} />
        </div>
      </div>

      {/* Add Trade Modal */}
      <AddTradeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTradeAdded={handleTradeAdded}
      />
    </div>
  )
}
