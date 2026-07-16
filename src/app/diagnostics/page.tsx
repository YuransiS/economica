import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import DiagnosticsClient from "./DiagnosticsClient";

export const metadata: Metadata = {
  title: "Фінансова діагностика та аудит | Софія Федуняк",
  description: "Отримайте покроковий план створення пасивного доходу та аудиту ваших фінансів від ліцензованих фінансових радників.",
  openGraph: {
    title: "Фінансова діагностика та аудит | Софія Федуняк",
    description: "Розрахуємо необхідний капітал, суму інвестицій та складемо твій покроковий план до фінансово незалежної пенсії або накопичення капіталу.",
    type: "website"
  }
};

export default function DiagnosticsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#1A0000] flex items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-[#81D8D0] animate-spin" />
      </main>
    }>
      <DiagnosticsClient />
    </Suspense>
  );
}
