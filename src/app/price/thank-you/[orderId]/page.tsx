import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import PixelPurchaseTracking from "@/components/PixelPurchaseTracking";

export default async function PriceThankYouPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ orderId: string }>,
  searchParams: Promise<{ tariff?: string }>
}) {
  const { orderId } = await params;
  const { tariff } = await searchParams;
  const isValidOrder = orderId.startsWith('ORDER_');

  if (!isValidOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col p-4 text-center">
        <h1 className="text-2xl font-bold font-montserrat text-gray-800">Замовлення не знайдено</h1>
        <Link href="/" className="mt-4 text-[#4E0000] underline hover:no-underline">Повернутися на головну</Link>
      </div>
    );
  }

  const purchaseValue = 25; // Approximate value for pre-booking

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFAF8] p-6 text-center">
      <PixelPurchaseTracking value={purchaseValue} />
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl border border-[#81D8D0]/20">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[#81D8D0]/10 p-4">
            <CheckCircle2 className="h-16 w-16 text-[#81D8D0]" />
          </div>
        </div>
        
        <h1 className="mb-2 font-montserrat text-3xl font-black text-[#4E0000] uppercase tracking-tight">
          Дякуємо за бронювання!
        </h1>
        
        <p className="mb-8 font-arimo text-lg text-gray-600">
          З вами зв'яжуться за вказаним вами номером телефону або у Telegram.
        </p>

        <div className="rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-500 font-narrow">
          <p><strong>Номер замовлення:</strong> {orderId}</p>
          <p className="mt-1"><strong>Тариф:</strong> {tariff || 'Invest Baby'}</p>
          <p className="mt-1 font-bold text-[#4E0000]">Зробіть скріншот, щоб не загубити.</p>
        </div>

        <Link 
          href="/" 
          className="mt-8 inline-block text-gray-400 hover:text-gray-600 transition-colors font-medium border-b border-gray-200 hover:border-gray-400"
        >
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
}
