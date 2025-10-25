'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

type AuthMode = 'signin' | 'signup'

function SignInContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const searchParams = useSearchParams()
  const { signIn } = useAuth()

  // URLパラメータに基づいてタブを設定
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setAuthMode('signup')
    } else {
      setAuthMode('signin')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await signIn(email)

    if (error) {
      setError(error.message)
    } else {
      const modeText = authMode === 'signup' ? '登録' : 'ログイン'
      setMessage(`${modeText}リンクをメールに送信しました。メールをご確認ください。`)
    }

    setLoading(false)
  }

  const getContent = () => {
    if (authMode === 'signup') {
      return {
        title: '今行ける二郎に新規登録',
        description: 'メールアドレスで簡単に登録できます',
        buttonText: '新規登録リンクを送信',
        features: [
          '✅ 広告なしで快適に利用',
          '🍜 全国の二郎情報をチェック',
          '📍 現在地から近い店舗を検索',
          '⭐ お気に入り店舗の管理'
        ]
      }
    } else {
      return {
        title: '今行ける二郎にログイン',
        description: 'メールアドレスでログインできます',
        buttonText: 'ログインリンクを送信',
        features: [
          '🔐 安全なメール認証',
          '📱 パスワード不要',
          '⚡ 簡単ワンクリックログイン',
          '🔄 自動ログイン状態維持'
        ]
      }
    }
  }

  const content = getContent()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* タブ切り替え */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
              authMode === 'signin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200 ${
              authMode === 'signup'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            新規登録
          </button>
        </div>

        {/* ヘッダー */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {content.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {content.description}
          </p>
        </div>

        {/* 特徴リスト */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 gap-2">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <span className="mr-2">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* フォーム */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !email}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                authMode === 'signup'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  送信中...
                </div>
              ) : (
                content.buttonText
              )}
            </button>
          </div>
        </form>

        {/* 注意事項 */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>
            {authMode === 'signup' 
              ? '※ 新規登録の方は、メール認証後に自動でアカウントが作成されます'
              : '※ 既存のアカウントをお持ちの方は、メール認証でログインできます'
            }
          </p>
          <p>パスワードは不要です。安全なメール認証を使用しています。</p>
        </div>
      </div>
    </div>
  )
}

// Suspenseでラップしたローディング画面
function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* タブ切り替えのスケルトン */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <div className="flex-1 py-2 px-4 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="flex-1 py-2 px-4 bg-gray-200 rounded-md animate-pulse ml-1"></div>
        </div>

        {/* ヘッダーのスケルトン */}
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
        </div>

        {/* 特徴リストのスケルトン */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* フォームのスケルトン */}
        <div className="space-y-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">ページを読み込んでいます...</p>
        </div>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  )
}
