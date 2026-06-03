import Link from "next/link";
import { CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import PixelPurchaseTracking from "@/components/PixelPurchaseTracking";
import InAppBrowserOverlay from "@/components/InAppBrowserOverlay";
import { supabase } from "@/app/minicourse/supabase";

export default async function ThankYouPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ orderId: string }>,
  searchParams: Promise<{ tariff?: string }>
}) {
  const { orderId } = await params;
  const { tariff } = await searchParams;
  const isValidOrder = orderId.startsWith('ORDER_');

  const currentTelegramLink = `https://t.me/Minikurspracticum_bot?start=pay_${orderId}`;

  if (!isValidOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col p-4 text-center">
        <h1 className="text-2xl font-bold font-montserrat text-gray-800">Замовлення не знайдено</h1>
        <Link href="/" className="mt-4 text-[#4E0000] underline hover:no-underline">Повернутися на головну</Link>
      </div>
    );
  }

  // Verify payment status strictly in the database
  let isPaid = false;
  if (supabase) {
    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('phone, telegram')
        .eq('order_id', orderId)
        .maybeSingle();

      if (lead) {
        const tgClean = (lead.telegram || '').replace(/^@/, '').trim().toLowerCase();
        const phoneClean = (lead.phone || '').trim().replace(/\D/g, '');

        let query = supabase.from('minicourse_users').select('is_paid');
        if (tgClean && phoneClean) {
          query = query.or(`phone.eq.${phoneClean},telegram.ilike.${tgClean}`);
        } else if (tgClean) {
          query = query.ilike('telegram', tgClean);
        } else if (phoneClean) {
          query = query.eq('phone', phoneClean);
        }

        const { data: user } = await query.maybeSingle();
        if (user?.is_paid) {
          isPaid = true;
        }
      }
    } catch (err) {
      console.error("Error verifying payment on thank-you page:", err);
    }
  } else {
    // Fallback for mock mode development
    isPaid = true;
  }

  const purchaseValue = tariff === 'VIP' ? 39 : 19;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFAF8] p-6 text-center">
      <InAppBrowserOverlay />
      {isPaid && <PixelPurchaseTracking value={purchaseValue} />}
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl border border-[#81D8D0]/20">
        
        {isPaid ? (
          /* Paid Flow */
          <>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-[#81D8D0]/10 p-4">
                <CheckCircle2 className="h-16 w-16 text-[#81D8D0]" />
              </div>
            </div>
            
            <h1 className="mb-2 font-montserrat text-3xl font-black text-[#4E0000] uppercase tracking-tight">
              Дякуємо за оплату!
            </h1>
            
            <p className="mb-8 font-arimo text-lg text-gray-600 leading-relaxed">
              Ваш платіж підтверджено. Натисніть кнопку нижче, щоб перейти до нашого Telegram-бота та розпочати навчання.
            </p>

            <div className="rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-500 font-narrow mb-8">
              <p><strong>Номер замовлення:</strong> {orderId}</p>
              <p className="mt-1"><strong>Тариф:</strong> {tariff || 'PRO'}</p>
              <p className="mt-1">Будь ласка, збережіть цю сторінку або зробіть скріншот.</p>
            </div>

            <Link 
              href={currentTelegramLink}
              className="inline-block rounded-full bg-[#81D8D0] px-12 py-5 text-lg font-bold uppercase tracking-wider text-[#4E0000] transition-transform hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.3)] w-full"
            >
              Перейти до чат-бота
            </Link>
          </>
        ) : (
          /* Unpaid / Pending Flow */
          <>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-amber-50 p-4">
                <AlertTriangle className="h-16 w-16 text-amber-500" />
              </div>
            </div>
            
            <h1 className="mb-2 font-montserrat text-3xl font-black text-[#4E0000] uppercase tracking-tight">
              Оплата обробляється
            </h1>
            
            <p className="mb-8 font-arimo text-gray-600 leading-relaxed">
              Оплату для замовлення <strong>{orderId}</strong> ще не підтверджено платіжною системою. 
              Доступ до Telegram-бота відкриється автоматично одразу після успішної транзакції (зазвичай це займає до 1 хвилини).
            </p>

            <div className="rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-500 font-narrow mb-8">
              <p><strong>Номер замовлення:</strong> {orderId}</p>
              <p className="mt-1"><strong>Тариф:</strong> {tariff || 'PRO'}</p>
              <p className="mt-1">Якщо ви вже здійснили оплату, будь ласка, оновіть сторінку.</p>
            </div>

            <button 
              onClick={() => typeof window !== 'undefined' && window.location.reload()}
              className="inline-flex items-center justify-center space-x-2 rounded-full border-2 border-[#81D8D0] hover:bg-[#81D8D0]/10 px-12 py-4 text-base font-bold uppercase tracking-wider text-[#4E0000] transition-all w-full cursor-pointer"
            >
              <Loader2 className="w-5 h-5 animate-spin text-[#81D8D0]" />
              <span>Оновити статус</span>
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 font-arimo">
                Виникли проблеми або оплата не зарахувалась? Зверніться в підтримку:{" "}
                <a href="https://t.me/YuransiS" target="_blank" rel="noopener noreferrer" className="text-[#4E0000] font-bold underline hover:no-underline">
                  @YuransiS
                </a>
              </p>
            </div>
          </>
        )}

        <Link 
          href="/" 
          className="mt-6 inline-block text-gray-400 hover:text-gray-600 transition-colors font-medium border-b border-gray-200 hover:border-gray-400"
        >
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
}
