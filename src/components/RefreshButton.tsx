'use client';

import { Loader2 } from 'lucide-react';

export default function RefreshButton() {
  return (
    <button 
      onClick={() => typeof window !== 'undefined' && window.location.reload()}
      className="inline-flex items-center justify-center space-x-2 rounded-full border-2 border-[#81D8D0] hover:bg-[#81D8D0]/10 px-12 py-4 text-base font-bold uppercase tracking-wider text-[#4E0000] transition-all w-full cursor-pointer"
    >
      <Loader2 className="w-5 h-5 animate-spin text-[#81D8D0]" />
      <span>Оновити статус</span>
    </button>
  );
}
