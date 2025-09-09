/**
 * Generate option name from ticker, expiry date, and strike price
 * Format: HOOD Sep 26 '25 $110
 */
export function generateOptionName(
  ticker: string, 
  expiryDate: string, 
  strikePrice: number
): string {
  // Parse the expiry date - add 'T00:00:00' to avoid timezone issues
  const date = new Date(expiryDate + 'T00:00:00')
  
  // Format month as abbreviated name
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = monthNames[date.getMonth()]
  
  // Get day
  const day = date.getDate()
  
  // Get year (last 2 digits)
  const year = date.getFullYear().toString().slice(-2)
  
  // Format strike price (remove decimals if .00)
  const strike = strikePrice % 1 === 0 ? strikePrice.toString() : strikePrice.toFixed(2)
  
  return `${ticker} ${month} ${day} '${year} $${strike}`
}

/**
 * Parse option name back to its components
 * Returns null if format doesn't match
 */
export function parseOptionName(optionName: string): {
  ticker: string
  expiryDate: string
  strikePrice: number
} | null {
  // Regex to match format: TICKER Month DD 'YY $Price
  const match = optionName.match(/^([A-Z]+)\s+([A-Za-z]+)\s+(\d+)\s+'(\d{2})\s+\$(\d+(?:\.\d{2})?)$/)
  
  if (!match) return null
  
  const [, ticker, month, day, year, strike] = match
  
  // Convert month name to month number
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = monthNames.indexOf(month)
  if (monthIndex === -1) return null
  
  // Convert 2-digit year to 4-digit
  const fullYear = parseInt('20' + year)
  
  // Create date string - add 'T00:00:00' to avoid timezone issues
  const date = new Date(fullYear, monthIndex, parseInt(day))
  const expiryDate = date.toISOString().split('T')[0]
  
  return {
    ticker,
    expiryDate,
    strikePrice: parseFloat(strike)
  }
}
