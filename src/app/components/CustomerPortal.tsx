"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/app/contexts/SubscriptionContext';

export default function CustomerPortal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isSubscribed, subscription } = useSubscription();

  const handlePortalAccess = async () => {
    if (!user) {
      setError('ログインが必要です');
      return;
    }

    if (!isSubscribed) {
      setError('アクティブなサブスクリプションがありません');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ポータルセッションの作成に失敗しました');
      }

      // Customer Portalにリダイレクト
      window.location.href = data.url;
    } catch (err) {
      console.error('Error accessing customer portal:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // サブスクリプションがない場合は表示しない
  if (!isSubscribed) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        サブスクリプション管理
      </h3>
      
      {subscription && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>ステータス:</strong> {subscription.status === 'active' ? 'アクティブ' : subscription.status}</p>
          <p><strong>次回請求日:</strong> {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}</p>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          支払い方法の変更、請求履歴の確認、サブスクリプションのキャンセルなどを行えます。
        </p>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handlePortalAccess}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              読み込み中...
            </>
          ) : (
            'アカウント管理ページを開く'
          )}
        </button>
      </div>
    </div>
  );
}
