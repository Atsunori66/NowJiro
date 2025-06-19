'use client';
import { useState, useEffect } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  // 認証済みユーザーのメールアドレスを自動設定
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/checkout_sessions', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        throw new Error('エラーが発生しました');
      }
      
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      setError('エラーが発生しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          広告非表示プラン
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          月額1ドルで広告を非表示にできます
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        
        <button
          onClick={handleSubscribe}
          disabled={loading || !email}
          className="w-full flex items-center justify-center px-4 py-3 bg-yellow-300 hover:bg-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              処理中...
            </>
          ) : (
            <>
              <CreditCardIcon className="h-5 w-5 mr-2" />
              登録する（$1/月）
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Stripeによる安全な決済処理
        </p>
      </div>
    </div>
  );
}
