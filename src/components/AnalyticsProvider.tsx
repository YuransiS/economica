'use client';

import React, { Suspense } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

const AnalyticsInner = ({ children }: { children: React.ReactNode }) => {
  useAnalytics();
  return <>{children}</>;
};

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<>{children}</>}>
      <AnalyticsInner>{children}</AnalyticsInner>
    </Suspense>
  );
};
