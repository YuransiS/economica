import type { Metadata } from "next";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Доступ обмежено",
  description: "Доступ до цього ресурсу тимчасово обмежено.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RestrictedPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-montserrat">
      <div className="max-w-md w-full text-center space-y-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="mx-auto w-16 h-16 bg-zinc-800/80 border border-zinc-700/60 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
          <Lock className="w-8 h-8 stroke-[1.75]" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
            Доступ до цього ресурсу тимчасово обмежено
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed pt-1">
            На даний момент сторінка недоступна. Спробуйте, будь-ласка, пізніше
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-800/80 text-xs text-zinc-500">
          <p>© 2026 B&W Prod. | Sofiya Fedinyak. Всі права захищені.</p>
        </div>
      </div>
    </main>
  );
}

