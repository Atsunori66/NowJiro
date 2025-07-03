"use client";

import React from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Success() {
  const { setTheme, resolvedTheme } = useTheme();

  // 注意: サブスクリプション状態は Stripe Webhook により自動更新されます
  // 手動での状態設定は不要です

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
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                登録完了！
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                広告非表示プランへのご登録ありがとうございます
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                <h2 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ✨ サービス開始
                </h2>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  広告非表示機能が有効になりました。今すぐ快適にご利用いただけます。
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  💳 請求について
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  月額1ドルが毎月自動で請求されます。解約はいつでも可能です。
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link 
                href="/"
                className="w-full inline-block bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-3 px-4 rounded-md transition-colors text-center"
              >
                サービスを利用する
              </Link>
              
              <Link 
                href="/legal"
                className="w-full inline-block bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors text-center text-sm"
              >
                利用規約・プライバシーポリシー
              </Link>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            ご質問やサポートが必要な場合は、
            <a href="mailto:support@nowjiro.com" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline ml-1">
              support@nowjiro.com
            </a>
            までお気軽にお問い合わせください。
          </p>
        </div>
      </main>

      <footer className="p-4 text-center">
        &copy; {new Date().getFullYear()} nowjiro.com
      </footer>
    </div>
  );
}
