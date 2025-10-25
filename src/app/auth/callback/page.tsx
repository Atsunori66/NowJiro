'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type AuthStatus = 'loading' | 'success' | 'error'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Magic Link認証後のセッション確立を待つ
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('認証エラー:', error)
          setStatus('error')
          setError('認証処理中にエラーが発生しました')
          setTimeout(() => router.push('/auth/signin?error=auth_error'), 3000)
          return
        }

        if (data.session) {
          console.log('認証成功:', data.session.user.email)
          setUserEmail(data.session.user.email || null)
          setStatus('success')
          
          // 成功メッセージを少し表示してからリダイレクト
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          // セッションがまだ確立されていない場合、少し待ってから再試行
          console.log('セッション確立を待機中...')
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase.auth.getSession()
            
            if (retryError) {
              console.error('再試行エラー:', retryError)
              setStatus('error')
              setError('認証に失敗しました')
              setTimeout(() => router.push('/auth/signin'), 3000)
              return
            }

            if (retryData.session) {
              console.log('認証成功（再試行）:', retryData.session.user.email)
              setUserEmail(retryData.session.user.email || null)
              setStatus('success')
              setTimeout(() => {
                router.push('/')
              }, 2000)
            } else {
              console.log('セッション確立に失敗')
              setStatus('error')
              setError('認証に失敗しました')
              setTimeout(() => router.push('/auth/signin'), 3000)
            }
          }, 1000)
        }
      } catch (err) {
        console.error('認証コールバック処理エラー:', err)
        setStatus('error')
        setError('予期しないエラーが発生しました')
        setTimeout(() => router.push('/auth/signin'), 3000)
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center p-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              認証エラー
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-700">
                サインインページに自動でリダイレクトします...
              </p>
            </div>
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              今すぐサインインページに戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center p-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-green-500 text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              認証完了！
            </h2>
            <p className="text-gray-600 mb-2">
              {userEmail && (
                <span className="font-medium text-blue-600">{userEmail}</span>
              )}
            </p>
            <p className="text-gray-600 mb-6">
              ログインが完了しました
            </p>
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <p className="text-sm text-green-700">
                🍜 今行ける二郎にリダイレクトしています...
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-blue-500 text-4xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            認証処理中...
          </h2>
          <p className="text-gray-600 mb-6">
            メール認証を確認しています
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-700">
              セッションを安全に確立しています
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-500">処理中...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Suspenseでラップしたローディング画面
function AuthCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-blue-500 text-4xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            認証処理中...
          </h2>
          <p className="text-gray-600 mb-6">
            ページを読み込んでいます
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-500">読み込み中...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
