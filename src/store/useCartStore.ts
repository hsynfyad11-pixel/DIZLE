import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartProduct {
  id: string;
  shopId: string;
  nameAr: string;
  price: number;
  imageUrl?: string | null;
}

export interface CartItem {
  product: CartProduct;
  shopName: string;
  deliveryFee: number;
  quantity: number;
}

export interface ShopInfo {
  shopId: string;
  shopName: string;
  deliveryFee: number;
}

interface CartStore {
  items: CartItem[];

  // Store Actions
  addItem: (product: CartProduct, shopName: string, deliveryFee: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

  // Computed Multi-Shop helper getters
  getUniqueShops: () => ShopInfo[];
  getTotalDeliveryFee: () => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getGrandTotal: () => number;
  getItemQuantity: (productId: string) => number;
}

const MULTI_SHOP_EXTRA_STOP_FEE = 250; // Additional delivery fee per extra shop stop

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, shopName, deliveryFee) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.product.id === product.id);

        if (existingIndex > -1) {
          const updated = [...items];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          set({ items: updated });
        } else {
          set({
            items: [
              ...items,
              {
                product,
                shopName: shopName || 'متجر مجهول',
                deliveryFee: deliveryFee ?? 1500,
                quantity: 1,
              },
            ],
          });
        }
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((i) => i.product.id !== productId) });
        } else {
          set({
            items: items.map((i) =>
              i.product.id === productId ? { ...i, quantity } : i
            ),
          });
        }
      },

      removeItem: (productId) => {
        get().updateQuantity(productId, 0);
      },

      clearCart: () => {
        set({ items: [] });
      },

      getUniqueShops: () => {
        const { items } = get();
        const shopsMap = new Map<string, ShopInfo>();
        items.forEach((item) => {
          if (!shopsMap.has(item.product.shopId)) {
            shopsMap.set(item.product.shopId, {
              shopId: item.product.shopId,
              shopName: item.shopName,
              deliveryFee: item.deliveryFee,
            });
          }
        });
        return Array.from(shopsMap.values());
      },

      getTotalDeliveryFee: () => {
        const shops = get().getUniqueShops();
        if (!shops || shops.length === 0) return 0;
        const validFees = shops.map((s) => (typeof s.deliveryFee === 'number' && !isNaN(s.deliveryFee) ? s.deliveryFee : 1500));
        const baseFee = validFees.length > 0 ? Math.max(...validFees, 1500) : 1500;
        const extraStopsFee = (shops.length - 1) * MULTI_SHOP_EXTRA_STOP_FEE;
        return baseFee + extraStopsFee;
      },

      getTotalItems: () => {
        const items = get().items || [];
        return items.reduce((sum, i) => sum + (i?.quantity || 0), 0);
      },

      getTotalPrice: () => {
        const items = get().items || [];
        return items.reduce((sum, i) => sum + (i?.product?.price || 0) * (i?.quantity || 0), 0);
      },

      getGrandTotal: () => {
        return get().getTotalPrice() + get().getTotalDeliveryFee();
      },

      getItemQuantity: (productId) => {
        const items = get().items || [];
        const item = items.find((i) => i?.product?.id === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'dazly-cart-storage-v2',
    }
  )
);
