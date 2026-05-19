import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    await supabase.from('photo_edit_requests').insert({
      prompt: body.prompt || 'Auto enhance property photos',
      edit_type: body.mode || 'auto-fix',
      status: 'queued',
    });
  }

  return NextResponse.json({
    status: 'queued',
    message: 'Photo edit request created. Production next step: upload original image to storage, call image editing provider, then save edited image URL.',
  });
}
