"use client";

import dynamic from "next/dynamic";

// ConditionalAdsをクライアントサイドでのみ読み込む（SSR無効化）
const ConditionalAds = dynamic(() => import("./ConditionalAds"), {
  ssr: false
});

export default function ClientOnlyAds() {
  return <ConditionalAds />;
}
