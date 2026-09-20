/**
 * Currency utility for Nigerian Naira (NGN, ₦)
 */

export const CURRENCY_SYMBOL = '₦';
export const CURRENCY_CODE = 'NGN';

export const FREE_DELIVERY_THRESHOLD = 15000; // ₦15,000
export const STANDARD_DELIVERY_FEE = 1500;    // ₦1,500

/**
 * Format a numeric amount into Nigerian Naira currency format (e.g. ₦3,500 or ₦3,500.50)
 */
export function formatNaira(amount: number | string | undefined | null): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(numericAmount)) return '₦0';

  return `₦${numericAmount.toLocaleString('en-NG', {
    minimumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export const formatCurrency = formatNaira;
