import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!secret || !stripeKey) return NextResponse.json({ received: true, demo: true });

  const stripe = new Stripe(stripeKey);
  const signature = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature || '', secret);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const supabase = getSupabaseAdmin();
    if (orderId && supabase) {
      await supabase.from('orders').update({ status: 'paid_new_order', payment_status: 'paid', stripe_session_id: session.id }).eq('id', orderId);
    }
  }

  return NextResponse.json({ received: true });
}
