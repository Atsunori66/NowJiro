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
      // expandパラメータで完全なデータを取得
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ['latest_invoice'] }
      );
      
      console.log('Retrieved subscription with expand:', {
        id: subscription.id,
        status: subscription.status,
        current_period_start: (subscription as any).current_period_start,
        current_period_end: (subscription as any).current_period_end,
        customer: subscription.customer,
        items: (subscription as any).items,
        latest_invoice: (subscription as any).latest_invoice
      });

      const supabaseAdmin = createAdminClient();
      
      // カスタマーのメールアドレスからユーザーを検索
      const customerEmail = session.customer_details?.email;
      console.log('=== 🔍 USER SEARCH DEBUG ===');
      console.log('Session ID:', session.id);
      console.log('Customer Email from session:', customerEmail);
      console.log('Customer Details:', {
        email: session.customer_details?.email,
        name: session.customer_details?.name,
        phone: session.customer_details?.phone
      });
      
      if (!customerEmail) {
        console.error('❌ No customer email found in session');
        console.log('Full session customer_details:', session.customer_details);
        return;
      }

      // Supabase Authでユーザーを検索
      console.log('🔍 Fetching all Supabase users...');
      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) {
        console.error('❌ Error fetching users:', userError);
        return;
      }

      console.log('📊 All Supabase users:');
      users.forEach((u: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${u.id}`);
        console.log(`     Email: "${u.email}"`);
        console.log(`     Created: ${u.created_at}`);
        console.log(`     Last Sign In: ${u.last_sign_in_at}`);
        console.log(`     Email Confirmed: ${u.email_confirmed_at}`);
        console.log('     ---');
      });

      console.log('🔍 Searching for user with email:', `"${customerEmail}"`);
      const user = users.find((u: any) => u.email === customerEmail);
      
      if (!user) {
        console.error('❌ User not found!');
        console.log('🔍 Trying case-insensitive search...');
        const userCaseInsensitive = users.find((u: any) => 
          u.email?.toLowerCase() === customerEmail?.toLowerCase()
        );
        
        if (userCaseInsensitive) {
          console.log('✅ Found user with case-insensitive search:', userCaseInsensitive.id);
          console.log('   Original email:', `"${userCaseInsensitive.email}"`);
          console.log('   Search email:', `"${customerEmail}"`);
        } else {
          console.error('❌ User not found even with case-insensitive search');
          console.log('Available emails:', users.map(u => `"${u.email}"`));
          return;
        }
      } else {
        console.log('✅ User found:', user.id);
        console.log('   Email match:', `"${user.email}" === "${customerEmail}"`);
      }

      const finalUser = user || users.find((u: any) => 
        u.email?.toLowerCase() === customerEmail?.toLowerCase()
      );
      
      if (!finalUser) {
        console.error('❌ Final user search failed');
        return;
      }

      console.log('=== ✅ USER SEARCH COMPLETED ===');
      console.log('Selected User ID:', finalUser.id);
      console.log('Selected User Email:', finalUser.email);

      // Stripeから正しい期間情報を取得（優先順位順）
      let periodStart: string;
      let periodEnd: string;
      let dataSource: string;
      
      // 1. Subscription Items から取得を試行（Stripe推奨）
      const subscriptionItems = (subscription as any).items?.data;
      const firstItem = subscriptionItems?.[0];
      
      console.log('Subscription Items data:', {
        items_count: subscriptionItems?.length,
        first_item: firstItem ? {
          id: firstItem.id,
          current_period_start: firstItem.current_period_start,
          current_period_end: firstItem.current_period_end,
          price: firstItem.price?.id
        } : null
      });
      
      if (firstItem?.current_period_start && firstItem?.current_period_end) {
        periodStart = new Date(firstItem.current_period_start * 1000).toISOString();
        periodEnd = new Date(firstItem.current_period_end * 1000).toISOString();
        dataSource = 'subscription_items';
        console.log('✅ Using Subscription Items period data');
      } else {
        // 2. Invoice Lines から取得を試行（フォールバック）
        console.log('Subscription Items unavailable, trying Invoice Lines...');
        const latestInvoice = (subscription as any).latest_invoice;
        const lineItem = latestInvoice?.lines?.data?.[0];
        
        console.log('Invoice Lines data:', {
          invoice_id: latestInvoice?.id,
          line_item: lineItem ? {
            period: lineItem.period,
            price: lineItem.price?.id
          } : null
        });
        
        if (lineItem?.period?.start && lineItem?.period?.end) {
          periodStart = new Date(lineItem.period.start * 1000).toISOString();
          periodEnd = new Date(lineItem.period.end * 1000).toISOString();
          dataSource = 'invoice_lines';
          console.log('✅ Using Invoice Lines period data');
        } else {
          // 3. デフォルトで1ヶ月間を設定（最終フォールバック）
          const now = new Date();
          const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          periodStart = now.toISOString();
          periodEnd = oneMonthLater.toISOString();
          dataSource = 'default_fallback';
          console.warn('⚠️ Using default 1-month period (no valid period data found)');
        }
      }

      console.log('Final processed dates:', {
        periodStart,
        periodEnd,
        duration_days: Math.round((new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24)),
        data_source: dataSource
      });

      // サブスクリプション情報を保存
      console.log('=== 💾 SAVING SUBSCRIPTION DATA ===');
      console.log('User ID:', finalUser.id);
      console.log('Stripe Customer ID:', subscription.customer);
      console.log('Stripe Subscription ID:', subscription.id);
      console.log('Status:', subscription.status);
      console.log('Period Start:', periodStart);
      console.log('Period End:', periodEnd);
      
      const { error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: finalUser.id,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

      if (subscriptionError) {
        console.error('❌ Error saving subscription:', subscriptionError);
        console.log('Error details:', JSON.stringify(subscriptionError, null, 2));
      } else {
        console.log('✅ Subscription saved successfully for user:', finalUser.id);
        console.log('=== 🎉 WEBHOOK PROCESSING COMPLETED ===');
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
    console.error('Error in handleSubscriptionUpdated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id);

  const supabaseAdmin = createAdminClient();
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
}
