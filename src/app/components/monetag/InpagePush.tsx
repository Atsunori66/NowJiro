"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const MonetagInpage = () => {
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
    <Script id="monetag-inpage" strategy="afterInteractive">
      {`
        (function(d, z, s) {
          s.src = 'https://' + d + '/400/' + z;
          try {
            (document.body || document.documentElement).appendChild(s)
          } catch(e) {}
        }) ('vemtoutcheeg.com', 9029472, document.createElement('script'));
      `}
    </Script>
  );
};

export default MonetagInpage;
