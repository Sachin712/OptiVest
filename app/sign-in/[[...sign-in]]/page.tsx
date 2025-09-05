import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to OptiVest
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Sign in to your trading logbook
          </p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
