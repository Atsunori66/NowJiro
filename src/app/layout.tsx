import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import MonetagPush from "./components/Monetag/MonetagPush";
import MonetagInpage from "./components/Monetag/MonetagInpage";
import MonetagInterstitial from "./components/Monetag/MonetagInterstitial";
import MonetagBanner from "./components/Monetag/MonetagBanner";

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
  title: "今行ける二郎",
  description: "現在営業中のラーメン二郎の店舗を確認できます。",
};

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
      <MonetagBanner/>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
