'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return
    
    setIsSigningOut(true)
    try {
      // Sign out from Clerk
      await signOut()
      
      // Force redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      // Fallback redirect
      window.location.href = '/'
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
    </button>
  )
}
