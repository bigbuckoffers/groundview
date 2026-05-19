import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { packages, type PackageKey } from '@/lib/pricing';

export async function POST(req: Request) {
  const body = await req.json();
  const packageType = (body.packageType || 'standard') as PackageKey;
  const selectedPackage = packages[packageType] || packages.standard;
  const supabase = getSupabaseAdmin();

  let orderId = `demo_${Date.now()}`;

  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_name: body.name,
        email: body.email,
        property_address: body.propertyAddress,
        city_state_zip: body.cityStateZip,
        package_type: packageType,
        price_cents: selectedPackage.price,
        status: 'pending_payment',
        payment_status: 'unpaid',
        notes: body.notes || null,
      })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    orderId = data.id;
  }

  const checkoutRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, packageType, customerEmail: body.email }),
  });
  const checkout = await checkoutRes.json();

  return NextResponse.json({
    orderId,
    checkoutUrl: checkout.url,
    message: checkout.demo ? 'Demo mode: add Stripe/Supabase env keys to take live payments and store orders.' : 'Checkout created.',
  });
}
