"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  checkSubscriptionStatus: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const supabase = createClient();

  // サブスクリプション状態をSupabaseから取得
  const fetchSubscriptionStatus = async () => {
    if (!user || !isAuthenticated) {
      setIsSubscribed(false);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('サブスクリプション取得エラー:', fetchError);
        setError('サブスクリプション情報の取得に失敗しました');
        setIsSubscribed(false);
        setSubscription(null);
        return;
      }

      if (data && data.length > 0) {
        const latestSubscription = data[0] as Subscription;
        setSubscription(latestSubscription);
        
        // アクティブなサブスクリプションかチェック
        const isActive = latestSubscription.status === 'active' || 
                         latestSubscription.status === 'trialing';
        
        // 期間内かチェック
        const now = new Date();
        const periodEnd = new Date(latestSubscription.current_period_end);
        const isWithinPeriod = now <= periodEnd;
        
        setIsSubscribed(isActive && isWithinPeriod);
      } else {
        setIsSubscribed(false);
        setSubscription(null);
      }
    } catch (err) {
      console.error('サブスクリプション状態の確認中にエラーが発生:', err);
      setError('サブスクリプション状態の確認に失敗しました');
      setIsSubscribed(false);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  // 認証状態が変更されたときにサブスクリプション状態を更新
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user, isAuthenticated]);

  // サブスクリプション状態をリアルタイムで監視
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('サブスクリプション変更を検知:', payload);
          fetchSubscriptionStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAuthenticated]);

  const checkSubscriptionStatus = async () => {
    await fetchSubscriptionStatus();
  };

  const refreshSubscription = async () => {
    await fetchSubscriptionStatus();
  };

  const value = {
    isSubscribed,
    subscription,
    loading,
    error,
    checkSubscriptionStatus,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
