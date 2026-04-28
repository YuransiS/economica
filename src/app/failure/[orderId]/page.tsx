import Link from "next/link";
import { XCircle } from "lucide-react";

export default async function FailurePage({ 
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFAF8] p-6 text-center">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl border border-red-500/20">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="mb-2 font-montserrat text-3xl font-black text-[#4E0000] uppercase tracking-tight">
          Оплата не пройшла
        </h1>
        
        <p className="mb-8 font-arimo text-lg text-gray-600">
          Схоже, сталася помилка під час оплати. Будь ласка, спробуйте ще раз або зверніться до нашої служби підтримки.
        </p>

        <div className="rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-500 font-narrow">
          <p><strong>Номер замовлення:</strong> {orderId}</p>
          <p className="mt-1"><strong>Тариф:</strong> {tariff || 'PRO'}</p>
        </div>

        <Link 
          href="https://t.me/YuransiS"
          target="_blank"
          className="mt-8 inline-block rounded-full bg-[#81D8D0] px-12 py-5 text-lg font-bold uppercase tracking-wider text-[#4E0000] transition-transform hover:scale-105 shadow-[0_0_30px_rgba(129,216,208,0.3)] w-full"
        >
          Звернутися в техпідтримку
        </Link>
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
