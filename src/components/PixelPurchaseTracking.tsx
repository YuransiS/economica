'use client';

import { useEffect } from 'react';

export default function PixelPurchaseTracking({ value, currency = 'USD' }: { value: number, currency?: string }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'Purchase', { value, currency });
    }
  }, [value, currency]);
  
  return null;
}
