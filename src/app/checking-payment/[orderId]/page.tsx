'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { loginUser } from "@/app/minicourse/actions";
import InAppBrowserOverlay from "@/components/InAppBrowserOverlay";

function getFriendlyErrorReason(reason: string): string {
  if (!reason) {
    return "Платіж було відхилено банком або термін дії сесії оплати закінчився.";
  }
  
  const rLower = reason.toLowerCase();
  
  if (rLower.includes('declined to card issuer') || rLower.includes('declined to cardissuer') || rLower.includes('decline')) {
    return "Оплату відхилено вашим банком-емітентом (Declined to Card Issuer). " + 
           "Найчастіша причина: перевищення ліміту на інтернет-покупки, недостатньо коштів або обмеження на операції за кордон. " + 
           "Будь ласка, перевірте налаштування картки в додатку вашого банку (збільште інтернет-ліміт) або спробуйте іншу картку/Google Pay/Apple Pay.";
  }
  
  if (rLower.includes('insufficient funds') || rLower.includes('not enough money')) {
    return "Недостатньо коштів на вашій картці для завершення транзакції. " + 
           "Будь ласка, поповніть рахунок або скористайтеся іншою карткою.";
  }

  if (rLower.includes('limit') || rLower.includes('exceeded')) {
    return "Перевищено ліміт інтернет-оплат по вашій картці. " + 
           "Будь ласка, збільште ліміт на інтернет-покупки у вашому банківському додатку та спробуйте ще раз.";
  }
  
  if (rLower.includes('expired')) {
    return "Термін дії картки закінчився або час сесії оплати вийшов. Спробуйте іншу картку або повторіть платіж.";
  }
  
  return `Платіж не підтверджено платіжною системою. Причина: ${reason}. Будь ласка, перевірте налаштування картки або зверніться до підтримки.`;
}

