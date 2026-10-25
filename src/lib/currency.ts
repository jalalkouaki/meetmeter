import { CurrencyCode } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  MAD: 'MAD ',
};

// Static conversion rates against USD (base)
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  MAD: 10.15,
};

export function formatCurrency(
  amountInUSD: number,
  currency: CurrencyCode = 'USD',
  exchangeRates: Record<CurrencyCode, number> = DEFAULT_EXCHANGE_RATES,
  hideCost: boolean = false
): string {
  if (hideCost) return '•••';

  const rate = exchangeRates[currency] || 1.0;
  const converted = amountInUSD * rate;
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  return `${symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
