import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Provider } from "./components/Provider";
// import MonetagPush from "./components/Monetag/MonetagPush";
// import MonetagInpage from "./components/Monetag/MonetagInpage";
// import MonetagInterstitial from "./components/Monetag/MonetagInterstitial";
// import MonetagBanner from "./components/Monetag/MonetagBanner";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* <MonetagPush/>
      <MonetagInpage/>
      <MonetagInterstitial/>
      <MonetagBanner/> */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider>
          {children}
        </Provider>
      </body>
      <GoogleAdsense/>
    </html>
  );
}
