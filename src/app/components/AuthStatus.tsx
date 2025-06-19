'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export function AuthStatus() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">読み込み中...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <Link 
        href="/auth/signin"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        ログイン
      </Link>
    )
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">
            {user.email?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {user.email}
          </p>
          <p className="text-xs text-gray-500">
            ログイン中
          </p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        ログアウト
      </button>
    </div>
  )
}
