import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'OptiVest - Trading Logbook',
  description: 'Track your options trades and analyze your performance with OptiVest, the comprehensive trading logbook for serious traders.',
  keywords: 'trading, options, logbook, portfolio, P&L, performance tracking',
  authors: [{ name: 'OptiVest Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'OptiVest - Trading Logbook',
    description: 'Track your options trades and analyze your performance',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OptiVest - Trading Logbook',
    description: 'Track your options trades and analyze your performance',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        </head>
        <body className={inter.className}>
          <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
