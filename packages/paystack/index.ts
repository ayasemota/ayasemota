export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

export const convertToKobo = (amount: number): number => {
  return Math.round(amount * 100);
};

export const convertFromKobo = (amount: number): number => {
  return amount / 100;
};