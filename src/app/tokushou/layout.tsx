import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Provider } from "../components/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "特定商取引法に基づく表示 - 今行ける二郎"
const description = "今行ける二郎の特定商取引法に基づく表示ページです。"

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

export default function TokushouLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider>
          {children}
        </Provider>
      </body>

      { !!gaID && <GoogleAnalytics gaId={gaID} /> }
    </html>
  );
}
