"use client";

import React from "react";
import Link from "next/link";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import SubscribeButton from "./Checkout";
import CustomerPortal from "./CustomerPortal";

export default function SubscriptionSection() {
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, loading: subscriptionLoading, subscription } = useSubscription();

  // ローディング中は何も表示しない
  if (authLoading || subscriptionLoading) {
    return (
      <div id="subscribe" className="mt-12 mb-8">
        <div className="text-center">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg max-w-md mx-auto"></div>
        </div>
      </div>
    );
  }

  // サブスクリプション契約者の場合
  if (user && isSubscribed && subscription) {
    const periodEnd = new Date(subscription.current_period_end);
    const formattedDate = periodEnd.toLocaleDateString('ja-JP');
    
    return (
      <div id="subscribe" className="mt-12 mb-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                ✨ 広告非表示プラン有効
              </h2>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                ご利用ありがとうございます。広告なしで快適にご利用いただけます。
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                次回更新日: {formattedDate}
              </p>
            </div>
          </div>
          
          {/* Customer Portal */}
          <CustomerPortal />
        </div>
      </div>
    );
  }

  // 未認証ユーザーの場合
  if (!user) {
    return (
      <div id="subscribe" className="mt-12 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            広告を非表示にしませんか？
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            月額わずか1ドルで、すっきりとした画面で二郎情報をチェックできます
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 max-w-md mx-auto mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              サブスクリプションを購入するには、まずログインが必要です
            </p>
            <Link 
              href="/auth/signin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              ログインして購入する
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 認証済みだが未契約者の場合は購入ボタンを表示
  return (
    <div id="subscribe" className="mt-12 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          広告を非表示にしませんか？
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          月額わずか1ドルで、すっきりとした画面で二郎情報をチェックできます
        </p>
      </div>
      <SubscribeButton />
    </div>
  );
}
