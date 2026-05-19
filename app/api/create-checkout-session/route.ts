import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { packages, type PackageKey } from '@/lib/pricing';

export async function POST(req: Request) {
  const body = await req.json();
  const packageType = (body.packageType || 'standard') as PackageKey;
  const selectedPackage = packages[packageType] || packages.standard;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ demo: true, url: null, message: 'Stripe key missing. Order created in demo mode.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: body.customerEmail,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: selectedPackage.name },
        unit_amount: selectedPackage.price,
      },
      quantity: 1,
    }],
    metadata: { orderId: body.orderId, packageType },
    success_url: `${appUrl}/dashboard?success=true&order=${body.orderId}`,
    cancel_url: `${appUrl}/?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
