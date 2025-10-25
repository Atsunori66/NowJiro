'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    // bodyタグにdata属性を追加
    document.body.setAttribute('data-auth-page', 'true')
    document.body.setAttribute('data-pathname', pathname)
    
    // クリーンアップ
    return () => {
      document.body.removeAttribute('data-auth-page')
      document.body.removeAttribute('data-pathname')
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
