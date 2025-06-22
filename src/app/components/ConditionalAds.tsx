"use client";

import { usePathname } from "next/navigation";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import MonetagPush from "./monetag/Push";
import MonetagInpage from "./monetag/InpagePush";
import MonetagInterstitial from "./monetag/Interstitial";
import MonetagVignette from "./monetag/Vignette";
import GoogleAdsense from "./GoogleAdsense";

export default function ConditionalAds() {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useSubscription();
  
  const isTokenshouPage = pathname === '/tokushou';
  const isAuthPage = pathname.startsWith('/auth');
  const isSuccessPage = pathname === '/success';
  const isCancelPage = pathname === '/cancel';
  const isLegalPage = pathname === '/legal';
  
  // 以下のページでは広告を非表示
  if (isTokenshouPage || isAuthPage || isSuccessPage || isCancelPage || isLegalPage) {
    return null;
  }

  // 認証状態またはサブスクリプション状態の読み込み中は広告を表示しない
  if (authLoading || subscriptionLoading) {
    return null;
  }

  // 認証済み かつ サブスクリプション契約者の場合は広告を非表示
  if (user && isSubscribed) {
    return null;
  }

  // 以下の場合は広告を表示:
  // 1. 未認証ユーザー
  // 2. 認証済みだが未課金ユーザー
  return (
    <>
      <MonetagPush/>
      <MonetagInpage/>
      <MonetagInterstitial/>
      <MonetagVignette/>
      <GoogleAdsense/>
    </>
  );
}
