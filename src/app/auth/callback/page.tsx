'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Magic Link認証後のセッション確立を待つ
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('認証エラー:', error)
          setError('認証処理中にエラーが発生しました')
          setTimeout(() => router.push('/auth/signin?error=auth_error'), 2000)
          return
        }

        if (data.session) {
          console.log('認証成功:', data.session.user.email)
          // 認証成功 - ホームページにリダイレクト
          router.push('/')
        } else {
          // セッションがまだ確立されていない場合、少し待ってから再試行
          console.log('セッション確立を待機中...')
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase.auth.getSession()
            
            if (retryError) {
              console.error('再試行エラー:', retryError)
              setError('認証に失敗しました')
              setTimeout(() => router.push('/auth/signin'), 2000)
              return
            }

            if (retryData.session) {
              console.log('認証成功（再試行）:', retryData.session.user.email)
              router.push('/')
            } else {
              console.log('セッション確立に失敗')
              setError('認証に失敗しました')
              setTimeout(() => router.push('/auth/signin'), 2000)
            }
          }, 1000)
        }
      } catch (err) {
        console.error('認証コールバック処理エラー:', err)
        setError('予期しないエラーが発生しました')
        setTimeout(() => router.push('/auth/signin'), 2000)
      } finally {
        setIsLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            認証エラー
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <p className="text-sm text-gray-500">サインインページにリダイレクトします...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          認証処理中...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isLoading ? 'セッションを確立しています' : '処理を完了しています'}
        </p>
      </div>
    </div>
  )
}
