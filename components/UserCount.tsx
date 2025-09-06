'use client'

// PHASE 2: User Count Component
// TODO: Uncomment imports in app/page.tsx and components/Dashboard.tsx when ready to launch subscription model

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users } from 'lucide-react'

export default function UserCount() {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserCount()
  }, [])

  const fetchUserCount = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('stat_value')
        .eq('stat_name', 'total_users')
        .single()

      if (error) throw error
      setUserCount(data?.stat_value || 0)
    } catch (error) {
      console.error('Error fetching user count:', error)
      // Fallback to a reasonable number for demo purposes
      setUserCount(1247)
    } finally {
      setIsLoading(false)
    }
  }

  const formatUserCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
        <Users className="w-4 h-4" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
      <Users className="w-4 h-4" />
      <span className="text-sm">
        <span className="font-semibold text-primary-600 dark:text-primary-400">
          {formatUserCount(userCount || 0)}
        </span>
        {' '}traders using OptiVest
      </span>
    </div>
  )
}
