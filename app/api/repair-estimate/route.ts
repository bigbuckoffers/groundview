import { NextResponse } from 'next/server';
import { buildDemoEstimate } from '@/lib/demoEstimator';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const body = await req.json();
  const address = String(body.address || '');
  const notes = String(body.notes || '');
  const repairTypes = Array.isArray(body.repairTypes) ? body.repairTypes : [];

  let estimate = buildDemoEstimate(address, repairTypes, notes);

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          input: `Return ONLY valid JSON for an investor repair estimate. Use keys total_low,total_high,confidence,market,categories. Address: ${address}. Repair types: ${repairTypes.join(', ')}. Notes: ${notes}.`,
        }),
      });
      const data = await response.json();
      const text = data.output_text || data.output?.[0]?.content?.[0]?.text;
      if (text) estimate = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      // Keep demo estimate if AI fails.
    }
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from('repair_estimates').insert({
      property_address: address,
      repair_types: repairTypes,
      notes,
      estimate_json: estimate,
      total_low: estimate.total_low,
      total_high: estimate.total_high,
      confidence: estimate.confidence,
    });
  }

  return NextResponse.json({ estimate });
}
