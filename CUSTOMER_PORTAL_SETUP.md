# Stripe Customer Portal 設定ガイド

## 概要
Stripe Customer Portalを使用してユーザーがサブスクリプションを管理できるようになりました。

## 実装完了内容

### 1. APIエンドポイント
- `src/app/api/create-portal-session/route.ts`
- Customer Portalセッションを作成

### 2. UIコンポーネント
- `src/app/components/CustomerPortal.tsx`
- サブスクリプション管理UI

### 3. 統合
- `src/app/components/SubscriptionSection.tsx`
- 既存のサブスクリプションセクションに統合

## Stripe Dashboard 設定

### Customer Portal設定が必要
Stripe Dashboardで以下の設定を行ってください：

1. **Stripe Dashboard** → **Settings** → **Billing** → **Customer portal**
2. **Activate test link** をクリック
3. 以下の機能を有効化：
   - ✅ **Update payment method**
   - ✅ **Download invoices**
   - ✅ **Cancel subscriptions**
   - ✅ **Update billing information**

### 本番環境での設定
本番環境では以下も設定：
1. **Business information** の入力
2. **Terms of service** の設定
3. **Privacy policy** の設定

## 機能

### ユーザーができること
- 💳 **支払い方法の変更**
- 📄 **請求書のダウンロード**
- 📊 **請求履歴の確認**
- ❌ **サブスクリプションのキャンセル**
- 📝 **請求先情報の更新**

### 表示条件
- ✅ ログイン済み
- ✅ アクティブなサブスクリプションあり

## テスト方法

### 1. ローカル環境
```bash
npm run dev
```

### 2. テストフロー
1. ユーザー登録・ログイン
2. サブスクリプション購入
3. 「アカウント管理ページを開く」ボタンをクリック
4. Customer Portalが開くことを確認

### 3. 確認項目
- ✅ Customer Portalが正常に開く
- ✅ 支払い方法の変更ができる
- ✅ 請求履歴が表示される
- ✅ キャンセル機能が動作する

## セキュリティ

### 自動的に提供される機能
- 🔒 **PCI準拠**: Stripeが自動で対応
- 🔐 **認証**: セッションベースの安全なアクセス
- 🛡️ **データ保護**: 機密情報はStripe側で管理

## Webhook連携

### 自動同期
Customer Portalでの変更は既存のWebhookで自動同期：
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

## トラブルシューティング

### よくある問題

#### 1. "No active subscription found"
- Supabaseのsubscriptionsテーブルを確認
- Webhookが正常に動作しているか確認

#### 2. Customer Portalが開かない
- Stripe DashboardでCustomer Portal設定を確認
- 環境変数STRIPE_SECRET_KEYを確認

#### 3. 支払い方法の変更ができない
- Stripe DashboardでCustomer Portal機能を有効化
- テスト環境と本番環境の設定を確認

## 今後の拡張

### 可能な追加機能
- 📈 **使用量ベース課金**
- 🎫 **クーポン適用**
- 📱 **プラン変更UI**
- 📊 **詳細な分析**

### カスタムUI実装
より詳細な制御が必要な場合：
- Stripe APIを直接使用
- 独自のサブスクリプション管理画面
- ブランドに合わせたデザイン
