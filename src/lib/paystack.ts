// Helper utilities for Paystack online payments

const rawPaystackKey: string =
  (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) ||
  (import.meta.env.PAYSTACK_PUBLIC_KEY as string) ||
  '';

export const getPaystackPublicKey = (): string => {
  return rawPaystackKey.trim();
};

export const isPaystackConfigured = (): boolean => {
  const key = getPaystackPublicKey();
  return (
    Boolean(key) &&
    (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
    !key.includes('placeholder') &&
    !key.includes('your_paystack') &&
    !key.includes('your-paystack')
  );
};

export const isPaystackTestMode = (): boolean => {
  const key = getPaystackPublicKey();
  return key.startsWith('pk_test_');
};
