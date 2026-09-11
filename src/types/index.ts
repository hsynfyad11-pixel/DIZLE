export type ShopCategory = 'STANDARD' | 'SUPERMARKET';

export interface Product {
  id: string;
  shopId: string;
  name: string;
  nameAr: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
}

export interface Shop {
  id: string;
  name: string;
  nameAr: string;
  description?: string | null;
  category: ShopCategory;
  areaName?: string | null;
  deliveryFee: number;
  imageUrl?: string | null;
  rating: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  products?: Product[];
}

export interface CartItem {
  product: {
    id: string;
    shopId: string;
    nameAr: string;
    price: number;
    imageUrl?: string | null;
  };
  quantity: number;
}

export interface CheckoutPayload {
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  notes?: string;
}

export interface OrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  pinCode?: string;
  vehicle?: string | null;
  currentDebt: number;
  maxCreditLimit: number;
  isAvailable: boolean;
}

