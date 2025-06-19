# Stripe Webhook + Supabase + NextAuth.js セットアップガイド

## 1. 必要なパッケージのインストール

```bash
npm install @supabase/supabase-js next-auth @next-auth/supabase-adapter
```

## 2. Supabaseプロジェクトの設定

### 2.1 Supabaseプロジェクト作成
1. [Supabase](https://supabase.com)でアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクトURL、Anon Key、Service Role Keyを取得

### 2.2 データベーステーブル作成
Supabase SQL Editorで `supabase-schema.sql` の内容を実行

## 3. メール認証設定（Resend）

### 3.1 Resend設定
1. [Resend](https://resend.com)でアカウント作成
2. API Keyを取得
3. ドメインを追加・認証（本番環境用）
4. 開発環境では認証済みメールアドレスから送信可能

### 3.2 SMTP設定
Resendの場合：
- Host: `smtp.resend.com`
- Port: `587`
- Username: `resend`
- Password: `your_resend_api_key`

## 4. 環境変数の設定

`.env.local`ファイルを作成し、以下を設定：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Email Authentication (Resend/SMTP)
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_price_id
```

## 5. Stripe Webhook設定

### 5.1 Webhook エンドポイント追加
1. Stripe Dashboard → Developers → Webhooks
2. "Add endpoint"をクリック
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. 以下のイベントを選択：
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 5.2 Webhook Secret取得
作成したWebhookの詳細ページから「Signing secret」を取得し、`STRIPE_WEBHOOK_SECRET`に設定

## 6. 開発サーバー起動

```bash
npm run dev
```

## 7. テスト手順

### 7.1 認証テスト
1. `http://localhost:3000/api/auth/signin`にアクセス
2. メールアドレスを入力
3. 受信したメールのリンクをクリック
4. Supabaseの`users`テーブルにユーザーが作成されることを確認

### 7.2 Webhook テスト
1. Stripe CLIをインストール
2. ローカルでWebhookをテスト：
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 8. 本番環境デプロイ

### 8.1 環境変数更新
- `NEXTAUTH_URL`を本番URLに変更
- `STRIPE_WEBHOOK_SECRET`を本番Webhook用に更新

### 8.2 Webhook URL更新
Stripe DashboardでWebhook URLを本番環境のURLに変更

## 9. 動作フロー

### 新規サブスクリプション
1. ユーザーがメール認証でログイン
2. 購入ボタンクリック → Stripe Checkout
3. 決済完了 → `checkout.session.completed` Webhook
4. Supabaseの`subscriptions`テーブルに記録
5. 広告非表示機能が有効化

### 継続課金
1. Stripeが自動で請求
2. `invoice.payment_succeeded` Webhook
3. サブスクリプション状態を更新

### 解約
1. `customer.subscription.deleted` Webhook
2. サブスクリプション状態を`canceled`に更新
3. 広告表示が再開

## メール認証の特徴

### メリット
- **パスワード不要**: ユーザーがパスワードを覚える必要がない
- **セキュア**: メールアドレスの所有者のみがアクセス可能
- **シンプル**: 外部OAuth設定が不要
- **プライバシー**: 第三者サービスに個人情報を渡さない

### 注意点
- **メール送信制限**: Resendの無料プランは月100通まで
- **メール到達性**: スパムフォルダに入る可能性
- **リンク有効期限**: デフォルトで24時間（設定可能）

### Resend設定のコツ
- **開発環境**: 認証済みメールアドレス（自分のメール）から送信
- **本番環境**: 独自ドメインを設定してSPF/DKIMを設定
- **送信者名**: `EMAIL_FROM`を適切に設定（例: `noreply@yourdomain.com`）

## トラブルシューティング

### メール認証関連
- **メールが届かない**: スパムフォルダを確認
- **リンクが無効**: 24時間以内にクリックしているか確認
- **Resend API制限**: 送信制限に達していないか確認

### Webhook署名エラー
- `STRIPE_WEBHOOK_SECRET`が正しく設定されているか確認
- Webhookエンドポイントが正しいか確認

### ユーザーが見つからないエラー
- NextAuth.jsでユーザーが正しく作成されているか確認
- Supabaseの`users`テーブルを確認

### 型エラー
- `npm run build`でビルドエラーがないか確認
- TypeScript設定が正しいか確認
