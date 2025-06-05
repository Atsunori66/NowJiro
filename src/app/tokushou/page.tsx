"use client";

import React from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Tokushou() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <div className="grid gap-4">
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

      <main className="p-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">特定商取引法に基づく表示</h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">事業者</h2>
            <p className="text-gray-700 dark:text-gray-300">角田 篤紀 (Sumita Atsuki)</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">運営責任者</h2>
            <p className="text-gray-700 dark:text-gray-300">角田 篤紀 (Sumita Atsuki)</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">所在地</h2>
            <p className="text-gray-700 dark:text-gray-300">請求がありましたら遅滞なく開示します。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">電話番号</h2>
            <p className="text-gray-700 dark:text-gray-300">請求がありましたら遅滞なく開示します。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">メールアドレス</h2>
            <p className="text-gray-700 dark:text-gray-300">
              <a href="mailto:support@nowjiro.com" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                support@nowjiro.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">販売価格</h2>
            <div className="text-gray-700 dark:text-gray-300">
              <p className="font-medium text-lg">月額 1 アメリカドル（税込）</p>
              <p className="text-sm mt-1">※為替変動によって請求額の円換算額が変動することがあります。</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">決済手段</h2>
            <p className="text-gray-700 dark:text-gray-300">クレジットカード決済</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">代金の支払時期</h2>
            <p className="text-gray-700 dark:text-gray-300">申込時および毎月1回、初回支払日を起点として自動決済されます。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">サービス提供時期</h2>
            <p className="text-gray-700 dark:text-gray-300">決済完了後すぐにサービスをご利用いただけます。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">キャンセル・解約について</h2>
            <div className="text-gray-700 dark:text-gray-300">
              <p>次回決済日の24時間前までにマイページより解約いただければ、次回以降の請求は発生しません。</p>
              <p className="mt-2">解約後も、既に支払済みの期間の返金はできかねます。</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">返品・返金について</h2>
            <p className="text-gray-700 dark:text-gray-300">商品の性質上、返金・返品には応じられません。</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 border-b-2 border-yellow-300 pb-1">動作環境</h2>
            <p className="text-gray-700 dark:text-gray-300">Webブラウザ（最新版の Chrome, Edge, Safari, Firefox を推奨）</p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-block bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded transition-colors">
            メインページに戻る
          </Link>
        </div>
      </main>

      <footer className="p-4 text-center">
        &copy; {new Date().getFullYear()} nowjiro.com
      </footer>
    </div>
  );
}
