'use client';

import React from 'react';
import { useRealTimeTransactions } from '@/hooks/useRealTimeTransactions';

export function SSEProvider({ children }: { children: React.ReactNode }) {
  useRealTimeTransactions();
  return <>{children}</>;
}
