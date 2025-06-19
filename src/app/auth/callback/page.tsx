'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('認証エラー:', error)
        router.push('/auth/error')
        return
      }

      if (data.session) {
        // 認証成功 - ホームページにリダイレクト
        router.push('/')
      } else {
        // セッションがない場合はサインインページへ
        router.push('/auth/signin')
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">認証処理中...</p>
      </div>
    </div>
  )
}
