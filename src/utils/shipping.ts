export const FREE_SHIPPING_THRESHOLD = 1000;
export const STANDARD_SHIPPING_FEE = 99;
export const EXPRESS_SHIPPING_FEE = 149;

export type ShippingType = 'standard' | 'express';

export interface ShippingConfig {
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  freeShippingThreshold: number;
}

export const defaultShippingConfig: ShippingConfig = {
  standardDeliveryFee: STANDARD_SHIPPING_FEE,
  expressDeliveryFee: EXPRESS_SHIPPING_FEE,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
};

/** Shipping is calculated from the item subtotal, before discounts. */
export function getShippingFee(
  subtotal: number,
  shippingType: ShippingType = 'standard',
  config: ShippingConfig = defaultShippingConfig
): number {
  if (subtotal <= 0) return 0;
  if (shippingType === 'express') return Math.max(0, Number(config.expressDeliveryFee) || 0);
  return subtotal >= (Number(config.freeShippingThreshold) || 0)
    ? 0
    : Math.max(0, Number(config.standardDeliveryFee) || 0);
}
