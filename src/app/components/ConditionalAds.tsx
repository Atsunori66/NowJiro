"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import MonetagPush from "./monetag/Push";
import MonetagInpage from "./monetag/InpagePush";
import MonetagInterstitial from "./monetag/Interstitial";
import MonetagVignette from "./monetag/Vignette";
// import GoogleAdsense from "./GoogleAdsense";

export default function ConditionalAds() {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useSubscription();
  
  const isTokenshouPage = pathname === '/tokushou';
  const isAuthPage = pathname.startsWith('/auth');
  const isSuccessPage = pathname === '/success';
  const isCancelPage = pathname === '/cancel';
  const isLegalPage = pathname === '/legal';
  
  // 認証ページで広告スクリプトを強制的に削除
  useEffect(() => {
    if (isAuthPage) {
      // Monetag広告スクリプトを削除
      const removeAdScripts = () => {
        // Monetag関連のスクリプトを削除
        const scripts = document.querySelectorAll('script[src*="monetag"], script[src*="ads"], script[data-cfasync]');
        scripts.forEach(script => {
          script.remove();
        });
        
        // Monetag関連のDOM要素を削除
        const adElements = document.querySelectorAll(
          '[id*="monetag"], [class*="monetag"], [id*="ads"], [class*="ads"], ' +
          '.ad, .advertisement, [data-ad], [data-ads]'
        );
        adElements.forEach(element => {
          element.remove();
        });
        
        // iframe広告を削除
        const iframes = document.querySelectorAll('iframe[src*="ads"], iframe[src*="monetag"]');
        iframes.forEach(iframe => {
          iframe.remove();
        });
      };
      
      // 即座に実行
      removeAdScripts();
      
      // 定期的にチェック（広告が動的に挿入される場合に対応）
      const interval = setInterval(removeAdScripts, 500);
      
      // クリーンアップ
      return () => {
        clearInterval(interval);
      };
    }
  }, [isAuthPage, pathname]);
  
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
      {/* <GoogleAdsense/> */}
    </>
  );
}
