import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
// import MonetagMulti from "./components/monetag-multi";
import MonetagPush from "./components/monetag-push-notifications";
import MonetagInpage from "./components/monetag-inpage-push";
import MonetagInterstitial from "./components/monetag-interstitial";
import MonetagBanner from "./components/monetag-vignette-banner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "今いける二郎",
  description: "現在営業中のラーメン二郎の店舗を確認できます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* Monetag components*/}
      {/* <MonetagMulti/> */}
      <MonetagPush/>
      <MonetagInpage/>
      <MonetagInterstitial/>
      <MonetagBanner/>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
