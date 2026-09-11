'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Store,
  Truck,
  Plus,
  Sparkles,
  Tag,
  Clock,
  UserCheck,
  Loader2,
  Package,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Power,
  Trash2,
  Edit3,
  Edit,
  X,
  RefreshCw,
  AlertTriangle,
  Settings,
  Coins,
  Search,
  Phone,
  Globe,
  Copy,
  Check,
  MessageCircle,
} from 'lucide-react';

interface JoinRequest {
  id: string;
  type: string;
  name: string;
  ownerName?: string | null;
  phone: string;
  shopName?: string | null;
  area: string;
  mapCoordinates?: string | null;
  storeFrontImage?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
}

interface ProfileUpdateRequest {
  id: string;
  entityId: string;
  entityType: string;
  requestedData: string;
  requestedDataParsed: any;
  status: string;
  createdAt: string;
  oldData?: any;
}

interface Product {
  id: string;
  shopId: string;
  nameAr: string;
  category: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  isLiveAvailable?: boolean;
  syncStatus?: string;
}

interface Shop {
  id: string;
  nameAr: string;
  phone?: string | null;
  description?: string | null;
  category: string;
  deliveryFee: number;
  minOrderAmount?: number;
  rating: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured?: boolean;
  products: Product[];
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle?: string | null;
  currentDebt: number;
  maxCreditLimit: number;
  isAvailable: boolean;
  isBlocked?: boolean;
}

interface CustomerOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    nameAr: string;
    price: number;
    imageUrl?: string | null;
  };
}

