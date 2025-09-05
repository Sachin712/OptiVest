'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import SignOutButton from './SignOutButton'
import ThemeToggle from './ThemeToggle'
import { HelpCircle } from 'lucide-react'

export default function Navigation() {
  const { user } = useUser()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OptiVest</h1>
          </Link>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </span>
            <Link
              href="/support"
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Support"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
