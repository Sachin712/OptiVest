import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Trade {
  id: string
  user_id: string
  option_name: string
  stock_ticker: string
  expiry_date: string
  strike_price: number
  type: 'CALL' | 'PUT'
  status: 'open' | 'closed'
  broker: string
  created_at: string
  updated_at: string
}

export interface ContractPurchase {
  id: string
  trade_id: string
  contracts: number
  purchase_price: number
  purchase_date: string
  notes?: string
  broker: string
  created_at: string
  updated_at: string
}

export interface ContractSale {
  id: string
  trade_id: string
  contracts_sold: number
  sell_price: number
  sell_date: string
  broker: string
  created_at: string
}

export interface TradeWithPurchases extends Trade {
  contract_purchases: ContractPurchase[]
  contract_sales: ContractSale[]
  total_contracts: number
  weighted_avg_price: number
  total_contracts_sold: number
  remaining_contracts: number
  average_sell_price: number | null
  total_realized_pnl: number
}

export interface TradeFormData {
  stock_ticker: string
  expiry_date: string
  strike_price: number
  type: 'CALL' | 'PUT'
  contracts: number
  purchase_price: number
  purchase_date: string
  notes?: string
  broker: string
}

export interface ContractPurchaseFormData {
  contracts: number
  purchase_price: number
  purchase_date: string
  notes?: string
}

export interface ContractSaleFormData {
  contracts_sold: number
  sell_price: number
  sell_date: string
  broker: string
}

export interface SupportTicket {
  id: string
  reference_id: string
  user_id: string
  user_email: string
  issue_summary: string
  detailed_description: string
  attachment_url?: string
  attachment_filename?: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
}

export interface SupportTicketFormData {
  user_email: string
  issue_summary: string
  detailed_description: string
  attachment?: File
}
