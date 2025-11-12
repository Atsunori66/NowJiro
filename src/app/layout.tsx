import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

import { Provider } from "./components/Provider";
// import { SubscriptionProvider } from "./contexts/SubscriptionContext";
// import ClientOnlyAds from "./components/ClientOnlyAds";

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
    <html lang="ja" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider>
          {/* <SubscriptionProvider> */}
            {/* <ClientOnlyAds /> */}
            {children}
          {/* </SubscriptionProvider> */}
        </Provider>
      </body>

      { !!gaID && <GoogleAnalytics gaId={gaID} /> }
    </html>
  );
}