export default function CheckingPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const orderId = params.orderId as string;
  const tariff = searchParams.get('tariff') || 'Практикум';
  
  const [checkingStatus, setCheckingStatus] = useState<'checking' | 'approved' | 'failed'>('checking');
  const [error, setError] = useState<string | null>(null);
  const pixelFired = useRef(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10; // Extra attempts to ensure we catch slow webhooks
    
    const savedTelegram = typeof window !== 'undefined' ? (localStorage.getItem('user_telegram') || '') : '';
    const savedPhone = typeof window !== 'undefined' ? (localStorage.getItem('user_phone') || '') : '';
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/wayforpay/check-status?orderId=${orderId}&phone=${encodeURIComponent(savedPhone)}&telegram=${encodeURIComponent(savedTelegram)}`);
        const data = await response.json();

        // Developer Console Diagnostic Report
        console.group("%c💳 WayForPay Developer Report", "color: #ff3b30; font-weight: bold; font-size: 14px;");
        console.log("%cOrder Reference:", "font-weight: bold; color: #0076ff;", orderId);
        console.log("%cTariff:", "font-weight: bold; color: #0076ff;", tariff);
        console.log("%cPayment Status:", "font-weight: bold; color: #0076ff;", data.status);
        console.log("%cReason/Error:", "font-weight: bold; color: #0076ff;", data.reason);
        console.log("%cRaw Response Payload:", "font-weight: bold; color: #0076ff;", data.raw);

        if (data.reasonCode === 1127 || (data.reason && data.reason.includes("Order Not Found"))) {
          console.warn(
            "%c⚠️ DIAGNOSTIC ERROR 1127 (Order Not Found):\n" +
            "This means WayForPay has no record of this order reference. The user's transaction was rejected at initialization.\n" +
            "If the user was immediately redirected back from WayForPay, this is caused by:\n" +
            "1. The merchant account ('sofi_finsight') does not have the selected currency ('UAH') enabled in their settings.\n" +
            "2. Missing required parameters in the client checkout form submission (such as approveUrl or declineUrl).",
            "font-family: monospace; font-size: 12px; line-height: 1.4;"
          );
        }
        console.groupEnd();

        if (data.success) {
          const status = data.status.toLowerCase();
          const isReservation = tariff === 'Invest Baby' || tariff === 'Business Baby' || tariff === 'Finance Baby';
          const basePath = isReservation ? '/price' : '';

          if (status === 'approved') {
            setCheckingStatus('approved');

            // 1. Sync paid state locally for Mock Mode
            if (savedTelegram || savedPhone) {
              const localUsersStr = localStorage.getItem('minicourse_users');
              if (localUsersStr) {
                try {
                  const users = JSON.parse(localUsersStr);
                  const tgClean = (savedTelegram || '').replace(/^@/, '').trim().toLowerCase();
                  const phoneClean = (savedPhone || '').trim().replace(/\D/g, '');
                  
                  const userIndex = users.findIndex((u: any) => 
                    (u.telegram && u.telegram.toLowerCase() === tgClean) || 
                    (u.phone && u.phone.replace(/\D/g, '') === phoneClean)
                  );

                  if (userIndex !== -1) {
                    users[userIndex].is_paid = true;
                    users[userIndex].payment_status = 'paid';
                    localStorage.setItem('minicourse_users', JSON.stringify(users));
                  }
                } catch (e) {
                  console.error("Error updating local mock user to paid:", e);
                }
              }

              // 2. Auto-login
              try {
                const loginInput = savedTelegram || savedPhone;
                if (loginInput) {
                  const deviceUuid = localStorage.getItem('minicourse_device_uuid') || '';
                  const result = await loginUser(loginInput, localStorage.getItem('user_name') || undefined, deviceUuid);
                  if (result.success && result.user) {
                    localStorage.setItem('minicourse_session', JSON.stringify(result.user));
                  } else {
                    console.error("Auto-login failed on checker page:", result.error);
                  }
                }
              } catch (loginErr) {
                console.error("Auto-login error on checker page:", loginErr);
              }
            }

            // 3. Fire Facebook Pixel Purchase Event
            if (!pixelFired.current) {
              pixelFired.current = true;
              if (typeof window !== 'undefined' && (window as any).fbq) {
                const purchaseValue = isReservation ? 25.00 : 9.00; // Minicourse is 9 USD
                console.log(`[FB Pixel] Tracking Purchase event: value=${purchaseValue} USD`);
                (window as any).fbq('track', 'Purchase', { 
                  value: purchaseValue, 
                  currency: 'USD',
                  content_name: isReservation ? 'Sofia Invest Reservation' : 'Sofia Minicourse'
                });
              }
            }

            // 4. Delayed redirect to allow pixel event to fire and show beautiful success screen
            setTimeout(() => {
              if (isReservation) {
                router.push(`${basePath}/thank-you/${orderId}?tariff=${tariff}`);
              } else if (tariff && tariff.includes('Діагностика')) {
                router.push(`/thank-you/${orderId}?tariff=${tariff}`);
              } else {
                // Redirect straight to Telegram bot activation link!
                window.location.href = `https://telegram.me/sofifmc_bot?start=pay_${orderId}`;
              }
            }, 2500);

            return true;
          } else if (status === 'declined' || status === 'fail' || status === 'expired') {
            setCheckingStatus('failed');
            setError(getFriendlyErrorReason(data.reason));
            return true;
          }
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
      return false;
    };

    // Run first check immediately
    checkStatus().then((done) => {
      if (done) return;
      
      const interval = setInterval(async () => {
        attempts++;
        const doneChecking = await checkStatus();
        if (doneChecking || attempts >= maxAttempts) {
          clearInterval(interval);
          if (!doneChecking) {
            setCheckingStatus('failed');
            setError("Не вдалося отримати автоматичне підтвердження від платіжної системи. Якщо кошти були списані, будь ласка, зверніться в підтримку.");
          }
        }
      }, 2500);

      return () => clearInterval(interval);
    });
  }, [orderId, tariff, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFAF8] p-6 text-center">
      <InAppBrowserOverlay />
      
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl border border-[#81D8D0]/20 transition-all duration-500">
        {checkingStatus === 'checking' && (
          <>
            <Loader2 className="h-16 w-16 text-[#81D8D0] animate-spin mx-auto mb-6" />
            <h1 className="mb-4 font-montserrat text-2xl font-black text-[#4E0000] uppercase tracking-tight">
              Перевіряємо статус оплати
            </h1>
            <p className="font-arimo text-gray-600">
              Будь ласка, зачекайте кілька секунд. Ми отримуємо підтвердження від платіжної системи...
            </p>
          </>
        )}

        {checkingStatus === 'approved' && (
          <div className="animate-fade-in">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-[#81D8D0]/10 p-4 animate-bounce">
                <CheckCircle2 className="h-16 w-16 text-[#81D8D0]" />
              </div>
            </div>
            <h1 className="mb-4 font-montserrat text-2xl font-black text-[#4E0000] uppercase tracking-tight">
              Оплата успішна!
            </h1>
            <p className="font-arimo text-gray-600 mb-6">
              Дякуємо! Ваш платіж підтверджено. Готуємо ваш доступ та перенаправляємо на платформу практикуму...
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-[#81D8D0] font-bold">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Перенаправлення...</span>
            </div>
          </div>
        )}

        {checkingStatus === 'failed' && (
          <div className="animate-fade-in">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-50 p-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
            </div>
            <h1 className="mb-4 font-montserrat text-2xl font-black text-red-700 uppercase tracking-tight">
              Оплата не підтверджена
            </h1>
            <p className="font-arimo text-gray-600 mb-8 leading-relaxed">
              {error || "Не вдалося підтвердити транзакцію. Спробуйте ще раз або зверніться до нашої служби підтримки."}
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/')}
                className="w-full rounded-xl bg-[#4E0000] py-4 text-center font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Повернутися на головну
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-400 font-narrow">
          Замовлення: {orderId}
        </div>
      </div>
    </div>
  );
}
