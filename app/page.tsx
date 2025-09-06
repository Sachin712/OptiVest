import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
// import UserCount from '@/components/UserCount' // TODO: Uncomment for Phase 2
// import PricingSection from '@/components/PricingSection' // TODO: Uncomment for Phase 2

export default async function HomePage() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600 dark:text-blue-400">OptiVest</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
            Your comprehensive trading logbook for tracking options trades, analyzing performance, 
            and making data-driven investment decisions.
          </p>
          
          {/* PHASE 2: User Count - Commented out for now */}
          {/* 
          <div className="flex justify-center mb-8">
            <UserCount />
          </div>
          */}
  
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/sign-up"
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </Link>
            <Link 
              href="/sign-in"
              className="btn-secondary text-lg px-8 py-3"
            >
              Sign In
            </Link>
          </div>

          {/* Features Section - Moved back to original position */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
                        <div className="card text-center">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Track Trades</h3>
                          <p className="text-gray-600 dark:text-gray-300">Log every options trade with detailed information and real-time updates.</p>
                        </div>

                        <div className="card text-center">
                          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analyze Performance</h3>
                          <p className="text-gray-600 dark:text-gray-300">Get insights into your P&L, success ratio, and overall trading performance.</p>
                        </div>

                        <div className="card text-center">
                          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure & Private</h3>
                          <p className="text-gray-600 dark:text-gray-300">Your data is protected with enterprise-grade security and privacy controls.</p>
                        </div>
          </div>
        </div>
      </div>
      
      {/* PHASE 2: Pricing Section - Commented out for now */}
      {/* 
      <PricingSection />
      */}
                </div>
              )
}
