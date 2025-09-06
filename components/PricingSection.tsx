'use client'

// PHASE 2: Pricing Section Component
// TODO: Uncomment import in app/page.tsx when ready to launch subscription model

import Link from 'next/link'
import { Check, Star, Zap } from 'lucide-react'

export default function PricingSection() {
  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start your trading journey with a free trial, then continue with our affordable premium plan
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Free Trial Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative">
            {/* Free Trial Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 text-sm font-medium transform rotate-12 translate-x-2 -translate-y-1">
              FREE TRIAL
            </div>
            
            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  OptiVest Pro
                </h3>
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$5 USD</span>
                  <span className="text-gray-600 dark:text-gray-300 ml-2">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  After 7-day free trial
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Unlimited trades</strong> - Track as many options as you want
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Advanced analytics</strong> - Detailed P&L and performance insights
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Smart filtering</strong> - Find trades by ticker, type, and status
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Performance charts</strong> - Visualize your trading journey
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Priority support</strong> - Get help when you need it
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Data export</strong> - Download your trades anytime
                  </span>
                </li>
              </ul>

              {/* CTA Button */}
              <Link
                href="/sign-up"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Star className="w-5 h-5" />
                <span>Start Free Trial</span>
              </Link>

              {/* Trial Info */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No credit card required • Cancel anytime
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Trial starts immediately after signup
                </p>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="mt-8 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Why OptiVest Pro?
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                At just <strong>$5/month</strong>, you get professional-grade trading analytics that would cost hundreds elsewhere. 
                That's less than a coffee per week to improve your trading performance.
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>4.9/5 rating</span>
              </div>
              <div>•</div>
              <div>1,200+ active traders</div>
              <div>•</div>
              <div>99.9% uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
