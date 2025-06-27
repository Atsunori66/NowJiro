-- Subscription Data Fix Script
-- 問題のあるサブスクリプションデータを修正

-- 1. 期間データが異常なレコードを特定
SELECT 
  id,
  user_id,
  stripe_subscription_id,
  status,
  current_period_start,
  current_period_end,
  CASE 
    WHEN current_period_start = current_period_end THEN 'SAME_TIME_ERROR'
    WHEN current_period_end < NOW() THEN 'EXPIRED'
    ELSE 'NORMAL'
  END as issue_type,
  created_at,
  updated_at
FROM subscriptions 
WHERE current_period_start = current_period_end
   OR (status = 'active' AND current_period_end < NOW())
ORDER BY updated_at DESC;

-- 2. 問題のあるレコード（期間開始=終了）を修正
-- 注意: 実行前に必ずバックアップを取ってください
UPDATE subscriptions 
SET 
  current_period_end = current_period_start + INTERVAL '1 month',
  updated_at = NOW()
WHERE current_period_start = current_period_end 
  AND status = 'active';

-- 3. 重複したcanceledレコードを確認
SELECT 
  user_id,
  stripe_customer_id,
  COUNT(*) as record_count,
  STRING_AGG(id::text, ', ') as record_ids,
  STRING_AGG(status, ', ') as statuses
FROM subscriptions 
WHERE status = 'canceled'
GROUP BY user_id, stripe_customer_id
HAVING COUNT(*) > 1
ORDER BY record_count DESC;

-- 4. 重複したcanceledレコードを削除（最新のもの以外）
-- 注意: 実行前に必ずバックアップを取ってください
DELETE FROM subscriptions 
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, stripe_customer_id 
        ORDER BY created_at DESC
      ) as rn
    FROM subscriptions 
    WHERE status = 'canceled'
  ) ranked
  WHERE rn > 1
);

-- 5. 修正後の確認クエリ
SELECT 
  'ACTIVE_SUBSCRIPTIONS' as category,
  COUNT(*) as count
FROM subscriptions 
WHERE status = 'active'

UNION ALL

SELECT 
  'CANCELED_SUBSCRIPTIONS' as category,
  COUNT(*) as count
FROM subscriptions 
WHERE status = 'canceled'

UNION ALL

SELECT 
  'PERIOD_ERRORS' as category,
  COUNT(*) as count
FROM subscriptions 
WHERE current_period_start = current_period_end

UNION ALL

SELECT 
  'EXPIRED_ACTIVE' as category,
  COUNT(*) as count
FROM subscriptions 
WHERE status = 'active' AND current_period_end < NOW();

-- 6. ユーザー別のサブスクリプション状況
SELECT 
  u.email,
  s.status,
  s.current_period_start,
  s.current_period_end,
  s.stripe_subscription_id,
  CASE 
    WHEN s.current_period_end > NOW() THEN 'VALID'
    ELSE 'EXPIRED'
  END as validity
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.status = 'active'
ORDER BY s.current_period_end DESC;
