import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';

export async function POST(req: Request) {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const body = await req.json();
    const { action, orderId, status, comment } = body;

    let updatePayload: any = {};
    if (action === 'update_status') {
      updatePayload = { status: status };
    } else if (action === 'update_comment') {
      updatePayload = { comment: comment };
    } else {
      throw new Error(`Unsupported action: ${action}`);
    }

    // Try to update by order_id first, fallback to visitor_uuid
    let { data, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('order_id', orderId)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      // Fallback: try by visitor_uuid
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('visitor_uuid', orderId)
        .select();

      if (fallbackError) throw fallbackError;
      data = fallbackData;
    }

    return NextResponse.json({ result: 'success', data });
  } catch (error: any) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
