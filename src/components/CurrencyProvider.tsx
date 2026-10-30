'use client';
import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_CURRENCY, formatConfiguredPrice, type CurrencySettings } from '@/lib/currencySettings';

const Context = createContext<CurrencySettings>(DEFAULT_CURRENCY);
export function CurrencyProvider({ initial, children }: { initial: CurrencySettings; children: ReactNode }) {
  return <Context.Provider value={initial}>{children}</Context.Provider>;
}
export function useCurrency() { return useContext(Context); }
export function usePriceFormatter() {
  const currency = useCurrency();
  return (price: unknown) => formatConfiguredPrice(price, currency);
}
