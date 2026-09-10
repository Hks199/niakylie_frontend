export const FREE_SHIPPING_THRESHOLD = 1000;
export const STANDARD_SHIPPING_FEE = 99;
export const EXPRESS_SHIPPING_FEE = 149;

export type ShippingType = 'standard' | 'express';

/** Shipping is calculated from the item subtotal, before discounts. */
export function getShippingFee(subtotal: number, shippingType: ShippingType = 'standard'): number {
  if (subtotal <= 0) return 0;
  if (shippingType === 'express') return EXPRESS_SHIPPING_FEE;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}
