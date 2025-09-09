import { ContractPurchase, ContractSale, Trade } from './supabase'
import { BROKER_FEES } from './brokerConfig'

const CONTRACT_SIZE = 100

function calculateTradeFees(broker: string, contracts: number): number {
  const fee = BROKER_FEES.find(f => f.broker === broker)
  if (!fee) return 0
  
  // Calculate total fees: contract fee × number of contracts
  const totalFees = fee.contractFee * contracts
  
  return totalFees
}

export interface TradeStats {
  totalContracts: number
  weightedAvgPrice: number
  totalSold: number
  remaining: number
  totalPnL: number
  totalFees: number
  netPnL: number
  averageSellPrice: number
}

export function calculateTradeStatsWithFees(
  trade: Trade,
  contractPurchases: ContractPurchase[],
  contractSales: ContractSale[]
): TradeStats {
  // Calculate total contracts from all purchases
  const totalContracts = contractPurchases.reduce((sum, purchase) => sum + purchase.contracts, 0)
  
  // Calculate weighted average purchase price
  const totalInvestment = contractPurchases.reduce((sum, purchase) => 
    sum + (purchase.purchase_price * purchase.contracts), 0)
  const weightedAvgPrice = totalContracts > 0 ? totalInvestment / totalContracts : 0
  
  // Calculate total contracts sold
  const totalSold = contractSales.reduce((sum, sale) => sum + sale.contracts_sold, 0)
  const remaining = totalContracts - totalSold
  
  // Calculate total fees for purchases
  const purchaseFees = contractPurchases.reduce((sum, purchase) => {
    const fees = calculateTradeFees(purchase.broker, purchase.contracts)
    return sum + fees
  }, 0)
  
  // Calculate total fees for sales
  const saleFees = contractSales.reduce((sum, sale) => {
    const fees = calculateTradeFees(sale.broker, sale.contracts_sold)
    return sum + fees
  }, 0)
  
  const totalFees = purchaseFees + saleFees
  
  // Calculate P&L using weighted average price (before fees)
  const grossPnL = contractSales.reduce((sum, sale) => {
    const profit = (sale.sell_price - weightedAvgPrice) * sale.contracts_sold * CONTRACT_SIZE
    return sum + profit
  }, 0)
  
  // Calculate net P&L (after fees)
  const netPnL = grossPnL - totalFees
  
  // Calculate average sell price
  const totalSellValue = contractSales.reduce((sum, sale) => 
    sum + (sale.sell_price * sale.contracts_sold), 0)
  const averageSellPrice = totalSold > 0 ? totalSellValue / totalSold : 0

  return {
    totalContracts,
    weightedAvgPrice,
    totalSold,
    remaining,
    totalPnL: grossPnL, // Keep original P&L for backward compatibility
    totalFees,
    netPnL,
    averageSellPrice
  }
}

export function calculatePortfolioStatsWithFees(
  trades: Trade[],
  contractPurchases: ContractPurchase[],
  contractSales: ContractSale[]
) {
  // Calculate total investment using: Total Purchases - Total Sales
  const totalPurchases = contractPurchases.reduce((sum, purchase) => {
    return sum + (purchase.purchase_price * purchase.contracts * CONTRACT_SIZE)
  }, 0)
  
  const totalSales = contractSales.reduce((sum, sale) => {
    return sum + (sale.sell_price * sale.contracts_sold * CONTRACT_SIZE)
  }, 0)
  
  const totalInvestment = totalPurchases - totalSales
  
  // Calculate total fees
  const totalFees = contractPurchases.reduce((sum, purchase) => {
    const fees = calculateTradeFees(purchase.broker, purchase.contracts)
    return sum + fees
  }, 0) + contractSales.reduce((sum, sale) => {
    const fees = calculateTradeFees(sale.broker, sale.contracts_sold)
    return sum + fees
  }, 0)
  
  // Calculate gross P&L using weighted average purchase prices
  const grossPnL = contractSales.reduce((sum, sale) => {
    const trade = trades.find(t => t.id === sale.trade_id)
    if (!trade) return sum
    
    // Find all purchases for this trade
    const tradePurchases = contractPurchases.filter(p => p.trade_id === sale.trade_id)
    
    if (tradePurchases.length === 0) return sum
    
    // Calculate weighted average purchase price for this trade
    const totalContracts = tradePurchases.reduce((sum, p) => sum + p.contracts, 0)
    const weightedAvgPrice = tradePurchases.reduce((sum, p) => 
      sum + (p.purchase_price * p.contracts), 0) / totalContracts
    
    const profit = (sale.sell_price - weightedAvgPrice) * sale.contracts_sold * CONTRACT_SIZE
    return sum + profit
  }, 0)
  
  // Calculate net P&L (after fees)
  const netPnL = grossPnL - totalFees
  
  // Calculate successful trades percentage
  const tradesWithSales = trades.filter(trade => {
    const tradeSales = contractSales.filter(s => s.trade_id === trade.id)
    return tradeSales.length > 0
  })
  
  const profitableTrades = tradesWithSales.filter(trade => {
    const tradePurchases = contractPurchases.filter(p => p.trade_id === trade.id)
    const tradeSales = contractSales.filter(s => s.trade_id === trade.id)
    
    if (tradePurchases.length === 0 || tradeSales.length === 0) return false
    
    const totalContracts = tradePurchases.reduce((sum, p) => sum + p.contracts, 0)
    const weightedAvgPrice = tradePurchases.reduce((sum, p) => 
      sum + (p.purchase_price * p.contracts), 0) / totalContracts
    
    const tradeGrossPnL = tradeSales.reduce((sum, sale) => {
      const profit = (sale.sell_price - weightedAvgPrice) * sale.contracts_sold * CONTRACT_SIZE
      return sum + profit
    }, 0)
    
    // Calculate trade fees
    const tradePurchaseFees = tradePurchases.reduce((sum, purchase) => {
      const fees = calculateTradeFees(purchase.broker, purchase.contracts)
      return sum + fees
    }, 0)
    
    const tradeSaleFees = tradeSales.reduce((sum, sale) => {
      const fees = calculateTradeFees(sale.broker, sale.contracts_sold)
      return sum + fees
    }, 0)
    
    const tradeNetPnL = tradeGrossPnL - tradePurchaseFees - tradeSaleFees
    
    return tradeNetPnL > 0
  })
  
  const successfulTradesPercentage = tradesWithSales.length > 0 
    ? (profitableTrades.length / tradesWithSales.length) * 100 
    : 0
  
  return {
    totalInvestment: totalInvestment.toFixed(2),
    totalPnL: grossPnL.toFixed(2), // Keep original for backward compatibility
    netPnL: netPnL.toFixed(2),
    totalFees: totalFees.toFixed(2),
    successfulTradesPercentage: successfulTradesPercentage.toFixed(1),
    isPnLPositive: netPnL >= 0
  }
}
