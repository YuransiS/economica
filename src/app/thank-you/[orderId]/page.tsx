import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function ThankYouPage({ params }: { params: { orderId: string } }) {
  // We can securely hide this page from crawlers or only show it if orderId starts with 'ORDER_' as rudimentary verification
  const isValidOrder = params.orderId.startsWith('ORDER_');

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
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl border border-[#81D8D0]/20">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[#81D8D0]/10 p-4">
            <CheckCircle2 className="h-16 w-16 text-[#81D8D0]" />
          </div>
        </div>
        
        <h1 className="mb-2 font-montserrat text-3xl font-black text-[#4E0000] uppercase tracking-tight">
          Дякуємо за оплату!
        </h1>
        
        <p className="mb-8 font-arimo text-lg text-gray-600">
          Ваше замовлення успішно оформлене. Незабаром ми з вами зв'яжемося та надамо всі необхідні доступи до практикуму.
        </p>

        <div className="rounded-xl bg-gray-50 p-4 text-left text-sm text-gray-500 font-narrow">
          <p><strong>Номер замовлення:</strong> {params.orderId}</p>
          <p className="mt-1">Будь ласка, збережіть цю сторінку або зробіть скріншот.</p>
        </div>

        <Link 
          href="/" 
          className="mt-8 inline-block rounded-xl bg-[#4E0000] px-8 py-4 px-full font-bold uppercase tracking-wider text-white transition-transform hover:scale-105"
        >
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
}
