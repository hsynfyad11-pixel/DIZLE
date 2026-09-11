import { notifyStoreOwner } from './src/lib/telegram.ts';

const mockOrder = {
  id: "test_telegram_123",
  shopId: "shop_123",
  shop: { nameAr: "متجر الاختبار" },
  customerName: "عميل تيليجرام",
  customerPhone: "07700000000",
  deliveryArea: "حي الجامعة",
  grandTotal: 15500,
  items: [
    {
      product: { nameAr: "وجبة سريعة (टेस्ट)" },
      quantity: 2
    }
  ]
};

notifyStoreOwner(mockOrder, "@dizly7").then(res => console.log('Done')).catch(err => console.error(err));
