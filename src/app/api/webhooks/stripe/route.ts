import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/utils/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id);

  if (session.mode === 'subscription' && session.subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ['latest_invoice'] }
      );

      const supabaseAdmin = createAdminClient();
      
      // カスタマーのメールアドレスからユーザーを検索
      const customerEmail = session.customer_details?.email;
      
      if (!customerEmail) {
        console.error('No customer email found in session');
        return;
      }

      // Supabase Authでユーザーを検索
      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) {
        console.error('Error fetching users:', userError);
        return;
      }

      const user = users.find((u: any) => u.email === customerEmail) ||
                   users.find((u: any) => u.email?.toLowerCase() === customerEmail?.toLowerCase());
      
      if (!user) {
        console.error('User not found for email:', customerEmail);
        return;
      }

      // 期間情報を取得（優先順位順）
      let periodStart: string;
      let periodEnd: string;
      
      // 1. Subscription Items から取得（最優先）
      const subscriptionItems = (subscription as any).items?.data;
      const firstItem = subscriptionItems?.[0];
      
      if (firstItem?.current_period_start && firstItem?.current_period_end) {
        periodStart = new Date(firstItem.current_period_start * 1000).toISOString();
        periodEnd = new Date(firstItem.current_period_end * 1000).toISOString();
      } else {
        // 2. Invoice Lines から取得（フォールバック）
        const latestInvoice = (subscription as any).latest_invoice;
        const lineItem = latestInvoice?.lines?.data?.[0];
        
        if (lineItem?.period?.start && lineItem?.period?.end) {
          periodStart = new Date(lineItem.period.start * 1000).toISOString();
          periodEnd = new Date(lineItem.period.end * 1000).toISOString();
        } else {
          // 3. デフォルトで1ヶ月間を設定（最終フォールバック）
          const now = new Date();
          const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          periodStart = now.toISOString();
          periodEnd = oneMonthLater.toISOString();
          console.warn('Using default 1-month period (no valid period data found)');
        }
      }

      // サブスクリプション情報を保存
      const { error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

      if (subscriptionError) {
        console.error('Error saving subscription:', subscriptionError);
      } else {
        console.log('Subscription saved successfully for user:', user.id);
      }
    } catch (error) {
      console.error('Error in handleCheckoutSessionCompleted:', error);
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id);

  if ((invoice as any).subscription) {
    try {
      const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
      const supabaseAdmin = createAdminClient();
      
      // 安全な日付処理
      const safeDate = (timestamp: number | undefined | null): string => {
        if (!timestamp || typeof timestamp !== 'number' || timestamp <= 0) {
          console.warn('Invalid timestamp:', timestamp, 'using current date');
          return new Date().toISOString();
        }
        try {
          const date = new Date(timestamp * 1000);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date from timestamp:', timestamp, 'using current date');
            return new Date().toISOString();
          }
          return date.toISOString();
        } catch (error) {
          console.error('Error converting timestamp to date:', timestamp, error);
          return new Date().toISOString();
        }
      };

      // サブスクリプション情報を更新
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: safeDate((subscription as any).current_period_start),
          current_period_end: safeDate((subscription as any).current_period_end),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        console.error('Error updating subscription:', error);
      } else {
        console.log('Subscription updated successfully:', subscription.id);
      }
    } catch (error) {
      console.error('Error in handleInvoicePaymentSucceeded:', error);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id);

  try {
    const supabaseAdmin = createAdminClient();
    
    // 期間データの優先順位で取得
    let periodStart: string;
    let periodEnd: string;
    
    // 1. Subscription Items から取得（最優先）
    const subscriptionItems = (subscription as any).items?.data;
    const firstItem = subscriptionItems?.[0];
    
    if (firstItem?.current_period_start && firstItem?.current_period_end) {
      periodStart = new Date(firstItem.current_period_start * 1000).toISOString();
      periodEnd = new Date(firstItem.current_period_end * 1000).toISOString();
    } 
    // 2. Subscription レベルから取得（フォールバック）
    else if ((subscription as any).current_period_start && (subscription as any).current_period_end) {
      periodStart = new Date((subscription as any).current_period_start * 1000).toISOString();
      periodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();
    }
    // 3. エラー処理（期間データなし）
    else {
      console.error('No valid period data found in subscription update');
      return;
    }

    // 既存レコードの確認
    const { data: existingSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id);

    if (fetchError) {
      console.error('Error fetching existing subscription:', fetchError);
      return;
    }

    if (!existingSubscriptions || existingSubscriptions.length === 0) {
      console.warn('No existing subscription found for update:', subscription.id);
      return;
    }

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('Subscription updated successfully:', subscription.id);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id);

  try {
    const supabaseAdmin = createAdminClient();
    
    // 既存レコードの確認
    const { data: existingSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id);

    if (fetchError) {
      console.error('Error fetching existing subscription:', fetchError);
      return;
    }
    
    if (!existingSubscriptions || existingSubscriptions.length === 0) {
      console.warn('No existing subscription found for deletion:', subscription.id);
      return;
    }

    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error canceling subscription:', error);
    } else {
      console.log('Subscription canceled successfully:', subscription.id);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
  }
}
