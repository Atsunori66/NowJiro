"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const MonetagPush = () => {
  const pathname = usePathname();
  
  // 本番環境以外では表示しない
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  
  // 認証ページでは表示しない
  if (pathname.startsWith('/auth') || 
      pathname === '/tokushou' || 
      pathname === '/success' || 
      pathname === '/cancel' || 
      pathname === '/legal') {
    return null;
  }
  
  return (
    <Script
      src="https://upskittyan.com/act/files/tag.min.js"
      data-zone="9054171"
      strategy="afterInteractive"
      data-cfasync="false"
    />
  );
};

export default MonetagPush;
