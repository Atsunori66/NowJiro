"use client";

import React from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Cancel() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <div className="grid gap-4 min-h-screen">
      <header className="m-2 flex">
        <Link href="/" className="p-4 bg-yellow-300 w-64 text-black font-black text-4xl hover:bg-yellow-400 transition-colors">
          今行ける二郎
        </Link>
        {/* テーマカラートグルボタン */}
        <button className="place-self-center ml-auto mr-6"
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
        >
          {
            resolvedTheme === "dark"
              ? <MoonIcon aria-hidden="true" className="-mr-1 h-5 w-5 stroke-yellow-300 fill-yellow-300" />
              : <SunIcon aria-hidden="true" className="-mr-1 h-5 w-5 stroke-orange-300 fill-orange-300" />
          }
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <XCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                登録がキャンセルされました
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                決済処理がキャンセルされました
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  💡 広告非表示プランについて
                </h2>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 text-left">
                  <li>• 月額わずか1ドルで広告を非表示</li>
                  <li>• いつでも簡単に解約可能</li>
                  <li>• 安全なStripe決済システム</li>
                  <li>• すぐにサービス開始</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  🤔 ご不明な点がございますか？
                </h2>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  サービスについてご質問がある場合は、お気軽にお問い合わせください。
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link 
                href="/"
                className="w-full inline-block bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-3 px-4 rounded-md transition-colors text-center"
              >
                メインページに戻る
              </Link>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  もう一度登録をお試しください
                </p>
                <Link 
                  href="/#subscribe"
                  className="inline-block bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors text-sm"
                >
                  広告非表示プランに登録
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ご質問やサポートが必要な場合は、
              <a href="mailto:support@nowjiro.com" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline ml-1">
                support@nowjiro.com
              </a>
              までお気軽にお問い合わせください。
            </p>
            
            <div className="flex justify-center space-x-4 text-xs">
              <Link href="/legal" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                利用規約・プライバシーポリシー
              </Link>
              <Link href="/tokushou" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                特定商取引法に基づく表示
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center">
        &copy; {new Date().getFullYear()} nowjiro.com
      </footer>
    </div>
  );
}
