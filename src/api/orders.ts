import { apiClient } from './client';
import { addressesApi } from './addresses';
import { CartItem } from '../types';
import { formatImageUrl } from '../utils/imageUtils';

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
}

export interface CreateOrderPayload {
  addressId?: string;
  shippingAddress?: any;
  items?: OrderItem[];
  paymentMethod: 'razorpay' | 'cod';
  shippingType: 'standard' | 'express';
  couponCode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export interface ReturnItemSelection {
  productId: string;
  variantId?: string;
  sku?: string;
  quantity: number;
}

export interface CodRefundDetails {
  upiId?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountName?: string;
}

export interface RequestReturnPayload {
  orderId: string;
  reason: string;
  notes?: string;
  items: ReturnItemSelection[];
  refundMethod?: 'UPI' | 'BANK';
  refundDetails?: CodRefundDetails;
  images?: string[];
}

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
  shippingInfo?: any;
  returnInfo?: any;
  pricing?: {
    subtotal: number;
    totalMrp: number;
    totalDiscount: number;
    couponDiscount: number;
    onlinePaymentDiscount?: number;
    tax: number;
    shippingFee: number;
    grandTotal: number;
  };
  grandTotal?: number;
  totals: {
    subtotal: number;
    discount: number;
    couponDiscount: number;
    onlinePaymentDiscount?: number;
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
    paymentMethod: 'razorpay',
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
    let shippingAddress = payload.shippingAddress;
    if (!shippingAddress && payload.addressId) {
      try {
        const addresses = await addressesApi.getAddresses();
        const found = addresses.find((a: any) => a._id === payload.addressId || a.id === payload.addressId);
        if (found) {
          shippingAddress = {
            street: found.street,
            city: found.city,
            state: found.state,
            postalCode: found.postalCode,
            country: found.country || 'India',
            phone: found.phone || '+919876543210',
          };
        }
      } catch (e) {}
    }

    if (!shippingAddress) {
      shippingAddress = {
        street: 'Main Street Address',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        phone: '+919876543210',
      };
    }

    const backendPayload: Record<string, any> = {
      addressId: payload.addressId,
      shippingAddress,
      paymentMethod: (payload.paymentMethod || 'COD').toString().toUpperCase(),
      shippingMethod: payload.shippingType === 'express' ? 'EXPRESS' : 'STANDARD',
      couponCode: payload.couponCode,
      razorpayOrderId: payload.razorpayOrderId,
      razorpayPaymentId: payload.razorpayPaymentId,
      razorpaySignature: payload.razorpaySignature,
    };
    Object.keys(backendPayload).forEach((key) => {
      if (backendPayload[key] === undefined) {
        delete backendPayload[key];
      }
    });

    try {
      const res: any = await apiClient.post('/checkout/place-order', backendPayload);
      const orderId = res.orderNumber || res.orderId || res._id || res.id;
      const totalAmount = res.pricing?.grandTotal ?? res.grandTotal ?? res.totals?.total ?? 0;
      return {
        ...res,
        id: orderId,
        orderId,
        totals: {
          subtotal: res.pricing?.subtotal ?? 0,
          discount: res.pricing?.totalDiscount ?? 0,
          couponDiscount: res.pricing?.couponDiscount ?? 0,
          onlinePaymentDiscount: res.pricing?.onlinePaymentDiscount ?? 0,
          shippingFee: res.pricing?.shippingFee ?? 0,
          tax: res.pricing?.tax ?? 0,
          total: totalAmount,
        },
      };
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  },

  getUserOrders: async (): Promise<Order[]> => {
    try {
      let res: any;
      try {
        res = await apiClient.get('/orders/my');
      } catch (e) {
        try {
          res = await apiClient.get('/orders');
        } catch (e2) {
          // ignore
        }
      }

      const rawList = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : (res?.items || []);

      return rawList.map((item: any) => {
        const orderId = item.orderNumber || item.orderId || item._id || item.id;
        const totalAmount = item.pricing?.grandTotal ?? item.grandTotal ?? item.totals?.total ?? 0;
        
        const estDate = item.shippingInfo?.estimatedDelivery 
          ? new Date(item.shippingInfo.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
          : '3-5 Business Days';

        return {
          ...item,
          id: orderId,
          orderId,
          status: item.orderStatus || item.status || 'CONFIRMED',
          paymentStatus: item.paymentInfo?.status || item.paymentStatus || 'PAID',
          paymentMethod: item.paymentInfo?.method || item.paymentMethod || 'COD',
          deliveryAddress: item.shippingAddress || item.deliveryAddress || {},
          estimatedDelivery: item.estimatedDelivery || estDate,
          shippingInfo: item.shippingInfo,
          returnInfo: item.returnInfo,
          items: (item.items || []).map((it: any) => ({
            id: it.productId || it._id || it.sku,
            productId: it.productId,
            variantId: it.variantId,
            sku: it.sku,
            name: it.name || it.title || 'NiaKylie Fashion Item',
            price: it.unitPrice || it.price || 0,
            quantity: it.quantity || 1,
            color: it.color,
            size: it.size,
            image: formatImageUrl(it.image || (typeof it.productId === 'object' ? (it.productId?.thumbnail || it.productId?.images?.[0]) : undefined)),
          })),
          createdAt: item.createdAt || new Date().toISOString(),
          totals: {
            subtotal: item.pricing?.subtotal ?? item.totals?.subtotal ?? 0,
            discount: item.pricing?.totalDiscount ?? item.totals?.discount ?? 0,
            couponDiscount: item.pricing?.couponDiscount ?? item.totals?.couponDiscount ?? 0,
            onlinePaymentDiscount: item.pricing?.onlinePaymentDiscount ?? item.totals?.onlinePaymentDiscount ?? 0,
            shippingFee: item.pricing?.shippingFee ?? item.totals?.shippingFee ?? 0,
            tax: item.pricing?.tax ?? item.totals?.tax ?? 0,
            total: totalAmount,
          },
        };
      });
    } catch (error) {
      console.warn('Failed to fetch user orders from backend API:', error);
      return [];
    }
  },

  getOrderDetails: async (id: string): Promise<Order> => {
    try {
      let res: any;
      try {
        res = await apiClient.get(`/checkout/orders/${id}`);
      } catch (e) {
        res = await apiClient.get(`/orders/my/${id}`);
      }
      const orderId = res.orderNumber || res.orderId || res._id || res.id;
      const totalAmount = res.pricing?.grandTotal ?? res.grandTotal ?? res.totals?.total ?? 0;
      
      const estDate = res.shippingInfo?.estimatedDelivery 
        ? new Date(res.shippingInfo.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
        : '3-5 Business Days';

      return {
        ...res,
        id: orderId,
        orderId,
        status: res.orderStatus || res.status || 'CONFIRMED',
        paymentStatus: res.paymentInfo?.status || res.paymentStatus || 'PAID',
        paymentMethod: res.paymentInfo?.method || res.paymentMethod || 'COD',
        deliveryAddress: res.shippingAddress || res.deliveryAddress || {},
        estimatedDelivery: res.estimatedDelivery || estDate,
        shippingInfo: res.shippingInfo,
        returnInfo: res.returnInfo,
        items: (res.items || []).map((it: any) => ({
          id: it.productId || it._id || it.sku,
          productId: it.productId,
          variantId: it.variantId,
          sku: it.sku,
          name: it.name || it.title || 'NiaKylie Fashion Item',
          price: it.unitPrice || it.price || 0,
          quantity: it.quantity || 1,
          color: it.color,
          size: it.size,
          image: formatImageUrl(it.image || (typeof it.productId === 'object' ? (it.productId?.thumbnail || it.productId?.images?.[0]) : undefined)),
        })),
        createdAt: res.createdAt || new Date().toISOString(),
        totals: {
          subtotal: res.pricing?.subtotal ?? res.totals?.subtotal ?? 0,
          discount: res.pricing?.totalDiscount ?? res.totals?.discount ?? 0,
          couponDiscount: res.pricing?.couponDiscount ?? res.totals?.couponDiscount ?? 0,
          onlinePaymentDiscount: res.pricing?.onlinePaymentDiscount ?? res.totals?.onlinePaymentDiscount ?? 0,
          shippingFee: res.pricing?.shippingFee ?? res.totals?.shippingFee ?? 0,
          tax: res.pricing?.tax ?? res.totals?.tax ?? 0,
          total: totalAmount,
        },
      };
    } catch (error) {
      console.warn('Failed to fetch order details:', error);
      const found = MOCK_ORDERS.find((o) => o.id === id || o.orderId === id);
      if (found) return found;
      throw error;
    }
  },

  cancelOrder: async (id: string): Promise<{ success: boolean }> => {
    try {
      await apiClient.post(`/orders/my/${id}/cancel`, { reason: 'Cancelled by user from account portal' });
      return { success: true };
    } catch (error) {
      console.error('Failed to cancel order:', error);
      return { success: false };
    }
  },

  requestReturn: async (payload: RequestReturnPayload): Promise<Order> => {
    const res: any = await apiClient.post('/orders/my/return', payload);
    return {
      ...res,
      id: res.orderNumber || res.orderId || res._id || res.id,
      orderId: res.orderNumber || res.orderId || res._id || res.id,
      status: res.orderStatus || res.status,
      returnInfo: res.returnInfo,
    };
  },

  downloadInvoice: async (id: string): Promise<void> => {
    try {
      const invoiceData = await ordersApi.getInvoice(id);
      if (invoiceData && invoiceData.htmlTemplate) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(invoiceData.htmlTemplate);
          printWindow.document.close();
        }
      } else {
        const url = `http://localhost:3000/api/v1/checkout/orders/${id}/invoice`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.warn('Invoice download error:', error);
    }
  },

  getInvoice: async (id: string): Promise<any> => {
    try {
      try {
        return await apiClient.get(`/checkout/orders/${id}/invoice`);
      } catch (e) {
        return await apiClient.get(`/orders/my/${id}/invoice`);
      }
    } catch (error) {
      return null;
    }
  },
};


