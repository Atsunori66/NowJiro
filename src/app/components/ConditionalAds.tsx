"use client";

import { usePathname } from "next/navigation";
import MonetagPush from "./monetag/Push";
import MonetagInpage from "./monetag/InpagePush";
import MonetagInterstitial from "./monetag/Interstitial";
import MonetagVignette from "./monetag/Vignette";
import GoogleAdsense from "./GoogleAdsense";

export default function ConditionalAds() {
  const pathname = usePathname();
  const isTokenshouPage = pathname === '/tokushou';

  if (isTokenshouPage) {
    return null;
  }

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
