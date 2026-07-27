import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';

export async function GET() {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsError) {
      throw leadsError;
    }

    const formattedLeads = (leads || []).map(l => ({
      date: l.created_at,
      name: l.name,
      phone: l.phone,
      telegram: l.telegram,
      tariff: l.tariff || '',
      orderId: l.order_id || '',
      status: l.status,
      visitorId: l.visitor_uuid,
      comment: l.comment || '',
      _sheet: l.target_sheet || 'Заявки',
      // Fields mapped to Ukrainian localization names if UI uses them
      "Дата та час": l.created_at,
      "Ім'я": l.name,
      "Телефон": l.phone,
      "Telegram": l.telegram,
      "Тариф": l.tariff || '',
      "Номер замовлення": l.order_id || '',
      "Статус оплати": l.status,
      "Visitor ID": l.visitor_uuid,
      "Customer Journey": l.query || '',
      "Коментар": l.comment || ''
    }));

    return NextResponse.json({
      leads: formattedLeads,
      traffic: [] // No longer tracking raw traffic clicks in Sheets
    });
  } catch (error: any) {
    console.error("Admin data fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
