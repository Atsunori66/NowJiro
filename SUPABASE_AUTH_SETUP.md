# Supabase Auth + Stripe Webhook セットアップガイド

## 1. NextAuth.jsからの移行完了

### 削除されたもの
- ✅ NextAuth.js関連パッケージ
- ✅ `/api/auth/[...nextauth]` エンドポイント
- ✅ NextAuth.js型定義
- ✅ 手動作成したusersテーブル

### 新しく追加されたもの
- ✅ `useAuth` フック
- ✅ `/auth/signin` ページ
- ✅ `/auth/callback` ページ
- ✅ Supabase Auth統合

## 2. Supabaseダッシュボード設定

### 2.1 Authentication設定
1. **Supabaseダッシュボード** → **Authentication** → **Settings**
2. **Site URL**: `http://localhost:3000` (開発用)
3. **Redirect URLs**: `http://localhost:3000/auth/callback`

### 2.2 Email認証設定
1. **Authentication** → **Settings** → **Auth**
2. **Enable email confirmations**: ON
3. **Secure email change**: ON (推奨)

### 2.3 SMTP設定（Resend連携）
1. **Authentication** → **Settings** → **SMTP Settings**
2. **Enable custom SMTP**: ON
3. 以下を設定：
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: your_resend_api_key
   Sender email: noreply@yourdomain.com
   Sender name: 今行ける二郎
   ```

### 2.4 Email Templates（オプション）
1. **Authentication** → **Email Templates**
2. **Confirm signup** / **Magic Link** テンプレートをカスタマイズ

## 3. 環境変数設定

`.env.local`に以下のみ設定：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_price_id
```

## 4. 認証フローの使用方法

### 4.1 基本的な使用例
```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, loading, signIn, signOut, isAuthenticated } = useAuth()

  if (loading) return <div>Loading...</div>
  
  if (!isAuthenticated) {
    return <button onClick={() => signIn('user@example.com')}>
      ログイン
    </button>
  }

  return (
    <div>
      <p>ようこそ、{user.email}さん</p>
      <button onClick={signOut}>ログアウト</button>
    </div>
  )
}
```

### 4.2 サブスクリプション状態の確認
```typescript
// 既存のSubscriptionContextと組み合わせ
const { user } = useAuth()
const { isSubscribed } = useSubscription()

if (user && isSubscribed) {
  // 課金ユーザー向けコンテンツ
}
```

## 5. テスト手順

### 5.1 開発サーバー起動
```bash
npm run dev
```

### 5.2 認証テスト
1. `http://localhost:3000/auth/signin` にアクセス
2. メールアドレスを入力
3. 「ログインリンクを送信」をクリック
4. メールを確認してリンクをクリック
5. `/auth/callback` → `/` にリダイレクト

### 5.3 Supabaseでユーザー確認
1. **Authentication** → **Users**
2. 登録されたユーザーが表示される

## 6. Stripe Webhook連携

### 6.1 ユーザー識別方法
- **変更前**: 手動作成の`users`テーブル
- **変更後**: Supabase Authの`auth.users`

### 6.2 Webhook処理フロー
1. Stripe Checkoutでメールアドレス取得
2. `supabaseAdmin.auth.admin.listUsers()`でユーザー検索
3. `subscriptions`テーブルに保存

## 7. 本番環境設定

### 7.1 Supabase設定更新
- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**: `https://yourdomain.com/auth/callback`

### 7.2 Resend設定
- 独自ドメインの設定
- SPF/DKIM設定

## 8. メリット

### 8.1 技術的メリット
- ✅ **設定の簡素化**: NextAuth.js設定が不要
- ✅ **型安全性**: 完全なTypeScript対応
- ✅ **統合性**: Supabaseとのシームレス連携
- ✅ **RLS統合**: 自動的なRow Level Security

### 8.2 運用メリット
- ✅ **メンテナンス性**: 管理すべきコードが大幅減少
- ✅ **デバッグ性**: エラーの原因特定が容易
- ✅ **拡張性**: 将来的な機能追加が簡単

## 9. トラブルシューティング

### 9.1 メールが届かない
- Supabase SMTP設定を確認
- Resend API Keyが正しいか確認
- スパムフォルダを確認

### 9.2 認証エラー
- Site URLとRedirect URLsが正しいか確認
- 環境変数が正しく設定されているか確認

### 9.3 Webhook エラー
- `auth.users`テーブルにユーザーが存在するか確認
- Service Role Keyの権限を確認

これでSupabase Authへの移行が完了です！
