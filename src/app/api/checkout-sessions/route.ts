import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // リクエストから現在のドメインを動的に取得
  const origin = req.headers.get('origin') || 
                 (req.headers.get('host') && `https://${req.headers.get('host')}`) ||
                 'http://localhost:3000'; // 開発環境用フォールバック

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID, // Stripeダッシュボードで作成した価格ID
        quantity: 1,
      },
    ],
    success_url: `${origin}/success`,
    cancel_url: `${origin}/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