interface CustomerOrder {
  id: string;
  shopId: string;
  driverId?: string | null;
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  totalPrice: number;
  deliveryFee: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  shop: {
    id: string;
    nameAr: string;
    phone?: string | null;
    imageUrl?: string | null;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  items: CustomerOrderItem[];
}

interface RepaymentRequest {
  id: string;
  driverId: string;
  amount: number;
  receiptImage: string;
  status: string;
  createdAt: string;
  driver: {
    name: string;
    phone: string;
    currentDebt: number;
  };
}

export default function SuperAdminDashboardPage() {
  // =====================================================================
  // 1. ALL HOOKS DECLARED UNCONDITIONALLY AT THE ABSOLUTE TOP LEVEL
  // =====================================================================
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'DIRECTORY' | 'REQUESTS' | 'PROFILE_UPDATES' | 'DRIVERS' | 'SETTINGS' | 'REPAYMENTS'>('ORDERS');
  
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [profileRequests, setProfileRequests] = useState<ProfileUpdateRequest[]>([]);
  const [repayments, setRepayments] = useState<RepaymentRequest[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Admin WhatsApp Settings State
  const [adminWhatsApp, setAdminWhatsApp] = useState<string>('');
  const [editingAdminWhatsApp, setEditingAdminWhatsApp] = useState<string>('');
  const [savingAdminWhatsApp, setSavingAdminWhatsApp] = useState<boolean>(false);

  // Admin Contact Phone Settings State
  const [contactPhone, setContactPhone] = useState<string>('');
  const [editingContactPhone, setEditingContactPhone] = useState<string>('');
  const [savingContactPhone, setSavingContactPhone] = useState<boolean>(false);

  // Admin Support WhatsApp Settings State
  const [supportWhatsApp, setSupportWhatsApp] = useState<string>('');
  const [editingSupportWhatsApp, setEditingSupportWhatsApp] = useState<string>('');
  const [savingSupportWhatsApp, setSavingSupportWhatsApp] = useState<boolean>(false);

  // Official Wallet Settings State
  const [officialWallet, setOfficialWallet] = useState<string>('');
  const [editingOfficialWallet, setEditingOfficialWallet] = useState<string>('');
  const [officialWalletProvider, setOfficialWalletProvider] = useState<string>('زين كاش');
  const [editingOfficialWalletProvider, setEditingOfficialWalletProvider] = useState<string>('');
  const [savingOfficialWallet, setSavingOfficialWallet] = useState<boolean>(false);

  // Network & URL Info State
  const [networkInfo, setNetworkInfo] = useState<{ localhostUrl: string; networkIps: string[] }>({
    localhostUrl: 'http://localhost:3000',
    networkIps: [],
  });
  const [currentOrigin, setCurrentOrigin] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Shop Edit / Create Modal State
  const [shopModalOpen, setShopModalOpen] = useState<boolean>(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [shopNameArInput, setShopNameArInput] = useState<string>('');
  const [shopDescriptionInput, setShopDescriptionInput] = useState<string>('');
  const [shopCategoryInput, setShopCategoryInput] = useState<string>('STANDARD');
  const [shopDeliveryFeeInput, setShopDeliveryFeeInput] = useState<string>('1500');
  const [shopImageUrlInput, setShopImageUrlInput] = useState<string>('');
  const [shopIsFeaturedInput, setShopIsFeaturedInput] = useState<boolean>(true);
  const [savingShop, setSavingShop] = useState<boolean>(false);
  

  // Expanded Shop Inspection Modal & Copy Product State
  const [inspectShop, setInspectShop] = useState<Shop | null>(null);
  const [inspectSearchQuery, setInspectSearchQuery] = useState<string>('');
  const [copyModalProduct, setCopyModalProduct] = useState<Product | null>(null);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [copyingProductId, setCopyingProductId] = useState<string | null>(null);

  // Dazly Mart Product Price Edit State
  const [editingPriceProductId, setEditingPriceProductId] = useState<string | null>(null);
  const [newMartPrice, setNewMartPrice] = useState<string>('');

  // Add Product to Dazly Mart Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [productNameAr, setProductNameAr] = useState<string>('');
  const [productCategory, setProductCategory] = useState<string>('الغذائيات والبقوليات 🌾');
  const [productPrice, setProductPrice] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productImageUrl, setProductImageUrl] = useState<string>('');
  const [savingMartProduct, setSavingMartProduct] = useState<boolean>(false);

  // Driver Financial Controls State
  const [editingCreditLimitDriverId, setEditingCreditLimitDriverId] = useState<string | null>(null);
  const [newCreditLimitInput, setNewCreditLimitInput] = useState<string>('');

  // Single Effect Hook for Mounting & Auto-Polling
  useEffect(() => {
    const adminSession = typeof window !== 'undefined' ? localStorage.getItem('dazly_admin_session') : null;
    if (!adminSession) {
      window.location.href = '/admin';
      return;
    }

    fetchAdminData();
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
    fetch('/api/system/network-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNetworkInfo(data);
        }
      })
      .catch((err) => console.error('Error fetching network info:', err));

    // Real-Time Auto-Polling: Refresh orders every 4 seconds
    const pollInterval = setInterval(() => {
      fetch('/api/admin/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        })
        .catch((err) => console.error('Error polling admin orders:', err));
    }, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  // =====================================================================
  // 2. EVENT HANDLERS & ACTIONS (AFTER HOOKS)
  // =====================================================================
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [reqRes, dirRes, driversRes, settingsRes, walletRes, ordersRes, prRes, repayRes] = await Promise.all([
        fetch('/api/admin/requests'),
        fetch('/api/admin/directory'),
        fetch('/api/admin/drivers'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/settings/wallet'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/profile-requests'),
        fetch('/api/admin/repayment')
      ]);

      const reqData = await reqRes.json();
      const dirData = await dirRes.json();
      const driversData = await driversRes.json();
      const settingsData = await settingsRes.json();
      const walletData = await walletRes.json().catch(() => ({}));
      const ordersData = await ordersRes.json();
      const prData = await prRes.json();
      const repayData = await repayRes.json();

      if (reqData.success) setRequests(reqData.requests);
      if (dirData.success) setShops(dirData.shops);
      if (driversData.success) setDrivers(driversData.drivers);
      if (ordersData.success) setOrders(ordersData.orders);
      if (prData.success) setProfileRequests(prData.requests);
      if (repayData.success) setRepayments(repayData.requests);
      
      if (walletData.success) {
        setOfficialWallet(walletData.walletNumber || '');
        setEditingOfficialWallet(walletData.walletNumber || '');
        setOfficialWalletProvider(walletData.walletProviderName || 'زين كاش');
        setEditingOfficialWalletProvider(walletData.walletProviderName || 'زين كاش');
      }
      if (settingsData.success) {
        if (settingsData.adminWhatsAppNumber !== undefined) {
          setAdminWhatsApp(settingsData.adminWhatsAppNumber);
          setEditingAdminWhatsApp(settingsData.adminWhatsAppNumber);
        }
        if (settingsData.contactPhoneNumber !== undefined) {
          setContactPhone(settingsData.contactPhoneNumber);
          setEditingContactPhone(settingsData.contactPhoneNumber);
        }
        if (settingsData.supportWhatsAppNumber !== undefined) {
          setSupportWhatsApp(settingsData.supportWhatsAppNumber);
          setEditingSupportWhatsApp(settingsData.supportWhatsAppNumber);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWhatsAppSetting = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingAdminWhatsApp(true);
      setStatusMessage('');
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminWhatsAppNumber: editingAdminWhatsApp }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminWhatsApp(data.adminWhatsAppNumber);
        setStatusMessage('✅ تم حفظ رقم واتساب استقبال الطلبات بنجاح');
      } else {
        alert(data.error || 'فشل في تحديث رقم الواتساب');
      }
    } catch (err) {
      console.error('Error saving WhatsApp setting:', err);
    } finally {
      setSavingAdminWhatsApp(false);
    }
  };

  const handleSaveContactPhoneSetting = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingContactPhone(true);
      setStatusMessage('');
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactPhoneNumber: editingContactPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setContactPhone(data.contactPhoneNumber);
        setStatusMessage('✅ تم حفظ رقم هاتف التواصل بنجاح');
      } else {
        alert(data.error || 'فشل في تحديث رقم الهاتف');
      }
    } catch (err) {
      console.error('Error saving phone setting:', err);
    } finally {
      setSavingContactPhone(false);
    }
  };

  const handleSaveSupportWhatsAppSetting = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingSupportWhatsApp(true);
      setStatusMessage('');
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportWhatsAppNumber: editingSupportWhatsApp }),
      });
      const data = await res.json();
      if (data.success) {
        setSupportWhatsApp(data.supportWhatsAppNumber);
        setStatusMessage('✅ تم حفظ رقم واتساب الدعم الفني بنجاح');
      } else {
        alert(data.error || 'فشل في تحديث رقم الواتساب');
      }
    } catch (err) {
      console.error('Error saving support whatsapp setting:', err);
    } finally {
      setSavingSupportWhatsApp(false);
    }
  };

  const handleSaveOfficialWalletSetting = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingOfficialWallet(true);
      setStatusMessage('');
      const res = await fetch('/api/admin/settings/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletNumber: editingOfficialWallet, 
          walletProviderName: editingOfficialWalletProvider 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOfficialWallet(editingOfficialWallet);
        setOfficialWalletProvider(editingOfficialWalletProvider);
        setStatusMessage('✅ تم حفظ معلومات المحفظة الرسمية بنجاح');
      } else {
        alert(data.error || 'فشل في تحديث رقم المحفظة');
      }
    } catch (err) {
      console.error('Error saving official wallet setting:', err);
    } finally {
      setSavingOfficialWallet(false);
    }
  };

  const handleRepaymentAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setActionLoading(id);
      const res = await fetch('/api/admin/repayment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAdminData();
      } else {
        alert(data.error || 'فشل في اتخاذ الإجراء');
      }
    } catch (err) {
      console.error('Error handling repayment action:', err);
    } finally {
      setActionLoading(null);
    }
  };




  const handleUpdateOrderStatus = async (orderId: string, status: string, driverId?: string) => {
    try {
      setActionLoading(orderId);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, driverId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: status || o.status,
                  driverId: driverId !== undefined ? (driverId || null) : o.driverId,
                }
              : o
          )
        );
        fetchAdminData();
      } else {
        alert(data.error || 'فشل في تحديث حالة الطلب');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendOrderToStore = (ord: CustomerOrder) => {
    let targetPhone = ord.shop?.phone || '';
    if (!targetPhone.trim()) {
      const input = prompt(
        `يرجى كتابة رقم هاتف صاحب متجر (${ord.shop?.nameAr || 'المتجر'}) لإرسال رسالة التجهيز:`,
        '07700000000'
      );
      if (!input || !input.trim()) return;
      targetPhone = input.trim();
    }

    let cleanPhone = targetPhone.replace(/[^\d]/g, '');
    if (cleanPhone.startsWith('07') && cleanPhone.length === 11) {
      cleanPhone = '964' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '20' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = '964' + cleanPhone.slice(1);
    }

    const itemsFormatted = ord.items
      .map((i) => `• ${i.product?.nameAr || 'منتج'} x${i.quantity}`)
      .join('\n');

    const prepLink = `${currentOrigin || 'http://localhost:3000'}/shop/dashboard`;

    const messageText = `🏪 *هناك طلب جديد لك في موقع DIZLY، يرجى التجهيز. تفاصيل الطلب (#${ord.id.slice(-6)}):*
🏪 *المتجر:* ${ord.shop?.nameAr || 'المتجر'}
---
📦 *تفاصيل وعناصر الطلب للتجهيز:*
${itemsFormatted}
---
👤 *الزبون:* ${ord.customerName}
📞 *الهاتف:* ${ord.customerPhone}
📍 *العنوان:* ${ord.deliveryArea}
💵 *المبلغ الكلي:* ${ord.grandTotal.toLocaleString('en-US')} د.ع
---
🔗 *رابط دخول المتجر لتسجيل الاستجابة:*
${prepLink}`;

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleResetDriverDebt = async (driver: Driver) => {
    if (!confirm(`هل أنت تأكد من تصفية ديون السائق (${driver.name}) وتعديل ذمته المالية إلى 0 د.ع؟`)) return;

    try {
      setActionLoading(driver.id);
      const res = await fetch('/api/admin/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver.id,
          action: 'RESET_DEBT',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAdminData();
      } else {
        alert(data.error || 'فشل في تصفية الديون');
      }
    } catch (err) {
      console.error('Error resetting driver debt:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveDriverCreditLimit = async (driverId: string) => {
    if (!newCreditLimitInput || Number(newCreditLimitInput) < 0) return;

    try {
      setActionLoading(driverId);
      const res = await fetch('/api/admin/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          action: 'SET_CREDIT_LIMIT',
          maxCreditLimit: Number(newCreditLimitInput),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingCreditLimitDriverId(null);
        fetchAdminData();
      } else {
        alert(data.error || 'فشل في تغيير رنج الدين');
      }
    } catch (err) {
      console.error('Error saving driver credit limit:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenAddShopModal = () => {
    setEditingShop(null);
    setShopNameArInput('');
    setShopDescriptionInput('');
    setShopCategoryInput('STANDARD');
    setShopDeliveryFeeInput('1500');
    setShopImageUrlInput('');
    setShopIsFeaturedInput(true);
    setShopModalOpen(true);
  };

  const handleOpenEditShopModal = (s: Shop) => {
    setEditingShop(s);
    setShopNameArInput(s.nameAr);
    setShopDescriptionInput(s.description || '');
    setShopCategoryInput(s.category || 'STANDARD');
    setShopDeliveryFeeInput(s.deliveryFee.toString());
    setShopImageUrlInput(s.imageUrl || '');
    setShopIsFeaturedInput(s.isFeatured ?? true);
    setShopModalOpen(true);
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopNameArInput.trim()) return;

    try {
      setSavingShop(true);
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingShop ? editingShop.id : undefined,
          nameAr: shopNameArInput,
          description: shopDescriptionInput,
          category: shopCategoryInput,
          deliveryFee: Number(shopDeliveryFeeInput),
          imageUrl: shopImageUrlInput,
          isFeatured: shopIsFeaturedInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShopModalOpen(false);
        fetchAdminData();
      } else {
        alert(data.error || 'فشل في حفظ بيانات الشعار والمتجر');
      }
    } catch (err) {
      console.error('Error saving shop:', err);
    } finally {
      setSavingShop(false);
    }
  };

  const handleRequestAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setActionLoading(id);
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        
        if (action === 'APPROVE' && data.request && data.request.phone) {
          let targetPhone = data.request.phone.replace(/[^\d]/g, '');
          if (targetPhone.startsWith('07') && targetPhone.length === 11) {
            targetPhone = '964' + targetPhone.slice(1);
          } else if (targetPhone.startsWith('0')) {
            targetPhone = '964' + targetPhone.slice(1);
          }
          
          let messageText = '';
          const entityType = data.entityType || data.request.type;
          const entityPassword = data.entityPassword || '';
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
          
          if (entityType === 'SHOP') {
            messageText = `🎉 مرحباً بك في عائلة DIZLY!\n\nيسعدنا إخبارك بأنه تمت الموافقة على متجرك بنجاح.\n\n📱 *رقم الدخول:* ${data.request.phone}\n🔑 *الرمز السري:* ${entityPassword}\n\n🔗 *رابط دخول المتجر:* ${baseUrl}/login/shop\n\n🤖 *لربط الإشعارات واستقبال الطلبات عبر تيليجرام يرجى بدء المحادثة مع البوت التالي:*\nhttps://t.me/Dezli_Order_bot\n\nنتمنى لك كل التوفيق والنجاح! 🚀`;
          } else if (entityType === 'DRIVER') {
            messageText = `🎉 مرحباً بك في فريق كباتن DIZLY!\n\nيسعدنا إخبارك بأنه تمت الموافقة على انضمامك بنجاح للعمل معنا.\n\n📱 *رقم الدخول:* ${data.request.phone}\n🔑 *رمز الدخول:* ${entityPassword}\n\n🔗 *رابط دخول لوحة الكابتن:* ${baseUrl}/login/driver\n\n💬 *يرجى الانضمام فوراً لقناة الكباتن الرسمية لمتابعة التعليمات والطلبات:*\nhttps://t.me/dizly7\n\nبالتوفيق في رحلاتك القادمة معنا! 🚀`;
          }
          
          if (messageText) {
            const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;
            window.open(whatsappUrl, '_blank');
          }
        }
        
        fetchAdminData();
      } else {
        alert(data.error || 'فشل في اتخاذ الإجراء');
      }
    } catch (err) {
      console.error('Error handling request action:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProfileRequestAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setActionLoading(id);
      const res = await fetch('/api/admin/profile-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchAdminData();
      } else {
        alert(data.error || 'فشل في اتخاذ الإجراء');
      }
    } catch (err) {
      console.error('Error handling profile request action:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleShopStatus = async (s: Shop) => {
    try {
      setActionLoading(s.id);
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, nameAr: s.nameAr, isAvailable: !s.isAvailable }),
      });
      const data = await res.json();
      if (data.success) fetchAdminData();
      else alert(data.error);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleShopFeatured = async (s: Shop) => {
    try {
      setActionLoading(s.id);
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, nameAr: s.nameAr, isFeatured: !s.isFeatured }),
      });
      const data = await res.json();
      if (data.success) fetchAdminData();
      else alert(data.error);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteShop = async (id: string, force: boolean = false) => {
    if (!force) {
      if(!confirm("هل أنت متأكد من حذف المتجر؟ (سيتم حذف كل متعلقاته)")) return;
    }
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/shops?id=${id}${force ? '&force=true' : ''}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message || 'تم الحذف بنجاح');
        fetchAdminData();
      } else {
        if (data.requiresForce) {
          const forceConfirm = confirm(`${data.error}\n\nتحذير خطير: هل أنت متأكد تماماً من رغبتك في (الحذف الإجباري)؟ هذا سيؤدي إلى مسح مئات أو آلاف الطلبات السابقة المرتبطة بهذا المتجر ولن يمكن التراجع أبداً!`);
          if (forceConfirm) {
            handleDeleteShop(id, true);
          }
        } else {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!force) setActionLoading(null);
    }
  };

  const handleToggleDriverStatus = async (d: Driver) => {
    try {
      setActionLoading(d.id);
      const res = await fetch('/api/admin/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: d.id, action: 'TOGGLE_STATUS', isAvailable: !d.isAvailable }),
      });
      const data = await res.json();
      if (data.success) fetchAdminData();
      else alert(data.error);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if(!confirm("هل أنت متأكد من حذف الكابتن نهائياً؟")) return;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/drivers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchAdminData();
      else alert(data.error);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================================
  // 3. RENDER LAYOUT
  // =====================================================================
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 text-right">
      
      {/* Admin Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-purple-500/30">
            د
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span>لوحة التحكم وإدارة النظام المتكاملة</span>
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </h1>
            <p className="text-xs text-slate-400">تحكم كامل بالطلبات الحية، رقم الواتساب المعتمد، المتاجر، والمناديب</p>
          </div>
        </div>

        <button
          onClick={() => fetchAdminData()}
          disabled={loading}
          className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          <span>تحديث البيانات الحية</span>
        </button>
      </div>

      {/* PROMINENT ADMIN WHATSAPP NUMBER INPUT CARD AT TOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Orders WhatsApp Card */}
        <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 text-right space-y-3 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <MessageCircle className="w-6 h-6 fill-emerald-500/20" />
              <div>
                <h3 className="font-black text-slate-100 text-sm">واتساب للطلبات</h3>
                <p className="text-[10px] text-slate-400 font-medium">سيتم تحويل طلبات الزبائن إلى هذا الرقم</p>
              </div>
            </div>
            {adminWhatsApp && (
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700/50 dir-ltr">
                {adminWhatsApp}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveWhatsAppSetting} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="07701234567"
              value={editingAdminWhatsApp}
              onChange={(e) => setEditingAdminWhatsApp(e.target.value)}
              className="flex-1 py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono w-full min-w-0"
            />
            <button
              type="submit"
              disabled={savingAdminWhatsApp}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center shrink-0 active:scale-95"
            >
              {savingAdminWhatsApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        {/* Support WhatsApp Card */}
        <div className="bg-gradient-to-r from-teal-950/80 to-slate-900 border-2 border-teal-500/60 rounded-3xl p-5 text-right space-y-3 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-teal-400">
              <MessageCircle className="w-6 h-6 fill-teal-500/20" />
              <div>
                <h3 className="font-black text-slate-100 text-sm">واتساب للدعم الفني</h3>
                <p className="text-[10px] text-slate-400 font-medium">رقم التواصل للإجابة عن الشكاوى والاستفسارات</p>
              </div>
            </div>
            {supportWhatsApp && (
              <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-900/60 px-2 py-0.5 rounded-full border border-teal-700/50 dir-ltr">
                {supportWhatsApp}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSupportWhatsAppSetting} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="07701234567"
              value={editingSupportWhatsApp}
              onChange={(e) => setEditingSupportWhatsApp(e.target.value)}
              className="flex-1 py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-xs focus:outline-none focus:border-teal-500 font-mono w-full min-w-0"
            />
            <button
              type="submit"
              disabled={savingSupportWhatsApp}
              className="py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-teal-950/40 flex items-center justify-center shrink-0 active:scale-95"
            >
              {savingSupportWhatsApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        {/* Contact Phone Card */}
        <div className="bg-gradient-to-r from-blue-950/80 to-slate-900 border-2 border-blue-500/60 rounded-3xl p-5 text-right space-y-3 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Phone className="w-6 h-6 fill-blue-500/20" />
              <div>
                <h3 className="font-black text-slate-100 text-sm">رقم الاتصال المباشر</h3>
                <p className="text-[10px] text-slate-400 font-medium">رقم للاتصال العادي يظهر للزبائن في قائمة تواصل معنا</p>
              </div>
            </div>
            {contactPhone && (
              <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-700/50 dir-ltr">
                {contactPhone}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveContactPhoneSetting} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="07701234567"
              value={editingContactPhone}
              onChange={(e) => setEditingContactPhone(e.target.value)}
              className="flex-1 py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono w-full min-w-0"
            />
            <button
              type="submit"
              disabled={savingContactPhone}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-blue-950/40 flex items-center justify-center shrink-0 active:scale-95"
            >
              {savingContactPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        {/* Official Wallet Settings Card */}
        <div className="bg-gradient-to-r from-purple-950/80 to-slate-900 border-2 border-purple-500/60 rounded-3xl p-5 text-right space-y-3 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-purple-400">
              <Coins className="w-6 h-6 fill-purple-500/20" />
              <div>
                <h3 className="font-black text-slate-100 text-sm">محفظة أو بنك التسديد</h3>
                <p className="text-[10px] text-slate-400 font-medium">اسم ورقم وسيلة الدفع المعروضة للمناديب</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveOfficialWalletSetting} className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium pl-2">اسم المحفظة / الجهة:</span>
              {officialWalletProvider && (
                 <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-700/50">
                   {officialWalletProvider}
                 </span>
              )}
            </div>
            <input
              type="text"
              placeholder="مثال: زين كاش، آسيا حوالة.."
              value={editingOfficialWalletProvider}
              onChange={(e) => setEditingOfficialWalletProvider(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-purple-500"
            />
            
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 font-medium pl-2">رقم الحساب / المحفظة:</span>
              {officialWallet && (
                 <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-700/50 dir-ltr">
                   {officialWallet}
                 </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="07701234567"
                value={editingOfficialWallet}
                onChange={(e) => setEditingOfficialWallet(e.target.value)}
                className="flex-1 py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono w-full min-w-0 dir-ltr text-right"
              />
              <button
                type="submit"
                disabled={savingOfficialWallet}
                className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-purple-950/40 flex items-center justify-center shrink-0 active:scale-95"
              >
                {savingOfficialWallet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {statusMessage && (
        <div className="p-2.5 bg-slate-800 border border-slate-700/80 rounded-xl text-slate-200 text-xs font-bold text-center animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* FULL FEATURE TAB NAVIGATION CONTROLS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 border-b border-slate-800 pb-6 mb-4">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`relative p-4 rounded-3xl font-black text-xs transition-all flex flex-col items-center justify-center gap-3 text-center border shadow-lg ${
            activeTab === 'ORDERS'
              ? 'bg-purple-600 text-white border-purple-500/50 shadow-purple-900/30 ring-2 ring-purple-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
          }`}
        >
          <div className={`p-2.5 rounded-2xl ${activeTab === 'ORDERS' ? 'bg-white/20' : 'bg-slate-800/80'}`}>
            <Package className={`w-5 h-5 ${activeTab === 'ORDERS' ? 'text-white' : 'text-purple-400'}`} />
          </div>
          <div className="space-y-1">
            <span className="block">إدارة الطلبات الحية</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'ORDERS' ? 'bg-black/20' : 'bg-slate-800 text-slate-300'}`}>
              {orders.length}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`relative p-4 rounded-3xl font-black text-xs transition-all flex flex-col items-center justify-center gap-3 text-center border shadow-lg ${
            activeTab === 'DIRECTORY'
              ? 'bg-purple-600 text-white border-purple-500/50 shadow-purple-900/30 ring-2 ring-purple-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
          }`}
        >
          <div className={`p-2.5 rounded-2xl ${activeTab === 'DIRECTORY' ? 'bg-white/20' : 'bg-slate-800/80'}`}>
            <Store className={`w-5 h-5 ${activeTab === 'DIRECTORY' ? 'text-white' : 'text-purple-400'}`} />
          </div>
          <div className="space-y-1">
            <span className="block">المتاجر والشعار</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'DIRECTORY' ? 'bg-black/20' : 'bg-slate-800 text-slate-300'}`}>
              {shops.length}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('DRIVERS')}
          className={`relative p-4 rounded-3xl font-black text-xs transition-all flex flex-col items-center justify-center gap-3 text-center border shadow-lg ${
            activeTab === 'DRIVERS'
              ? 'bg-purple-600 text-white border-purple-500/50 shadow-purple-900/30 ring-2 ring-purple-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
          }`}
        >
          <div className={`p-2.5 rounded-2xl ${activeTab === 'DRIVERS' ? 'bg-white/20' : 'bg-slate-800/80'}`}>
            <Truck className={`w-5 h-5 ${activeTab === 'DRIVERS' ? 'text-white' : 'text-purple-400'}`} />
          </div>
          <div className="space-y-1">
            <span className="block">معلومات المناديب</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'DRIVERS' ? 'bg-black/20' : 'bg-slate-800 text-slate-300'}`}>
              {drivers.length}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`relative p-4 rounded-3xl font-black text-xs transition-all flex flex-col items-center justify-center gap-3 text-center border shadow-lg ${
            activeTab === 'REQUESTS'
              ? 'bg-purple-600 text-white border-purple-500/50 shadow-purple-900/30 ring-2 ring-purple-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
          }`}
        >
          {requests.length > 0 && (
            <span className="absolute top-2 right-2 flex w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
          <div className={`p-2.5 rounded-2xl ${activeTab === 'REQUESTS' ? 'bg-white/20' : 'bg-slate-800/80'}`}>
            <UserCheck className={`w-5 h-5 ${activeTab === 'REQUESTS' ? 'text-white' : 'text-purple-400'}`} />
          </div>
          <div className="space-y-1">
            <span className="block">طلبات الانضمام</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'REQUESTS' ? 'bg-black/20' : 'bg-slate-800 text-slate-300'}`}>
              {requests.length}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE_UPDATES')}
          className={`relative p-4 rounded-3xl font-black text-xs transition-all flex flex-col items-center justify-center gap-3 text-center border shadow-lg ${
            activeTab === 'PROFILE_UPDATES'
              ? 'bg-purple-600 text-white border-purple-500/50 shadow-purple-900/30 ring-2 ring-purple-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
          }`}
        >
          {profileRequests.length > 0 && (
            <span className="absolute top-2 right-2 flex w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
          <div className={`p-2.5 rounded-2xl ${activeTab === 'PROFILE_UPDATES' ? 'bg-white/20' : 'bg-slate-800/80'}`}>
            <Settings className={`w-5 h-5 ${activeTab === 'PROFILE_UPDATES' ? 'text-white' : 'text-purple-400'}`} />
          </div>
          <div className="space-y-1">
            <span className="block">تحديثات الملف</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono ${activeTab === 'PROFILE_UPDATES' ? 'bg-black/20' : 'bg-amber-600 text-amber-50'}`}>
              {profileRequests.length}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('REPAYMENTS')}
          className={`relative p-4 rounded-3xl font-black text-xs transition-all flex flex-col items-center justify-center gap-3 text-center border shadow-lg ${
            activeTab === 'REPAYMENTS'
              ? 'bg-purple-600 text-white border-purple-500/50 shadow-purple-900/30 ring-2 ring-purple-500/20 scale-[1.02]'
              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
          }`}
        >
          {repayments.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="absolute top-2 right-2 flex w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
          <div className={`p-2.5 rounded-2xl ${activeTab === 'REPAYMENTS' ? 'bg-white/20' : 'bg-slate-800/80'}`}>
            <Coins className={`w-5 h-5 ${activeTab === 'REPAYMENTS' ? 'text-white' : 'text-purple-400'}`} />
          </div>
          <div className="space-y-1">
            <span className="block">طلبات المحاسبة</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono border border-transparent ${activeTab === 'REPAYMENTS' ? 'bg-black/20 text-emerald-300' : 'bg-emerald-950/50 border-emerald-800 text-emerald-400'}`}>
              {repayments.filter(r => r.status === 'PENDING').length}
            </span>
          </div>
        </button>
      </div>

      {/* TAB 1: LIVE ORDERS MANAGEMENT */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-6">
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                <span>جميع الطلبات النشطة والسابقة ({orders.length})</span>
              </h3>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-400 text-xs">
                لا توجد طلبات جارية حالياً
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg text-right">
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-purple-400">#{ord.id.slice(-6)}</span>
                      <h3 className="font-extrabold text-slate-100 text-sm inline-block mr-2">{ord.shop?.nameAr || 'متجر DIZLY'}</h3>
                    </div>

                    <span className={`py-1 px-3 rounded-full font-bold text-xs ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                        : ord.status === 'ON_THE_WAY'
                        ? 'bg-blue-950 text-blue-300 border border-blue-700/50'
                        : ord.status === 'CANCELLED'
                        ? 'bg-red-950 text-red-300 border border-red-700/50'
                        : ord.status === 'pending_whatsapp' || ord.status === 'PENDING_WHATSAPP_SENT' || ord.status === 'pending'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                        : 'bg-purple-950 text-purple-300 border border-purple-700/50'
                    }`}>
                      {ord.status === 'confirmed'
                        ? 'Preparing / جاري التجهيز'
                        : ord.status === 'ON_THE_WAY'
                        ? 'On the Way / في الطريق'
                        : ord.status === 'DELIVERED'
                        ? 'Delivered / تم التسليم ✅'
                        : ord.status === 'CANCELLED'
                        ? 'Cancelled / ملغي ❌'
                        : ord.status === 'pending_whatsapp' || ord.status === 'PENDING_WHATSAPP_SENT' || ord.status === 'pending'
                        ? 'Pending / بانتظار التأكيد'
                        : ord.status}
                    </span>
                  </div>

                        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs text-slate-300">
                          <div className="flex items-center justify-between">
                            <span>👤 <strong>الزبون:</strong> {ord.customerName}</span>
                            <span className="font-mono font-bold text-purple-300">{ord.customerPhone}</span>
                          </div>
                          <p>📍 <strong>العنوان:</strong> {ord.deliveryArea}</p>
                        </div>

                        <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800 pt-2">
                          <p className="font-bold text-slate-400">عناصر الطلب:</p>
                          {ord.items.map((i) => (
                            <div key={i.id} className="flex justify-between py-0.5">
                              <span>• {i.product?.nameAr || 'منتج'} x{i.quantity}</span>
                              <span className="font-mono text-slate-400">{(i.unitPrice * i.quantity).toLocaleString('en-US')} د.ع</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                          <div className="font-extrabold text-sm text-slate-100">
                            الإجمالي الكلي: <span className="text-purple-400 font-mono text-base">{ord.grandTotal.toLocaleString('en-US')} د.ع</span>
                          </div>
                          
                          <span className="text-[10px] text-slate-500 font-bold">للمراقبة فقط (تدار من المتجر السائق)</span>
                        </div>

                      </div>
                    ))
                  )}
                </div>

        </div>
      )}

      {/* TAB 2: STORES & DIRECTORY MANAGEMENT */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-400" />
                <span>إدارة المتاجر والشعار المسجلة ({shops.length})</span>
              </h2>
              <button
                onClick={handleOpenAddShopModal}
                className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة متجر جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shops.map((s) => (
                <div key={s.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-sm">{s.nameAr}</h4>
                      <p className="text-slate-400">{s.category} • أجرة التوصيل: {s.deliveryFee.toLocaleString('en-US')} د.ع</p>
                    </div>
                    <span className={`py-1 px-2.5 font-bold rounded-lg border flex items-center gap-1 text-[10px] ${
                      s.isAvailable 
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40' 
                        : 'bg-red-950 text-red-400 border-red-800/40'
                    }`}>
                      {s.isAvailable ? 'نشط' : 'موقوف'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleDeleteShop(s.id)}
                      disabled={actionLoading === s.id}
                      className="py-1.5 px-3 bg-red-950 hover:bg-red-900/60 text-red-400 font-bold rounded-lg flex items-center gap-1 border border-red-800/40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleShopStatus(s)}
                        disabled={actionLoading === s.id}
                        className={`py-1.5 px-3 font-bold rounded-lg flex items-center gap-1 transition-colors ${
                          s.isAvailable 
                            ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-400 border border-amber-800/30'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/30'
                        }`}
                      >
                        {actionLoading === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                        <span>{s.isAvailable ? 'إيقاف المتجر' : 'تفعيل المتجر'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleShopFeatured(s)}
                        disabled={actionLoading === s.id}
                        className={`py-1.5 px-3 font-bold rounded-lg flex items-center gap-1 transition-colors ${
                          s.isFeatured 
                            ? 'bg-purple-950/60 hover:bg-purple-900 text-purple-400 border border-purple-800/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{s.isFeatured ? 'إلغاء التمييز' : 'تمييز المتجر'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditShopModal(s)}
                        disabled={actionLoading === s.id}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>تعديل</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DRIVERS & CREDIT DEBT MANAGEMENT */}
      {activeTab === 'DRIVERS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h2 className="font-extrabold text-slate-100 text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-5 h-5 text-purple-400" />
              <span>إدارة المناديب ورنج الذمة المالية والديون ({drivers.length})</span>
            </h2>

            <div className="space-y-3">
              {drivers.map((d) => (
                <div key={d.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-100 text-sm">{d.name} ({d.phone})</h4>
                      <p className="text-slate-400">المركبة: {d.vehicle || 'دراجة نارية'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right border-l border-slate-700 pl-3">
                        <span className="text-slate-400 text-[10px] block">رينج الدين الأقصى:</span>
                        {editingCreditLimitDriverId === d.id ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              value={newCreditLimitInput}
                              onChange={(e) => setNewCreditLimitInput(e.target.value)}
                              className="w-20 bg-slate-900 border border-purple-500 rounded px-1.5 py-0.5 text-xs text-purple-300 outline-none"
                            />
                            <button onClick={() => handleSaveDriverCreditLimit(d.id)} className="bg-purple-600 hover:bg-purple-500 text-white rounded p-1">
                              <Check className="w-3 h-3" />
                            </button>
                            <button onClick={() => setEditingCreditLimitDriverId(null)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 rounded p-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-black text-purple-400 text-sm">
                              {d.maxCreditLimit.toLocaleString('en-US')}
                            </span>
                            <button onClick={() => { setEditingCreditLimitDriverId(d.id); setNewCreditLimitInput(String(d.maxCreditLimit)); }} className="text-slate-500 hover:text-purple-400" title="تعديل الرينج">
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">الذمة المالية الحالية:</span>
                        <span className="font-mono font-black text-amber-400 text-sm">
                          {d.currentDebt.toLocaleString('en-US')} د.ع
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 mt-2">
                    <button
                      onClick={() => handleDeleteDriver(d.id)}
                      disabled={actionLoading === d.id}
                      className="py-1.5 px-3 bg-red-950 hover:bg-red-900/60 text-red-400 font-bold rounded-lg text-xs flex items-center gap-1 border border-red-800/40 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف الكابتن</span>
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleDriverStatus(d)}
                        disabled={actionLoading === d.id}
                        className={`py-1.5 px-3 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors ${
                          d.isAvailable 
                            ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-400 border border-amber-800/30'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/30'
                        }`}
                      >
                        {actionLoading === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
                        <span>{d.isAvailable ? 'إيقاف مؤقت' : 'تفعيل'}</span>
                      </button>

                      <button
                        onClick={() => handleResetDriverDebt(d)}
                        disabled={actionLoading === d.id}
                        className="py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs rounded-lg transition-all border border-emerald-600/30 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>تصفية الديون (0 د.ع)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JOIN REQUESTS */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h2 className="font-extrabold text-slate-100 text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserCheck className="w-5 h-5 text-purple-400" />
              <span>طلبات انضمام المتاجر والمناديب الجدد ({requests.length})</span>
            </h2>
            {requests.length === 0 ? (
              <p className="text-xs text-slate-400">لا توجد طلبات انضمام معلقة حالياً</p>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2 shadow-sm">
                    <p className="font-extrabold text-slate-100 text-sm">{r.shopName || r.name} ({r.phone})</p>
                    <p className="text-slate-400">
                      النوع: {r.type === 'SHOP' ? 'متجر' : 'مندوب'} 
                      {r.type === 'SHOP' && r.area ? ` • المنطقة: ${r.area}` : ''}
                      {r.type === 'DRIVER' && (r as any).vehicle ? ` • المركبة: ${(r as any).vehicle}` : ''}
                    </p>
                    {r.type === 'DRIVER' && ((r as any).vehicleImage || (r as any).vehiclePlateImage) && (
                      <div className="flex gap-4 mt-2">
                        {(r as any).vehicleImage && <div className="w-24 h-24 rounded border border-slate-700 bg-slate-900 object-cover overflow-hidden"><img src={(r as any).vehicleImage} className="w-full h-full object-cover"/></div>}
                        {(r as any).vehiclePlateImage && <div className="w-24 h-24 rounded border border-slate-700 bg-slate-900 object-cover overflow-hidden"><img src={(r as any).vehiclePlateImage} className="w-full h-full object-cover"/></div>}
                      </div>
                    )}
                    <p className={`font-bold inline-block px-2.5 py-1 rounded-full border ${r.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : r.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>الحالة: {r.status}</p>
                    
                    {r.status === 'PENDING' && (
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => handleRequestAction(r.id, 'APPROVE')}
                          disabled={actionLoading === r.id}
                          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          {actionLoading === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          قبول وإنشاء החساب ✅
                        </button>
                        <button
                          onClick={() => handleRequestAction(r.id, 'REJECT')}
                          disabled={actionLoading === r.id}
                          className="py-2.5 px-4 bg-red-950 hover:bg-red-900 border border-red-900 text-red-300 font-bold rounded-xl flex items-center gap-1 transition-all"
                        >
                          {actionLoading === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          رفض ❌
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PROFILE UPDATE REQUESTS */}
      {activeTab === 'PROFILE_UPDATES' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h2 className="font-extrabold text-slate-100 text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Settings className="w-5 h-5 text-purple-400" />
              <span>طلبات تحديث الملفات الشخصية ({profileRequests.length})</span>
            </h2>
            {profileRequests.length === 0 ? (
              <p className="text-xs text-slate-400">لا توجد طلبات تحديث معلقة حالياً</p>
            ) : (
              <div className="space-y-4">
                {profileRequests.map((r) => (
                  <div key={r.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-full w-1 bg-amber-500"></div>
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-slate-100 text-sm">
                        تحديث من {r.entityType === 'SHOP' ? 'متجر' : 'كابتن'} {r.oldData?.nameAr || r.oldData?.name || ''}
                      </p>
                      <p className={`font-bold inline-block px-2.5 py-1 rounded-full border ${r.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : r.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>الحالة: {r.status}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Old Data */}
                      <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl space-y-2">
                        <p className="font-bold text-red-400 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> البيانات الحالية (متأثرة)</p>
                        {Object.keys(r.requestedDataParsed).map(key => (
                          <div key={key} className="flex flex-col gap-1 border-b border-red-900/20 pb-1 last:border-0 text-slate-300">
                             <strong className="text-[10px] text-slate-500 uppercase">{key}</strong>
                             <span className="break-all">{key === 'password' ? '********' : r.oldData?.[key]?.toString() || 'غير محدد'}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* New Data */}
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2">
                        <p className="font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> البيانات المطلوبة (الجديدة)</p>
                        {Object.entries(r.requestedDataParsed).map(([key, value]) => (
                          <div key={key} className="flex flex-col gap-1 border-b border-emerald-900/20 pb-1 last:border-0 text-slate-300">
                             <strong className="text-[10px] text-slate-500 uppercase">{key}</strong>
                             {typeof value === 'string' && value.startsWith('data:image/') ? (
                               <div className="w-24 h-24 rounded border border-emerald-700/50 overflow-hidden mt-1">
                                 <img src={value} className="w-full h-full object-cover" />
                               </div>
                             ) : (
                               <span className="font-bold break-all text-emerald-300">{value as any}</span>
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {r.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => handleProfileRequestAction(r.id, 'REJECT')}
                          disabled={actionLoading === r.id}
                          className="py-2.5 px-6 bg-red-950 hover:bg-red-900 border border-red-900 text-red-300 font-bold rounded-xl flex items-center gap-1 transition-all"
                        >
                          {actionLoading === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          رفض التغييرات ❌
                        </button>
                        <button
                          onClick={() => handleProfileRequestAction(r.id, 'APPROVE')}
                          disabled={actionLoading === r.id}
                          className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          {actionLoading === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          اعتماد التغييرات ✅
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: REPAYMENTS */}
      {activeTab === 'REPAYMENTS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h2 className="font-extrabold text-slate-100 text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Coins className="w-5 h-5 text-purple-400" />
              <span>طلبات التسديد من المناديب ({repayments.length})</span>
            </h2>
            {repayments.length === 0 ? (
              <p className="text-xs text-slate-400">لا توجد طلبات تسديد حالياً</p>
            ) : (
              <div className="space-y-4">
                {repayments.map((r) => (
                  <div key={r.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-4 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 right-0 h-full w-1 ${r.status === 'PENDING' ? 'bg-amber-500' : r.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-slate-100 text-sm flex items-center gap-2">
                          <span>تسديد من الكابتن: {r.driver.name}</span>
                        </p>
                        <p className="text-slate-400 font-mono mt-1 text-[10px]">{r.driver.phone}</p>
                      </div>
                      <p className={`font-bold inline-block px-2.5 py-1 rounded-full border ${r.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : r.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                        {r.status === 'PENDING' ? 'قيد المراجعة' : r.status === 'APPROVED' ? 'مقبول وتم الخصم' : 'مرفوض'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Repayment Details */}
                      <div className="p-3 bg-slate-900 border border-slate-700/50 rounded-xl space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-400">المبلغ المسدد:</span>
                          <span className="font-mono text-base font-bold text-emerald-400">{r.amount.toLocaleString('en-US')} د.ع</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-400">الذمة الحالية للكابتن:</span>
                          <span className="font-mono text-sm font-bold text-red-400">{r.driver.currentDebt.toLocaleString('en-US')} د.ع</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">تاريخ الطلب:</span>
                          <span className="font-mono text-[10px] text-slate-300">{new Date(r.createdAt).toLocaleString('en-US')}</span>
                        </div>
                      </div>

                      {/* Receipt Image */}
                      <div className="p-3 bg-slate-900 border border-slate-700/50 rounded-xl space-y-2">
                        <span className="text-slate-400 block pb-1">صورة وصل التحويل (زين كاش):</span>
                        {r.receiptImage ? (
                          <a href={r.receiptImage} target="_blank" rel="noopener noreferrer" className="block relative w-full h-32 rounded-lg overflow-hidden border border-slate-700 group">
                            <img src={r.receiptImage} alt="وصل التسديد" className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white font-bold bg-slate-900/80 px-3 py-1 rounded-full text-[10px]">عرض الصورة مكبرة</span>
                            </div>
                          </a>
                        ) : (
                          <div className="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border border-dashed border-slate-700">
                            لا توجد صورة
                          </div>
                        )}
                      </div>
                    </div>

                    {r.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                          onClick={() => handleRepaymentAction(r.id, 'REJECT')}
                          disabled={actionLoading === r.id}
                          className="py-2.5 px-6 bg-red-950 hover:bg-red-900 border border-red-900 text-red-300 font-bold rounded-xl flex items-center gap-1 transition-all"
                        >
                          {actionLoading === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          رفض التحويل ❌
                        </button>
                        <button
                          onClick={() => handleRepaymentAction(r.id, 'APPROVE')}
                          disabled={actionLoading === r.id}
                          className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          {actionLoading === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          معاينة وتأكيد التسديد ✅
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* SHOP ADD / EDIT MODAL */}
      {shopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-right space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-slate-100 text-base border-b border-slate-800 pb-3">
              {editingShop ? 'تعديل بيانات المتجر' : 'إضافة متجر جديد للمنصة'}
            </h3>

            <form onSubmit={handleSaveShop} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">اسم المتجر بالعربي *</label>
                <input
                  type="text"
                  required
                  value={shopNameArInput}
                  onChange={(e) => setShopNameArInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">الوصف والتفاصيل</label>
                <input
                  type="text"
                  value={shopDescriptionInput}
                  onChange={(e) => setShopDescriptionInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">أجرة التوصيل الخاص بالمتجر (د.ع)</label>
                <input
                  type="number"
                  value={shopDeliveryFeeInput}
                  onChange={(e) => setShopDeliveryFeeInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingShop}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
                >
                  {savingShop ? 'جاري الحفظ...' : 'حفظ المتجر ✅'}
                </button>
                <button
                  type="button"
                  onClick={() => setShopModalOpen(false)}
                  className="py-3 px-4 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
