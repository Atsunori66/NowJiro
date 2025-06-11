"use client";

import React from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Legal() {
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
        <h1 className="text-3xl font-bold text-center mb-8">利用規約・プライバシーポリシー</h1>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <p className="mb-4">
              この利用規約・プライバシーポリシー（以下「本規約」）は、今行ける二郎（以下「当サービス」）の利用条件および個人情報の取り扱いを定めるものです。
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              最終更新日：2025年6月11日
            </p>
          </section>

          {/* 利用規約セクション */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-yellow-300 pb-2">利用規約</h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">第1条（サービス内容）</h3>
                <div className="space-y-2">
                  <p>1. 当サービスは、ラーメン二郎の各店舗のうち現在営業中の店舗を一覧で確認できるウェブサービスです。</p>
                  <p>2. 有料プラン（月額1ドル）では、広告の非表示機能を提供します。</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">第2条（利用料金及び支払方法）</h3>
                <div className="space-y-2">
                  <p>1. 有料プランの利用料金は月額1アメリカドル（税込）とします。</p>
                  <p>2. 支払方法はクレジットカード決済のみとし、Stripe Inc.のサービスを利用します。</p>
                  <p>3. 利用料金は申込時および毎月1回、初回支払日を起点として自動決済されます。</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">第3条（解約）</h3>
                <div className="space-y-2">
                  <p>1. ユーザーは、次回決済日の24時間前までにマイページより解約手続きを行うことで、有料プランを解約することができます。</p>
                  <p>2. 解約後も、既に支払済みの期間については引き続きサービスをご利用いただけます。</p>
                  <p>3. 解約後の返金は、原則として行いません。</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">第4条（免責事項）</h3>
                <div className="space-y-2">
                  <p>1. 当サービス運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。</p>
                  <p>2. 当サービスで提供される店舗情報は、各店舗の公式情報に基づいていますが、情報の正確性を保証するものではありません。</p>
                </div>
              </section>
            </div>
          </section>

          {/* プライバシーポリシーセクション */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-yellow-300 pb-2">プライバシーポリシー</h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">1. 収集する情報</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">1.1 自動的に収集される情報</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>IPアドレス、ブラウザの種類とバージョン、アクセス日時</li>
                      <li>参照元URL、デバイス情報</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">1.2 ユーザーが提供する情報</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>お問い合わせ時のメールアドレス</li>
                      <li>サブスクリプション登録時の決済情報（Stripeを通じて処理）</li>
                      <li>位置情報（ユーザーが許可した場合のみ）</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">2. 情報の利用目的</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>サービスの提供・運営</li>
                  <li>ユーザーサポート</li>
                  <li>サービスの改善・開発</li>
                  <li>利用状況の分析</li>
                  <li>広告の配信</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">3. 情報の共有</h3>
                <div className="space-y-3">
                  <p>当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません：</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>ユーザーの同意がある場合</li>
                    <li>法令に基づく場合</li>
                    <li>サービス提供に必要な業務委託先（Stripe等）</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">4. 第三者サービス</h3>
                <div className="space-y-3">
                  <p><strong>決済処理：</strong>Stripe Inc.のサービスを利用しています。決済情報はStripeのプライバシーポリシーに従って処理されます。</p>
                  <p><strong>アクセス解析：</strong>Google Analyticsを使用してアクセス解析を行っています。</p>
                  <p><strong>広告配信：</strong>第三者の広告配信サービスを利用しており、これらのサービスがCookieを使用する場合があります。</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">5. ユーザーの権利</h3>
                <p>ユーザーは、自身の個人情報について以下の権利を有します：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>開示請求</li>
                  <li>訂正・削除請求</li>
                  <li>利用停止請求</li>
                </ul>
                <p className="mt-2">これらの請求については、support@nowjiro.com までご連絡ください。</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">6. セキュリティ</h3>
                <p>当サービスは、個人情報の漏洩、滅失、毀損を防ぐため、適切な技術的・組織的安全管理措置を講じています。</p>
              </section>
            </div>
          </section>

          {/* 共通事項 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-yellow-300 pb-2">共通事項</h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">規約の変更</h3>
                <p>当サービス運営者は、必要に応じて本規約を変更する場合があります。重要な変更については、ウェブサイト上で通知します。</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4 border-b border-yellow-300 pb-1">お問い合わせ</h3>
                <p>本規約に関するお問い合わせは、以下までご連絡ください：</p>
                <div className="mt-2 ml-4">
                  <p>事業者：角田 篤紀</p>
                  <p>メールアドレス：
                    <a href="mailto:support@nowjiro.com" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                      support@nowjiro.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
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
