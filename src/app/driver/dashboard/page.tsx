'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Truck,
  Phone,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Loader2,
  DollarSign,
  ShieldAlert,
  MapPin,
  Package,
  User,
  ShoppingBag,
  ImageIcon,
  Settings,
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    nameAr: string;
    price: number;
  };
}

interface Order {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  totalPrice: number;
  deliveryFee: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  shop: {
    nameAr: string;
    imageUrl?: string | null;
  };
  houseImage?: string | null;
  items: OrderItem[];
}

interface DriverData {
  id: string;
  name: string;
  phone: string;
  vehicle?: string | null;
  vehicleImage?: string | null;
  vehiclePlateImage?: string | null;
  currentDebt?: number;
  maxCreditLimit?: number;
  isAvailable: boolean;
  isBlocked: boolean;
}

interface TransportRequest {
  id: string;
  type: string;
  pickupLocation: string;
  dropoffLocation: string;
  notes: string | null;
  customerPhone: string;
  recipientPhone?: string | null;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  price?: number;
  status: string;
  createdAt: string;
}

function DriverDashboardContent() {
  const searchParams = useSearchParams();

  const [driver, setDriver] = useState<DriverData | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);

  const [activeTransport, setActiveTransport] = useState<TransportRequest[]>([]);
  const [completedTransport, setCompletedTransport] = useState<TransportRequest[]>([]);
  const [availableTransport, setAvailableTransport] = useState<TransportRequest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successOrders, setSuccessOrders] = useState<string[]>([]);
  const [transportPrices, setTransportPrices] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState('');
  
  // Profile State
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [driverNameInput, setDriverNameInput] = useState('');
  const [driverPhoneInput, setDriverPhoneInput] = useState('');
  const [driverVehicleInput, setDriverVehicleInput] = useState('');
  const [driverVehicleImageInput, setDriverVehicleImageInput] = useState('');
  const [driverVehiclePlateImageInput, setDriverVehiclePlateImageInput] = useState('');
  const [driverPasswordInput, setDriverPasswordInput] = useState('');

  // Repayment State
  const [officialWallet, setOfficialWallet] = useState<string>('');
  const [officialWalletProvider, setOfficialWalletProvider] = useState<string>('زين كاش');
  const [repaymentAmountInput, setRepaymentAmountInput] = useState<string>('');
  const [repaymentImageUrlInput, setRepaymentImageUrlInput] = useState<string>('');
  const [savingRepayment, setSavingRepayment] = useState(false);
  const [repaymentSuccessMsg, setRepaymentSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'AVAILABLE' | 'HISTORY' | 'PROFILE' | 'REPAY'>('ACTIVE');

  useEffect(() => {
    fetchDriverDashboard(false);
    const interval = setInterval(() => {
      fetchDriverDashboard(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDriverDashboard = async (silent = false) => {
    try {
      const driverSession = typeof window !== 'undefined' ? localStorage.getItem('dazly_driver_session') : null;
      if (!driverSession) {
        window.location.href = '/login/driver';
        return;
      }

      if (!silent) setLoading(true);
      setErrorMsg('');

      const res = await fetch(`/api/driver/dashboard?driverId=${driverSession}`);
      
      if (res.status === 401) {
        localStorage.removeItem('dazly_driver_session');
        window.location.href = '/login/driver';
        return;
      }

      const data = await res.json();

      if (data.success) {
        setDriver(data.driver);
        setActiveOrders(data.activeOrders);
        setCompletedOrders(data.completedOrders);
        setAvailableOrders(data.availableOrders);
        
        setActiveTransport(data.activeTransport || []);
        setCompletedTransport(data.completedTransport || []);
        setAvailableTransport(data.availableTransport || []);
        
        if (data.driver && !driverNameInput) {
           setDriverNameInput(data.driver.name || '');
           setDriverPhoneInput(data.driver.phone || '');
           setDriverVehicleInput(data.driver.vehicle || '');
           setDriverVehicleImageInput(data.driver.vehicleImage || '');
           setDriverVehiclePlateImageInput(data.driver.vehiclePlateImage || '');
        }

        fetch('/api/admin/settings/wallet')
          .then(res => res.json())
          .then(walletData => {
            if (walletData.success) {
               setOfficialWallet(walletData.walletNumber || '');
               setOfficialWalletProvider(walletData.walletProviderName || 'زين كاش');
            }
          }).catch(console.error);
          
      } else {
        setErrorMsg(data.error || 'فشل في جلب بيانات لوحة السائق');
      }
    } catch (err) {
      console.error('Error fetching driver dashboard:', err);
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!driver) return;

    try {
      setActionLoading(orderId);
      setErrorMsg('');

      const res = await fetch('/api/driver/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver.id,
          orderId,
          action: 'ACCEPT',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessOrders((prev) => [...prev, orderId]);
        fetchDriverDashboard(true);
        setTimeout(() => {
          setActiveTab('ACTIVE');
        }, 1200);
      } else {
        setErrorMsg(data.error || 'فشل في قبول الطلب');
      }
    } catch (err) {
      console.error('Error accepting order:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: 'ON_THE_WAY' | 'DELIVERED') => {
    if (!driver) return;

    try {
      setActionLoading(orderId);
      setErrorMsg('');

      const res = await fetch('/api/driver/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver.id,
          orderId,
          action: 'UPDATE_STATUS',
          newStatus,
        }),
      });

      const data = await res.json();

      if (data.success) {
        fetchDriverDashboard(true);
      } else {
        setErrorMsg(data.error || 'فشل في تحديث حالة الطلب');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptTransport = async (requestId: string, price?: number) => {
    if (!driver) return;
    try {
      setActionLoading(requestId);
      setErrorMsg('');
      const res = await fetch('/api/driver/transport', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: driver.id, requestId, action: 'ACCEPT', price }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessOrders((prev) => [...prev, requestId]);
        fetchDriverDashboard(true);
        setTimeout(() => setActiveTab('ACTIVE'), 1200);
      } else {
        setErrorMsg(data.error || 'فشل في قبول الطلب');
      }
    } catch (err) {
      console.error('Error accepting transport req:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateTransportStatus = async (requestId: string, newStatus: string) => {
    if (!driver) return;
    try {
      setActionLoading(requestId);
      setErrorMsg('');
      const res = await fetch('/api/driver/transport', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: driver.id, requestId, action: 'UPDATE_STATUS', newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDriverDashboard(true);
      } else {
        setErrorMsg(data.error || 'فشل في تحديث الحالة');
      }
    } catch (err) {
      console.error('Error updating transport status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver) return;
    try {
      setSavingSettings(true);
      setProfileSuccessMsg('');
      setErrorMsg('');
      const res = await fetch('/api/driver/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver.id,
          name: driverNameInput,
          phone: driverPhoneInput,
          vehicle: driverVehicleInput,
          vehicleImage: driverVehicleImageInput,
          vehiclePlateImage: driverVehiclePlateImageInput,
          password: driverPasswordInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileSuccessMsg(data.message || 'تم إرسال طلب التحديث بنجاح');
        setDriverPasswordInput('');
        fetchDriverDashboard();
      } else {
        alert(data.error || 'حدث خطأ في حفظ الإعدادات');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleReceiptImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أصغر من 5 ميغابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRepaymentImageUrlInput(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver || !repaymentAmountInput || !repaymentImageUrlInput) return;
    try {
      setSavingRepayment(true);
      setRepaymentSuccessMsg('');
      setErrorMsg('');
      const res = await fetch('/api/driver/repayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver.id,
          amount: repaymentAmountInput,
          receiptImage: repaymentImageUrlInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRepaymentSuccessMsg(data.message || 'تم إرسال طلب التسديد المالي بنجاح');
        setRepaymentAmountInput('');
        setRepaymentImageUrlInput('');
      } else {
        setErrorMsg(data.error || 'حدث خطأ في إرسال التسديد');
      }
    } catch (err) {
      console.error('Error saving repayment:', err);
    } finally {
      setSavingRepayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-bold">جاري تحميل لوحة التحكم المالية ورنج الديون للسائق...</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-200">حساب السائق غير موجود</h2>
        <p className="text-xs text-slate-400">{errorMsg || 'يرجى للتأكد من تسجيل الدخول برقم هاتف السائق الصحيح'}</p>
        <Link
          href="/login/driver"
          className="inline-block py-2.5 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl"
        >
          صفحة تسجيل دخول السائق
        </Link>
      </div>
    );
  }

  const currentDebtVal = Number(driver.currentDebt) || 0;
  const maxCreditLimitVal = Number(driver.maxCreditLimit) || 50000;
  const debtRatio = Math.max(0, Math.min(100, Math.round((currentDebtVal / (maxCreditLimitVal || 1)) * 100) || 0));

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/login/driver"
          className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تبديل الحساب</span>
        </Link>
        
        <div className="flex items-center gap-2 text-right">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-100">{driver.name}</h1>
            <span className="text-[11px] text-amber-400 font-mono dir-ltr">{driver.phone}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2 text-red-400 text-xs font-bold text-right animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FINANCIAL SUMMARY & DEBT TRACKER CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 text-right">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-100 text-sm">سجل الذمة المالية والتسليمات (الديون)</h2>
              <p className="text-[10px] text-slate-400">المبالغ المستحصلة نقداً لصالح المنصة ورنج الاعتماد المسموح</p>
            </div>
          </div>

          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
            driver.isBlocked
              ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
              : debtRatio > 75
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {driver.isBlocked ? 'محظور من استلام طلبات' : 'حساب سليم ومستمر'}
          </span>
        </div>

        {/* Financial Numbers Overview */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">الدين الحالي المستحصل (الذمة المالية):</span>
            <span className={`font-mono font-black text-lg ${driver.isBlocked ? 'text-red-400' : 'text-amber-400'}`}>
              {currentDebtVal.toLocaleString('en-US')} <span className="text-xs text-slate-400 font-normal">د.ع</span>
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 block font-medium">رنج الدين المسموح به (الحد الأقصى):</span>
            <span className="font-mono font-black text-lg text-purple-400">
              {maxCreditLimitVal.toLocaleString('en-US')} <span className="text-xs text-slate-400 font-normal">د.ع</span>
            </span>
          </div>
        </div>

        {/* Debt Progress Gauge Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-400">مستوى استهلاك رنج الدين</span>
            <span className={driver.isBlocked ? 'text-red-400 font-mono' : 'text-amber-400 font-mono'}>
              {debtRatio}%
            </span>
          </div>
          
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                driver.isBlocked
                  ? 'bg-gradient-to-r from-red-600 to-rose-500'
                  : debtRatio > 75
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-500'
              }`}
              style={{ width: `${debtRatio}%` }}
            />
          </div>
        </div>

        {/* CREDIT LIMIT WARNING / BLOCK BANNER */}
        {driver.isBlocked && (
          <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded-2xl space-y-2 text-right text-red-300 animate-fadeIn">
            <div className="flex items-center gap-2 font-black text-sm text-red-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>تنبيه هام: تم تجاوز رنج الدين المسموح به</span>
            </div>
            <p className="text-xs text-red-200/90 leading-relaxed font-bold">
              بلغت الذمة المالية الحالية <strong className="text-white font-mono">{currentDebtVal.toLocaleString('en-US')} د.ع</strong> بينما الحد الأقصى هو <strong className="text-white font-mono">{maxCreditLimitVal.toLocaleString('en-US')} د.ع</strong>.
            </p>
            <p className="text-[11px] text-red-300/80">
              تم إيقاف إمكانية قبول طلبات جديدة تلقائياً حتى تسديد وتصفية المبالغ مع الأدمن.
            </p>
          </div>
        )}
      </div>

      {/* TAB NAVIGATION CONTROLS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ACTIVE'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>طلبات قيد التوصيل ({activeOrders.length + activeTransport.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AVAILABLE')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'AVAILABLE'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>طلبات متاحة للاستلام ({availableOrders.length + availableTransport.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'HISTORY'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>السجل التراكمي ({completedOrders.length + completedTransport.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex-[0.8] min-w-[80px] py-2.5 px-2 rounded-xl font-extrabold text-[10px] transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'PROFILE'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>حسابي</span>
        </button>

        <button
          onClick={() => setActiveTab('REPAY')}
          className={`flex-1 min-w-[120px] py-2.5 px-2 rounded-xl font-extrabold text-[10px] transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'REPAY'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-105'
              : 'bg-slate-900 text-emerald-400 hover:bg-emerald-950/30 border border-emerald-900/50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>تصفية الذمة وتسديد</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE ASSIGNED ORDERS */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          {activeOrders.length === 0 && activeTransport.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <Truck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-bold text-sm">لا توجد طلبات جارية قيد التوصيل حالياً</p>
              <p className="text-xs text-slate-500">اختر طلبات من تبويب "طلبات متاحة" لبدء وردية التوصيل</p>
            </div>
          ) : (
            <>
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 space-y-4 text-right shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-xs text-purple-400">#{order.id.slice(-6)}</span>
                    <h3 className="font-extrabold text-slate-100 text-sm">{order.shop?.nameAr || 'متجر غير معروف'}</h3>
                  </div>
                  <span className="py-1 px-3 bg-purple-950 text-purple-300 border border-purple-800/40 rounded-full font-bold text-xs">
                    {order.status === 'ON_THE_WAY' ? 'جاري التوصيل 🛵' : 'مسند لك - يرجى التوجه للمتجر 🏃‍♂️'}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>المستلم: {order.customerName}</span>
                    </span>

                    <a
                      href={`tel:${order.customerPhone}`}
                      className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 dir-ltr"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{order.customerPhone}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-1 text-slate-300 font-semibold">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>العنوان: {order.deliveryArea}</span>
                  </div>

                  {order.houseImage && (
                    <div className="pt-2 border-t border-slate-800/80 mt-2">
                       <p className="font-bold text-slate-400 text-xs mb-1.5 flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-emerald-400" /> صورة واجهة/باب المنزل:</p>
                       <img src={order.houseImage} alt="باب المنزل" className="w-full h-40 object-cover rounded-xl border border-slate-700 shadow-sm" />
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800/60 pt-2">
                  <p className="font-bold text-slate-400">محتويات الشحنة:</p>
                  {order.items?.map((i) => (
                    <div key={i.id} className="flex items-center justify-between text-xs py-0.5">
                      <span>• {i.product?.nameAr || 'منتج غير معروف'} x{i.quantity}</span>
                      <span className="font-mono text-slate-400">{Number(Number(i.unitPrice||0) * Number(i.quantity||0)).toLocaleString('en-US')} د.ع</span>
                    </div>
                  ))}
                </div>

                {/* Cash To Collect Banner */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-300 font-bold text-xs">
                  <span>المبلغ الواجب تحصيله نقداً من الزبون:</span>
                  <span className="font-mono font-black text-sm text-amber-400">{Number(order.grandTotal || 0).toLocaleString('en-US')} د.ع</span>
                </div>

                {/* Driver Order Status Controls */}
                <div className="flex items-center gap-2 pt-1">
                  {order.status !== 'ON_THE_WAY' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ON_THE_WAY')}
                      disabled={actionLoading === order.id}
                      className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      {actionLoading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                      <span>الانطلاق بالطريق 🛵</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                    disabled={actionLoading === order.id}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-glow-mart flex items-center justify-center gap-1.5 transition-all"
                  >
                    {actionLoading === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>تم التسليم واكتمل الطلب ✅</span>
                  </button>
                </div>

              </div>
            ))}
            {activeTransport.map((tr) => (
              <div key={tr.id} className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 space-y-4 text-right shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-xs text-emerald-400">#TR-{tr.id.slice(-5)}</span>
                    <h3 className="font-extrabold text-slate-100 text-sm">خدمة أوصلني ({tr.type === 'PEOPLE' ? 'مشوار' : 'أمانة'})</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`py-1 px-3 border rounded-full font-bold text-xs ${tr.status === 'NEGOTIATING' ? 'bg-amber-950 text-amber-300 border-amber-800/40' : 'bg-emerald-950 text-emerald-300 border-emerald-800/40'}`}>
                      {tr.status === 'NEGOTIATING' ? 'بانتظار موافقة الزبون على السعر ⏳' : 'جاري التوصيل 🚀'}
                    </span>
                    <span className={`font-mono font-black text-[13px] ${tr.status === 'NEGOTIATING' ? 'text-amber-300' : 'text-amber-400'}`}>
                      {Number(tr.price || 1500).toLocaleString('en-US')} د.ع
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-400" /> الزبون
                    </span>
                    {tr.status !== 'NEGOTIATING' && !tr.customerPhone.includes('يظهر') ? (
                      <a href={`tel:${tr.customerPhone}`} className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 dir-ltr">
                        <Phone className="w-3.5 h-3.5" />
                        {tr.customerPhone}
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-bold bg-slate-900 border border-slate-800 py-1 px-3 rounded-lg flex items-center gap-1">🔒 {tr.customerPhone}</span>
                    )}
                  </div>
                  {tr.recipientPhone && (
                    <div className="flex items-center justify-between pt-2">
                       <span className="font-medium flex items-center gap-1">
                         <Package className="w-3.5 h-3.5 text-amber-400" /> هاتف المستلم (للتسليم)
                       </span>
                       {tr.status !== 'NEGOTIATING' && !tr.recipientPhone.includes('يظهر') ? (
                         <a href={`tel:${tr.recipientPhone}`} className="py-1 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 dir-ltr">
                           <Phone className="w-3.5 h-3.5" />
                           {tr.recipientPhone}
                         </a>
                       ) : (
                         <span className="text-[11px] text-slate-500 font-bold bg-slate-900 border border-slate-800 py-1 px-3 rounded-lg flex items-center gap-1">🔒 {tr.recipientPhone}</span>
                       )}
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="font-semibold text-teal-400 flex items-center gap-2 flex-wrap">
                      <span>من: {tr.pickupLocation}</span>
                      {tr.pickupLat && tr.pickupLng && (
                        <a href={`https://maps.google.com/?q=${tr.pickupLat},${tr.pickupLng}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">عرض الخريطة 📍</a>
                      )}
                    </p>
                    <p className="font-semibold text-emerald-400 mt-2 flex items-center gap-2 flex-wrap">
                      <span>إلى: {tr.dropoffLocation}</span>
                      {tr.dropoffLat && tr.dropoffLng && (
                        <a href={`https://maps.google.com/?q=${tr.dropoffLat},${tr.dropoffLng}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">عرض الخريطة 📍</a>
                      )}
                    </p>
                  </div>

                  {tr.notes && (
                    <div className="mt-2 p-2 bg-slate-800/50 rounded-lg text-slate-400">
                      ملاحظة: {tr.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {tr.status === 'NEGOTIATING' ? (
                     <div className="flex-1 py-3 px-4 bg-amber-900/20 border border-amber-900/50 text-amber-300 font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 opacity-80 cursor-wait">
                       <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                       يرجى انتظار موافقة الزبون لظهور رقم الهاتف والبدء...
                     </div>
                  ) : (
                    <button
                      onClick={() => handleUpdateTransportStatus(tr.id, 'COMPLETED')}
                      disabled={actionLoading === tr.id}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-glow-mart flex items-center justify-center gap-1.5 transition-all"
                    >
                      {actionLoading === tr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>تم التوصيل بنجاح ✅</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            </>
          )}
        </div>
      )}

      {/* TAB 2: UNASSIGNED AVAILABLE ORDERS */}
      {activeTab === 'AVAILABLE' && (
        <div className="space-y-4">
          {driver.isBlocked ? (
            <div className="p-6 bg-red-500/10 border-2 border-red-500/40 rounded-3xl text-center space-y-2 text-red-300">
              <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="font-extrabold text-base">تم إيقاف قبول الطلبات</h3>
              <p className="text-xs text-red-200/90 max-w-sm mx-auto">
                لا يمكنك قبول أي طلبات جديدة حتى تتم تصفية وسداد الذمة المالية المستحصلة لدى إدارة المنصة.
              </p>
            </div>
          ) : availableOrders.length === 0 && availableTransport.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-bold text-sm">لا توجد طلبات جديدة متاحة للاستلام الآن</p>
              <p className="text-xs text-slate-500">سيتم تجميع وإظهار الطلبات المكتملة للتجهيز تلقائياً</p>
            </div>
          ) : (
            <>
            {availableOrders.map((order) => (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 text-right">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-xs text-purple-400">#{order.id.slice(-6)}</span>
                    <h3 className="font-extrabold text-slate-100 text-sm">{order.shop?.nameAr || 'متجر غير معروف'}</h3>
                  </div>
                  <span className="font-mono font-black text-sm text-purple-300">
                    المبلغ: {Number(order.grandTotal || 0).toLocaleString('en-US')} د.ع
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong className="text-slate-400">منطقة التوصيل:</strong> {order.deliveryArea}</p>
                  <p><strong className="text-slate-400">العناصر:</strong> {order.items?.length || 0} منتجات</p>
                </div>

                {order.houseImage && (
                  <div className="pt-2 border-t border-slate-800/80 mt-2">
                     <p className="font-bold text-slate-400 text-xs mb-1.5 flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-emerald-400" /> صورة واجهة/باب المنزل:</p>
                     <img src={order.houseImage} alt="باب المنزل" className="w-full h-32 object-cover rounded-xl border border-slate-700 shadow-sm opacity-80 hover:opacity-100 transition-opacity" />
                  </div>
                )}

                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  disabled={actionLoading === order.id || successOrders.includes(order.id)}
                  className={`w-full py-3 px-4 ${
                    successOrders.includes(order.id) 
                      ? 'bg-emerald-600 text-emerald-50' 
                      : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white shadow-glow-primary'
                  } font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all`}
                >
                  {actionLoading === order.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : successOrders.includes(order.id) ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span>{successOrders.includes(order.id) ? '✅ تمت العملية' : 'قبول الطلب وتوليه فوراً'}</span>
                </button>
              </div>
            ))}
            {availableTransport.map((tr) => (
              <div key={tr.id} className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 space-y-3 text-right shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-xs text-emerald-400">#TR-{tr.id.slice(-5)}</span>
                    <h3 className="font-extrabold text-slate-100 text-sm">خدمة أوصلني ({tr.type === 'PEOPLE' ? 'مشوار' : 'أمانة'})</h3>
                  </div>
                  <span className="font-bold text-[10px] text-emerald-300 bg-emerald-950 px-2 py-1 rounded-lg">طلب جديد 🔥</span>
                </div>

                <div className="text-xs text-slate-300 space-y-1.5 pt-1">
                  <div className="flex flex-col gap-1">
                    <p><strong className="text-teal-400">من:</strong> {tr.pickupLocation}</p>
                    {tr.pickupLat && tr.pickupLng && (
                      <a href={`https://maps.google.com/?q=${tr.pickupLat},${tr.pickupLng}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30 w-fit">عرض الاستلام على الخريطة 📍</a>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p><strong className="text-emerald-400">إلى:</strong> {tr.dropoffLocation}</p>
                    {tr.dropoffLat && tr.dropoffLng && (
                      <a href={`https://maps.google.com/?q=${tr.dropoffLat},${tr.dropoffLng}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30 w-fit">عرض التسليم على الخريطة 📍</a>
                    )}
                  </div>
                  {tr.recipientPhone && (
                    <p className="flex items-center gap-1"><strong className="text-amber-400">هاتف المستلم:</strong> <span className="dir-ltr">{tr.recipientPhone}</span></p>
                  )}
                  {tr.notes && <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">ملاحظة: {tr.notes}</p>}
                </div>
                
                <div className="pt-2 flex items-center justify-between bg-slate-950 px-3 py-2 border border-slate-800 rounded-xl">
                  <label className="text-xs font-bold text-slate-400">تعديل أجرة الطلب:</label>
                  <div className="flex items-center gap-1.5 flex-row-reverse relative">
                    <span className="text-[10px] text-slate-500 font-bold">د.ع</span>
                    <input
                      type="number"
                      min="500"
                      step="250"
                      value={transportPrices[tr.id] !== undefined ? transportPrices[tr.id] : (tr.price || 1500)}
                      onChange={(e) => setTransportPrices(prev => ({ ...prev, [tr.id]: parseInt(e.target.value) || 0 }))}
                      className="bg-slate-900 border border-amber-900/50 focus:border-amber-500 rounded-lg px-2 py-1.5 text-sm text-amber-400 font-mono font-black w-24 text-center transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptTransport(tr.id, transportPrices[tr.id] !== undefined ? transportPrices[tr.id] : (tr.price || 1500))}
                  disabled={actionLoading === tr.id || successOrders.includes(tr.id)}
                  className={`w-full py-3 px-4 mt-2 ${
                    successOrders.includes(tr.id) 
                      ? 'bg-emerald-600 text-emerald-50' 
                      : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-glow-primary'
                  } font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all`}
                >
                  {actionLoading === tr.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : successOrders.includes(tr.id) ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span>{successOrders.includes(tr.id) ? '✅ تمت العملية' : 'قبول مشوار أوصلني فوراً'}</span>
                </button>
              </div>
            ))}
            </>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED ORDERS HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-3">
          {completedOrders.length === 0 && completedTransport.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-bold text-sm mt-2">لا توجد طلبات مسلّمة سابقة بعد</p>
            </div>
          ) : (
            <>
            {completedOrders.map((order) => (
              <div key={order.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-right text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{order.shop?.nameAr || 'متجر غير معروف'}</span>
                    <span className="font-mono text-purple-400 text-[11px]">#{order.id.slice(-6)}</span>
                  </div>
                  <p className="text-slate-400">{order.customerName} • {order.deliveryArea}</p>
                </div>

                <div className="text-left space-y-0.5">
                  <span className="font-mono font-black text-emerald-400 text-sm block">
                    +{Number(order.grandTotal || 0).toLocaleString('en-US')} د.ع
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                  </span>
                </div>
              </div>
            ))}
            {completedTransport.map((tr) => (
              <div key={tr.id} className="p-4 bg-slate-900 border border-emerald-900/40 rounded-2xl flex items-center justify-between text-right text-xs shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">خدمة أوصلني ({tr.type === 'PEOPLE' ? 'مشوار' : 'أمانة'})</span>
                    <span className="font-mono text-emerald-400 text-[11px]">#TR-{tr.id.slice(-5)}</span>
                  </div>
                  <p className="text-slate-400">{tr.pickupLocation} ➔ {tr.dropoffLocation}</p>
                </div>

                <div className="text-left space-y-0.5">
                  <span className="font-mono font-black text-emerald-400 text-sm block">
                    +{Number(tr.price || 1500).toLocaleString('en-US')} د.ع ✅
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(tr.createdAt).toLocaleDateString('ar-IQ')}
                  </span>
                </div>
              </div>
            ))}
            </>
          )}
        </div>
      )}

      {/* TAB 4: DRIVER PROFILE & SETTINGS */}
      {activeTab === 'PROFILE' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2 mb-6 pb-4 border-b border-slate-800 text-right">
              <Settings className="w-5 h-5 text-purple-400" />
              <span>إدارة الملف الشخصي للكابتن</span>
            </h2>

            {profileSuccessMsg && (
              <div className="mb-6 w-full p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 font-bold text-sm text-right">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-right text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block text-right">الاسم الكامل *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={driverNameInput}
                    onChange={(e) => setDriverNameInput(e.target.value)}
                    className="w-full py-2.5 px-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute top-3 right-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block text-right">رقم الهاتف *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={driverPhoneInput}
                    onChange={(e) => setDriverPhoneInput(e.target.value)}
                    className="w-full py-2.5 px-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-purple-500 transition-colors tracking-wider"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute top-3 right-4" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block text-right">نوع المركبة *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={driverVehicleInput}
                    onChange={(e) => setDriverVehicleInput(e.target.value)}
                    className="w-full py-2.5 px-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <Truck className="w-4 h-4 text-slate-500 absolute top-3 right-4" />
                </div>
              </div>
              
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="font-bold text-slate-300 block text-right">كلمة المرور الجديدة (اختياري)</label>
                <p className="text-[10px] pb-1 text-slate-500">اترك الحقل فارغاً إذا كنت لا ترغب بتغيير كلمة المرور</p>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="******"
                    value={driverPasswordInput}
                    onChange={(e) => setDriverPasswordInput(e.target.value)}
                    className="w-full py-2.5 px-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-purple-500 transition-colors tracking-wider"
                  />
                  <Settings className="w-4 h-4 text-slate-500 absolute top-3 right-4" />
                </div>
              </div>

              <div className="pt-4 pb-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-4 text-white bg-purple-600 hover:bg-purple-500 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                >
                  {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  <span>طلب التحديث للإدارة (قيد المراجعة)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: REPAYMENT DEBT CLEARANCE */}
      {activeTab === 'REPAY' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 shadow-xl text-right">
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>تصفية الذمة وتسديد الديون 💸</span>
            </h2>

            <div className="p-4 mb-6 bg-slate-950 border border-emerald-900/50 rounded-2xl space-y-2">
              <p className="font-bold text-slate-300 text-sm flex gap-2">
                <span className="text-emerald-400">رقم المحفظة المعتمد للتحويل ({officialWalletProvider}):</span>
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-mono font-black tracking-wider text-white bg-emerald-600 px-4 py-1.5 rounded-xl border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] select-all dir-ltr mx-auto block max-w-max text-center">
                  {officialWallet || 'لا يوجد رقم محفظة مسجل'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold mt-2 text-center border-t border-slate-800 pt-2">
                يرجى تحويل المبلغ المطلوب إلى هذا الرقم، ثم إرفاق صورة الإشعار (وصل التحويل) أدناه.
              </p>
            </div>

            {repaymentSuccessMsg && (
              <div className="mb-6 w-full p-4 bg-emerald-900/60 border border-emerald-500 rounded-2xl flex items-center gap-3 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{repaymentSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveRepayment} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block text-right">مبلغ التسديد (بالدينار العراقي) *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    required
                    value={repaymentAmountInput}
                    onChange={(e) => setRepaymentAmountInput(e.target.value)}
                    placeholder="مثال: 50000"
                    className="w-full py-3 px-4 pr-11 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <DollarSign className="w-4 h-4 text-emerald-500 absolute top-3.5 right-4" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-slate-300 block text-right">صورة الإشعار (وصل تحويل {officialWalletProvider}) *</label>
                <p className="text-[10px] pb-1 text-slate-500">التقط صورة للوصل أو اختره من الاستوديو 📸</p>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    required={!repaymentImageUrlInput}
                    onChange={handleReceiptImageChange}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 text-left dir-ltr"
                  />
                  <ImageIcon className="w-4 h-4 text-emerald-500 absolute top-4 right-4" />
                </div>
                {repaymentImageUrlInput && (
                  <div className="mt-2 w-full h-40 rounded-xl overflow-hidden border-2 border-emerald-900/50 relative group">
                    <img src={repaymentImageUrlInput} alt="Preview" className="w-full h-full object-contain bg-black/50" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <button 
                       type="button" 
                       onClick={() => setRepaymentImageUrlInput('')}
                       className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       حذف وإعادة اختيار
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 pb-2">
                <button
                  type="submit"
                  disabled={savingRepayment || !officialWallet}
                  className="w-full py-4 text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                >
                  {savingRepayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  <span>طلب الخصم من الذمة المالية</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DriverDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-bold">جاري تحميل لوحة السائق...</p>
        </div>
      }
    >
      <DriverDashboardContent />
    </Suspense>
  );
}
