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
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
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

    const user = users.find((u: any) => u.email === customerEmail);
    
    if (!user) {
      console.error('User not found:', customerEmail);
      return;
    }

    // サブスクリプション情報を保存
    const { error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      });

    if (subscriptionError) {
      console.error('Error saving subscription:', subscriptionError);
    } else {
      console.log('Subscription saved successfully for user:', user.id);
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice.payment_succeeded:', invoice.id);

  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    const supabaseAdmin = createAdminClient();
    
    // サブスクリプション情報を更新
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('Subscription updated successfully:', subscription.id);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id);

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log('Subscription updated successfully:', subscription.id);
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
