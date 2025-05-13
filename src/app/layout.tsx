import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Provider } from "./components/Provider";
import MonetagPush from "./components/monetag/Push";
import MonetagInpage from "./components/monetag/InpagePush";
import MonetagInterstitial from "./components/monetag/Interstitial";
import MonetagVignette from "./components/monetag/Vignette";

import GoogleAdsense from "./components/GoogleAdsense";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "今行ける二郎"
const description = "現在営業中のラーメン二郎の店舗を確認できます。"

export const metadata: Metadata = {
  title: title,
  description: description,
  appleWebApp: true,
  openGraph: {
    title: title,
    description: description
  },
  twitter: {
    title: title,
    description: description,
    card: "summary_large_image"
  }
};

const gaID = process.env.GOOGLE_ANALYTICS_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <MonetagPush/>
      <MonetagInpage/>
      <MonetagInterstitial/>
      <MonetagVignette/>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider>
          {children}
        </Provider>
      </body>

      <GoogleAdsense/>
      { !!gaID && <GoogleAnalytics gaId={gaID} /> }
    </html>
  );
}
