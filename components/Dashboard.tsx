'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase, Trade, ContractSale, ContractPurchase } from '@/lib/supabase'
import Navigation from './Navigation'
import StatsCards from './StatsCards'
import TradeList from './TradeList'
import AddTradeModal from './AddTradeModal'
import AccountValueChart from './AccountValueChart'
import { Plus } from 'lucide-react'

export default function Dashboard() {
  const { user } = useUser()
  const [trades, setTrades] = useState<Trade[]>([])
  const [contractSales, setContractSales] = useState<ContractSale[]>([])
  const [contractPurchases, setContractPurchases] = useState<ContractPurchase[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTrades()
      fetchContractSales()
      fetchContractPurchases()
    }
  }, [user])

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrades(data || [])
    } catch (error) {
      console.error('Error fetching trades:', error)
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
