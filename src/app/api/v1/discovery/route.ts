import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    project_slug: 'economica',
    project_name: 'Economica',
    domain: 'https://economica.vercel.app',
    version: '1.0.0',
    ping_timestamp: new Date().toISOString(),
    pages_count: 8,
    pages: [
      { label: 'Головна', path: '/', type: 'free', url: 'https://economica.vercel.app/' },
      { label: 'Інтенсив', path: '/intensive', type: 'free', url: 'https://economica.vercel.app/intensive' },
      { label: 'Вебінар', path: '/web', type: 'free', url: 'https://economica.vercel.app/web' },
      { label: 'VSL Sofia Invest', path: '/sofia-invest', type: 'free', url: 'https://economica.vercel.app/sofia-invest' },
      { label: 'Міні-курс', path: '/minicourse', type: 'paid', url: 'https://economica.vercel.app/minicourse' },
      { label: 'Тарифи / Ціни', path: '/price', type: 'paid', url: 'https://economica.vercel.app/price' },
      { label: 'Діагностика', path: '/diagnostics', type: 'quiz', url: 'https://economica.vercel.app/diagnostics' },
      { label: 'Оплата Чек-аут', path: '/checkout', type: 'paid', url: 'https://economica.vercel.app/checkout' }
    ]
  });
}
