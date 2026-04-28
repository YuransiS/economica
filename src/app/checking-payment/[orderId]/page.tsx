'use client';

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CheckingPaymentPage({ 
  params 
}: { 
  params: Promise<{ orderId: string }> 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orderId } = use(params);
  const tariff = searchParams.get('tariff') || 'Invest Baby';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 5;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/wayforpay/check-status?orderId=${orderId}`);
        const data = await response.json();

        if (data.success) {
          const status = data.status.toLowerCase();
          const isReservation = tariff === 'Invest Baby' || tariff === 'Business Baby' || tariff === 'Finance Baby';
          const basePath = isReservation ? '/price' : '';

          if (status === 'approved') {
            router.push(`${basePath}/thank-you/${orderId}?tariff=${tariff}`);
            return true;
          } else if (status === 'declined' || status === 'fail' || status === 'expired') {
            router.push(`${basePath}/failure/${orderId}?tariff=${tariff}`);
            return true;
          }
          // If status is 'InProcessing' or 'Pending', we might want to wait
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
      return false;
    };

    const interval = setInterval(async () => {
      attempts++;
      const done = await checkStatus();
      if (done || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!done) {
          // Fallback if we still don't know after 5 attempts
          const isReservation = tariff === 'Invest Baby' || tariff === 'Business Baby' || tariff === 'Finance Baby';
          const basePath = isReservation ? '/price' : '';
          router.push(`${basePath}/failure/${orderId}?tariff=${tariff}`);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId, tariff, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFAF8] p-6 text-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl border border-[#81D8D0]/20">
        <Loader2 className="h-16 w-16 text-[#81D8D0] animate-spin mx-auto mb-6" />
        <h1 className="mb-4 font-montserrat text-2xl font-black text-[#4E0000] uppercase tracking-tight">
          Перевіряємо статус оплати
        </h1>
        <p className="font-arimo text-gray-600">
          Будь ласка, зачекайте кілька секунд. Ми отримуємо підтвердження від платіжної системи...
        </p>
        <div className="mt-8 text-xs text-gray-400">
          Замовлення: {orderId}
        </div>
      </div>
    </div>
  );
}
