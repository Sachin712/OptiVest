/**
 * Get current date in the user's local timezone formatted as YYYY-MM-DD
 * This ensures the date picker shows the correct local date for any timezone
 */
export function getCurrentDateLocal(): string {
  const now = new Date()
  
  // Get the local date in the user's timezone
  // This automatically handles all timezones and daylight saving time
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Get current date in EST timezone formatted as YYYY-MM-DD
 * This is kept for backward compatibility and specific EST requirements
 */
export function getCurrentDateEST(): string {
  const now = new Date()
  
  // Convert to EST (UTC-5) or EDT (UTC-4) based on daylight saving time
  const estOffset = -5 * 60 // EST is UTC-5
  const edtOffset = -4 * 60 // EDT is UTC-4
  
  // Simple daylight saving time check (second Sunday in March to first Sunday in November)
  const year = now.getFullYear()
  const march = new Date(year, 2, 1) // March 1st
  const november = new Date(year, 10, 1) // November 1st
  
  // Find second Sunday in March
  const secondSundayMarch = new Date(year, 2, 1)
  secondSundayMarch.setDate(1 + (7 - march.getDay()) % 7 + 7)
  
  // Find first Sunday in November
  const firstSundayNovember = new Date(year, 10, 1)
  firstSundayNovember.setDate(1 + (7 - november.getDay()) % 7)
  
  // Determine if we're in daylight saving time
  const isDST = now >= secondSundayMarch && now < firstSundayNovember
  const offset = isDST ? edtOffset : estOffset
  
  // Apply timezone offset
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const estDate = new Date(utc + (offset * 60000))
  
  return estDate.toISOString().split('T')[0]
}

/**
 * Check if a date is today in the user's local timezone
 */
export function isTodayLocal(dateString: string): boolean {
  return dateString === getCurrentDateLocal()
}

/**
 * Check if a date is today in EST
 */
export function isTodayEST(dateString: string): boolean {
  return dateString === getCurrentDateEST()
}

/**
 * Check if a date is in the future (in user's local timezone)
 */
export function isFutureDate(dateString: string): boolean {
  return dateString > getCurrentDateLocal()
}

/**
 * Check if a date is in the future (in EST)
 */
export function isFutureDateEST(dateString: string): boolean {
  return dateString > getCurrentDateEST()
}
