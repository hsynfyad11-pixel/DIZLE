'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import {
  ArrowRight,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Store,
  MessageCircle,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { MapLocationPicker } from '@/components/MapLocationPicker';

function CheckoutContent() {
  // =====================================================================
  // 1. ALL HOOKS ARE DECLARED UNCONDITIONALLY AT THE VERY TOP LEVEL
  // =====================================================================
  const router = useRouter();

  // Cart store hooks
  const cartItems = useCartStore((state) => state.items);
  const getUniqueShops = useCartStore((state) => state.getUniqueShops);
  const getTotalDeliveryFee = useCartStore((state) => state.getTotalDeliveryFee);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getGrandTotal = useCartStore((state) => state.getGrandTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Form & UI state hooks
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [streetName, setStreetName] = useState<string>('');
  const [houseDescription, setHouseDescription] = useState<string>('');
  const [houseImage, setHouseImage] = useState<string>('');
  const [mapCoordinates, setMapCoordinates] = useState<string>('');
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDirectSubmitting, setIsDirectSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [shopMinOrderAmount, setShopMinOrderAmount] = useState<number>(0);
  
  // Checkout Options
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [substitutionPreference, setSubstitutionPreference] = useState<string>('');
  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('حجم الصورة كبير جداً، يرجى اختيار صورة حجمها أقل من 5 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setHouseImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Two-step WhatsApp confirmation state hooks
  const [showWhatsAppPromptModal, setShowWhatsAppPromptModal] = useState<boolean>(false);
  const [pendingCreatedOrderId, setPendingCreatedOrderId] = useState<string>('');
  const [whatsappTargetUrl, setWhatsappTargetUrl] = useState<string>('');
  const [confirmingOrder, setConfirmingOrder] = useState<boolean>(false);

  // Single Effect Hook for client initialization and session loading
  useEffect(() => {
    fetch('/api/settings/whatsapp')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.adminWhatsAppNumber) {
          setAdminWhatsAppNumber(data.adminWhatsAppNumber);
        }
      })
      .catch((err) => console.error('Error fetching admin WhatsApp number:', err));

      const saved = localStorage.getItem('dazly_customer_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) setCustomerName(parsed.name);
          if (parsed.phone) setCustomerPhone(parsed.phone);
          if (parsed.area) setCustomerAddress(parsed.area);
          if (parsed.street) setStreetName(parsed.street);
          if (parsed.houseDesc) setHouseDescription(parsed.houseDesc);
          if (parsed.mapCoordinates) setMapCoordinates(parsed.mapCoordinates);
          if (parsed.houseImage) setHouseImage(parsed.houseImage);
        } catch (err) {
          console.error('Error reading saved session:', err);
        }
      }

      // Fetch dynamic Min Order Amount of the primary shop
      const primaryShopId = cartItems[0]?.product?.shopId;
      if (primaryShopId) {
        fetch(`/api/shop/info?id=${primaryShopId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && typeof data.shop.minOrderAmount === 'number') {
              setShopMinOrderAmount(data.shop.minOrderAmount);
            }
          })
          .catch(console.error);
      }
  }, [cartItems[0]?.product?.shopId]);

  // =====================================================================
  // 2. COMPUTED CALCULATIONS & HELPERS
  // =====================================================================
  const totalPrice = getTotalPrice();
  const deliveryFee = getTotalDeliveryFee();
  const grandTotal = getGrandTotal();
  const uniqueShops = getUniqueShops();

  const validFees = uniqueShops.map((s) => (typeof s.deliveryFee === 'number' && !isNaN(s.deliveryFee) ? s.deliveryFee : 1500));
  const baseDeliveryFee = validFees.length > 0 ? Math.max(...validFees, 1500) : 1500;
  
  const baseShopIndex = validFees.findIndex(f => f === baseDeliveryFee) > -1 ? validFees.findIndex(f => f === baseDeliveryFee) : 0;
  const baseShop = uniqueShops[baseShopIndex] || uniqueShops[0];
  const additionalShops = uniqueShops.filter((_, idx) => idx !== baseShopIndex);

  const getCleanWhatsAppNumber = (numStr: string) => {
    let cleaned = numStr.replace(/[^\d]/g, '');
    if (cleaned.startsWith('07') && cleaned.length === 11) {
      cleaned = '964' + cleaned.slice(1);
    } else if (cleaned.startsWith('01') && cleaned.length === 11) {
      cleaned = '20' + cleaned.slice(1);
    } else if (cleaned.startsWith('05') && cleaned.length === 10) {
      cleaned = '966' + cleaned.slice(1);
    } else if (cleaned.startsWith('0') && cleaned.length >= 10) {
      cleaned = '964' + cleaned.slice(1);
    }
    return cleaned;
  };

  // =====================================================================
  // 3. EVENT HANDLERS & SUBMISSION LOGIC
  // =====================================================================


  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوب الشحن إليها');
      return;
    }

    try {
      setIsDirectSubmitting(true);
      setErrorMsg('');

      const fullDeliveryArea = `${customerAddress.trim()} - الشارع: ${streetName.trim()} - المنزل: ${houseDescription.trim()}`;
      const primaryShopId = cartItems[0]?.product?.shopId;
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryArea: fullDeliveryArea,
        mapCoordinates: mapCoordinates.trim(),
        shopId: primaryShopId,
        items: cartItems,
        deliveryFee,
        houseImage: houseImage || undefined,
        orderNotes: orderNotes.trim() || undefined,
        substitutionPreference,
      };

      console.log('🛒 [DIRECT CHECKOUT SUBMIT] Sending order payload:', orderPayload);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (data.success && data.orderId) {
        console.log('✅ [DIRECT CHECKOUT SUCCESS] Saved in DB with ID:', data.orderId);

          localStorage.setItem(
            'dazly_customer_session',
            JSON.stringify({
              name: customerName.trim(),
              phone: customerPhone.trim(),
              area: customerAddress.trim(),
              street: streetName.trim(),
              houseDesc: houseDescription.trim(),
              mapCoordinates: mapCoordinates.trim(),
              houseImage: houseImage || undefined,
            })
          );

        clearCart();
        router.push(`/order-success?orderId=${data.orderId}`);
      } else {
        console.error('❌ [DIRECT CHECKOUT ERROR]:', data.error);
        setErrorMsg(data.error || 'حدث خطأ أثناء تثبيت الطلب، يرجى المحاولة لاحقاً');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg('فشل الاتصال بخادم الطلبات، تأكد من اتصال الإنترنت');
    } finally {
      setIsDirectSubmitting(false);
    }
  };

  // =====================================================================
  // 4. RENDER LOGIC (SAFE BECAUSE ALL HOOKS ARE DECLARED ABOVE)
  // =====================================================================
  if (cartItems.length === 0) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-200">سلتك فارغة حالياً</h1>
        <p className="text-xs text-slate-400 max-w-xs">يرجى إضافة منتجات من المتاجر قبل الشروع في إتمام الطلب</p>
        <Link
          href="/"
          className="py-2.5 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all"
        >
          العودة للرئيسية والتسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 text-right">
      
      {/* Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>متابعة التسوق</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">إتمام الطلب والمعلومات</h1>
      </div>

      <div className="p-3 bg-purple-600 font-bold text-white text-center rounded-xl animate-pulse text-sm">
        === Debug: New Fields Loaded ✓ ===
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2 text-red-400 text-xs font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleDirectSubmit} className="space-y-6">
        
        {/* CHECKOUT ACTION AT THE VERY TOP */}
        <div className="space-y-3 pt-2">
            {shopMinOrderAmount > 0 && totalPrice < shopMinOrderAmount && (
              <div className="p-3 bg-amber-950/70 border border-amber-500/60 rounded-xl flex items-start gap-2 text-amber-300 text-xs font-bold shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>عذراً، الحد الأدنى للطلبات في هذا المتجر هو {shopMinOrderAmount.toLocaleString('en-US')} د.ع (ينقصك {(shopMinOrderAmount - totalPrice).toLocaleString('en-US')} د.ع)</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isDirectSubmitting || (shopMinOrderAmount > 0 && totalPrice < shopMinOrderAmount)}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-base hover:bg-emerald-500 transition disabled:bg-slate-700 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 active:scale-95"
            >
              {isDirectSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تثبيت الطلب...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 fill-none stroke-current" />
                  <span>تأكيد الطلب النهائي ({grandTotal.toLocaleString('en-US')} د.ع)</span>
                </>
              )}
            </button>
        </div>

        {/* Customer Info Card */}
        <div className="space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <span>معلومات الزبون والمستلم</span>
          </h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">الاسم الثلاثي *</label>
              <input
                type="text"
                placeholder="أدخل اسمك الكريم"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">رقم الهاتف (مثلاً 0770...) *</label>
              <input
                type="tel"
                placeholder="رقم الهاتف للتواصل"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">المنطقة والحي السكني *</label>
              <input
                type="text"
                placeholder="مثال: حي الغدير، الكرادة، زيونة"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                required
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">اسم الشارع *</label>
                <input
                  type="text"
                  placeholder="مثال: شارع المدارس"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">وصف المنزل/علامة *</label>
                <input
                  type="text"
                  placeholder="مثال: بيت أبو محمد مجاور المسجد"
                  value={houseDescription}
                  onChange={(e) => setHouseDescription(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1 pb-1 pt-2">
              <label className="text-xs font-bold text-slate-300">صورة باب المنزل (اختياري)</label>
              <p className="text-[10px] text-slate-500 pb-1">
                التقط أو أرفق صورة لباب منزلك لتسهيل الوصول إليك وضمان توصيل طلبك بأسرع وقت!
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-slate-300 text-xs 
                  file:mr-3 file:py-2 file:px-4
                  file:rounded-xl file:border-0
                  file:text-xs file:font-bold
                  file:bg-purple-950 file:text-purple-300
                  hover:file:bg-purple-900 transition-colors cursor-pointer bg-slate-950 border border-slate-800 rounded-xl p-1"
              />
              {houseImage && (
                <div className="mt-2 text-[10px] text-emerald-400 font-bold bg-emerald-950/40 inline-flex items-center px-2 py-1 gap-1 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" />
                  تم إرفاق صورة المنزل بنجاح!
                </div>
              )}
            </div>



            {/* Optional Map Location Picker */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>تحديد الموقع التفاعلي على الخريطة</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                  (اختياري)
                </span>
              </div>
              <p className="text-[11px] text-amber-300 font-medium bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30 leading-relaxed">
                💡 <strong>ملاحظة هامّة:</strong> نوصي بتحديد موقعك على الخريطة لتسهيل وصول مندوب التوصيل بسرعة وسهولة وبأقل وقت ممكن.
              </p>
              <MapLocationPicker
                value={mapCoordinates}
                onChange={(coords, hint) => {
                  setMapCoordinates(coords);
                  if (hint && !customerAddress.trim()) {
                    setCustomerAddress(hint);
                  }
                }}
                required={false}
              />
            </div>
          </div>
        </div>

        {/* Order Notes Card */}
        <div className="space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <span>تفاصيل إضافية للطلب</span>
          </h2>

          <div className="space-y-4">
            {/* Substitution Preference Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">في حال عدم توفر أحد المنتجات:</label>
              <div className="flex flex-col gap-2">
                {[
                  'اتصل بي عند عدم توفر منتج',
                  'استبدل بمنتج مشابه',
                  'لا تستبدل'
                ].map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-colors">
                    <input 
                      type="radio" 
                      name="substitutionPreference" 
                      value={option}
                      checked={substitutionPreference === option}
                      onChange={(e) => setSubstitutionPreference(e.target.value)}
                      className="text-purple-500 bg-slate-900 border-slate-700" 
                    />
                    <span className="text-sm text-slate-200">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">ملاحظات والتزامات الطلب (اختياري)</label>
              <textarea
                rows={2}
                placeholder="مثال: يرجى عدم إضافة بصل، أو الاتصال عند الوصول..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-xs focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Cart Summary Card */}
        <div className="space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <span>ملخص السلة</span>
            </h2>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800/40">
              <Store className="w-3.5 h-3.5" />
              <span>{uniqueShops.length > 1 ? `${uniqueShops.length} محلات مجمعة` : uniqueShops[0]?.shopName || 'المتجر'}</span>
            </div>
          </div>

          <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item, index) => (
              <div key={index} className="flex flex-col gap-2 py-3">
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <span className="font-bold text-slate-200 block">{item.product.nameAr}</span>
                    <span className="text-xs text-slate-400">{item.shopName}</span>
                  </div>
                  <span className="font-extrabold text-purple-400 shrink-0">
                    {item.product.price.toLocaleString('en-US')} د.ع
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs mt-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg overflow-hidden shrink-0 h-8">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2.5 h-full text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-slate-100 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2.5 h-full text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="flex items-center justify-center p-1.5 text-red-400/80 hover:text-red-400 hover:bg-red-950/40 rounded-md transition-colors"
                      title="حذف المنتج من السلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-extrabold text-slate-100 bg-slate-800/60 px-2 py-1 rounded">
                    الإجمالي: {(item.product.price * item.quantity).toLocaleString('en-US')} د.ع
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>مجموع المنتجات:</span>
              <span>{totalPrice.toLocaleString('en-US')} د.ع</span>
            </div>
            {uniqueShops.length > 1 ? (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>الأساسي ({baseShop?.shopName || 'متجر البداية'}):</span>
                  </span>
                  <span>{baseDeliveryFee.toLocaleString('en-US')} د.ع</span>
                </div>
                
                {additionalShops.map((shop, i) => (
                  <div key={i} className="flex justify-between items-center text-amber-400 text-xs bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      <span>رسوم إضافية لمتجر ({shop.shopName}):</span>
                    </span>
                    <span className="font-mono font-bold" dir="rtl">
                      250 د.ع
                    </span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-2 text-slate-100">
                  <span className="flex items-center gap-1 font-bold">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>الإجمالي الكلي للتوصيل:</span>
                  </span>
                  <span className="font-extrabold text-emerald-400">
                    {deliveryFee.toLocaleString('en-US')} د.ع
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                  💡 تمت إضافة 250 دينار إلى أجور التوصيل نظراً لطلبك من أكثر من متجر لضمان التغطية العادلة لجهد المندوب الإضافي.
                </p>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>أجرة التوصيل:</span>
                </span>
                <span className="font-bold text-slate-100">
                  {deliveryFee === 0 ? 'مجاني' : `${deliveryFee.toLocaleString('en-US')} د.ع`}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-3 font-extrabold text-lg text-slate-100 border-t border-slate-800">
              <span>المجموع الكلي:</span>
              <span className="text-purple-400">{grandTotal.toLocaleString('en-US')} د.ع</span>
            </div>
          </div>

        </div>

      </form>



    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-xs font-bold">جاري تحميل صفحة الدفع وتجهيز السلة...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
