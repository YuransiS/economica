'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1A0000] border-t border-white/5 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <div className="text-center md:text-left">
            <p>© {new Date().getFullYear()} ФОП ЮРЧУК ДМИТРО ОЛЕКСАНДРОВИЧ. Всі права захищені.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy-policy" className="hover:text-[#81D8D0] transition-colors underline underline-offset-4">
              Політика конфіденційності
            </Link>
            <Link href="/public-offer" className="hover:text-[#81D8D0] transition-colors underline underline-offset-4">
              Публічна оферта
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
