import { apiClient } from './client';
import { CartItem } from '../types';

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
}

export interface CreateOrderPayload {
  addressId: string;
  items?: OrderItem[];
  paymentMethod: 'razorpay' | 'stripe' | 'cod';
  shippingType: 'standard' | 'express';
  couponCode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  stripePaymentIntentId?: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  _id?: string;
  orderId: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  items: CartItem[];
  deliveryAddress: any;
  estimatedDelivery: string;
  createdAt: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  totals: {
    subtotal: number;
    discount: number;
    couponDiscount: number;
    shippingFee: number;
    tax: number;
    total: number;
  };
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-NK-00012345',
    orderId: 'ORD-NK-00012345',
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'razorpay',
    items: [],
    deliveryAddress: { name: 'Ananya Roy', city: 'Mumbai', state: 'Maharashtra' },
    estimatedDelivery: 'Thu, 10 Aug',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    courierName: 'BlueDart Express',
    trackingNumber: 'BD8729340123',
    trackingUrl: 'https://bluedart.com/track',
    totals: { subtotal: 3999, discount: 1000, couponDiscount: 500, shippingFee: 0, tax: 200, total: 2699 },
  },
  {
    id: 'ORD-NK-00012346',
    orderId: 'ORD-NK-00012346',
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: 'stripe',
    items: [],
    deliveryAddress: { name: 'Ananya Roy', city: 'Mumbai', state: 'Maharashtra' },
    estimatedDelivery: 'Sat, 16 Aug',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    courierName: 'Delhivery',
    trackingNumber: 'DEL9812034567',
    trackingUrl: 'https://delhivery.com/track',
    totals: { subtotal: 5999, discount: 2000, couponDiscount: 0, shippingFee: 0, tax: 300, total: 4299 },
  },
  {
    id: 'ORD-NK-00012347',
    orderId: 'ORD-NK-00012347',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'cod',
    items: [],
    deliveryAddress: { name: 'Ananya Roy', city: 'Mumbai', state: 'Maharashtra' },
    estimatedDelivery: 'Tue, 19 Aug',
    createdAt: new Date().toISOString(),
    totals: { subtotal: 1999, discount: 500, couponDiscount: 0, shippingFee: 149, tax: 100, total: 1748 },
  },
];

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    try {
      return await apiClient.post<Order>('/orders', payload);
    } catch (error) {
      const orderId = `ORD-NK-${Date.now().toString().slice(-8).toUpperCase()}`;
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + (payload.shippingType === 'express' ? 2 : 5));
      return {
        id: orderId,
        orderId,
        status: 'CONFIRMED',
        paymentStatus: payload.paymentMethod === 'cod' ? 'PENDING' : 'PAID',
        paymentMethod: payload.paymentMethod,
        items: [],
        deliveryAddress: {},
        estimatedDelivery: delivery.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' }),
        createdAt: new Date().toISOString(),
        totals: { subtotal: 0, discount: 0, couponDiscount: 0, shippingFee: 0, tax: 0, total: 0 },
      };
    }
  },

  getUserOrders: async (): Promise<Order[]> => {
    try {
      return await apiClient.get<Order[]>('/orders');
    } catch (error) {
      return MOCK_ORDERS;
    }
  },

  getOrderDetails: async (id: string): Promise<Order> => {
    try {
      return await apiClient.get<Order>(`/orders/${id}`);
    } catch (error) {
      const found = MOCK_ORDERS.find((o) => o.id === id || o.orderId === id);
      if (found) return found;
      const delivery = new Date();
      delivery.setDate(delivery.getDate() + 5);
      return {
        id,
        orderId: id,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: 'razorpay',
        items: [],
        deliveryAddress: { name: 'Ananya Roy', city: 'Mumbai', state: 'Maharashtra' },
        estimatedDelivery: delivery.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' }),
        createdAt: new Date().toISOString(),
        totals: { subtotal: 2999, discount: 1000, couponDiscount: 0, shippingFee: 0, tax: 150, total: 2149 },
      };
    }
  },

  cancelOrder: async (id: string): Promise<{ success: boolean }> => {
    try {
      return await apiClient.delete(`/orders/${id}`);
    } catch (error) {
      return { success: true };
    }
  },

  downloadInvoice: async (id: string): Promise<void> => {
    try {
      const url = `/api/v1/orders/${id}/invoice`;
      window.open(url, '_blank');
    } catch (error) {
      console.warn('Invoice download not available in offline mode');
    }
  },
};

