'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Store, Truck, User, Phone, MapPin, CheckCircle2, AlertCircle, Loader2, Sparkles, Image, Map, Eye, EyeOff, Lock } from 'lucide-react';
import { MapLocationPicker } from '@/components/MapLocationPicker';

export default function JoinRequestPage() {
  const [applicantType, setApplicantType] = useState<'SHOP' | 'DRIVER'>('SHOP');
  
  // Store Owner Specific Fields
  const [ownerName, setOwnerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [mapCoordinates, setMapCoordinates] = useState('');
  const [storeFrontImage, setStoreFrontImage] = useState('');
  const [storeType, setStoreType] = useState('سوبرماركت / مواد غذائية');
  const [minOrderAmount, setMinOrderAmount] = useState('15000');
  const [notes, setNotes] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Driver Specific Fields
  const [vehicle, setVehicle] = useState('دراجة نارية');
  const [vehicleImage, setVehicleImage] = useState('');
  const [vehiclePlateImage, setVehiclePlateImage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
      setStoreFrontImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBase64Upload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('حجم الصورة كبير جداً، يرجى اختيار صورة حجمها أقل من 5 ميغابايت');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => { setter(reader.result as string) };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (applicantType === 'SHOP') {
      if (!ownerName.trim() || !shopName.trim() || !phone.trim() || !area.trim() || !pinCode.trim()) {
        setErrorMsg('يرجى كتابة اسم صاحب المتجر، اسم المتجر، رقم الهاتف، والموقع، والرمز السري');
        return;
      }
      if (!mapCoordinates.trim()) {
        setErrorMsg('يرجى تحديد موقع المحل على الخريطة أولاً (حقل إجباري)');
        return;
      }
    } else {
      if (!ownerName.trim() || !phone.trim() || !pinCode.trim()) {
        setErrorMsg('يرجى ملء الاسم الكامل، رقم الهاتف، والرمز السري');
        return;
      }
      if (!vehicleImage || !vehiclePlateImage) {
        setErrorMsg('يرجى إرفاق صورة الوسيلة وصورة اللوحة المعدنية/الرقم (حقول إجبارية للمندوب)');
        return;
      }
    }

    const hasLetter = /[a-zA-Z]/.test(pinCode);
    if (pinCode.trim().length < 8 || !hasLetter) {
      setErrorMsg('كلمة المرور يجب أن لا تقل عن 8 خانات وتحتوي على حرف أبجدي واحد على الأقل (أنجليزي).');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const finalNotes = applicantType === 'SHOP' ? `نوع المتجر: ${storeType}\n${notes.trim()}` : notes.trim();

      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: applicantType,
          ownerName: ownerName.trim(),
          name: ownerName.trim(),
          phone: phone.trim(),
          shopName: applicantType === 'SHOP' ? shopName.trim() : undefined,
          area: applicantType === 'SHOP' ? area.trim() : '',
          mapCoordinates: applicantType === 'SHOP' ? mapCoordinates.trim() : null,
          storeFrontImage: storeFrontImage.trim() || undefined,
          vehicle: applicantType === 'DRIVER' ? vehicle.trim() : null,
          vehicleImage: applicantType === 'DRIVER' ? vehicleImage.trim() : null,
          vehiclePlateImage: applicantType === 'DRIVER' ? vehiclePlateImage.trim() : null,
          minOrderAmount: applicantType === 'SHOP' ? minOrderAmount : undefined,
          notes: finalNotes,
          pinCode: pinCode.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setSuccessMessage(data.message || 'تم إرسال طلبك بنجاح، سيتم مراجعته وتفعيل حسابك من قبل الإدارة قريباً.');
      } else {
        setErrorMsg(data.error || 'حدث خطأ أثناء إرسال طلب الانضمام');
      }
    } catch (err) {
      console.error('Error submitting join request:', err);
      setErrorMsg('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6">
      
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700/60 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للتطبيق</span>
      </Link>

      {/* Main Form Card */}
      <div className="bg-slate-900 border border-purple-800/40 rounded-3xl p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-slate-100">نموذج تسجيل الانضمام - دزلي DIZLY</h1>
          <p className="text-xs text-slate-400">سجل حساب متجرك أو كمندوب توصيل للانضمام إلى المنصة</p>
        </div>

        {/* Applicant Type Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setApplicantType('SHOP')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all ${
              applicantType === 'SHOP'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>تسجيل صاحب متجر</span>
          </button>

          <button
            type="button"
            onClick={() => setApplicantType('DRIVER')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all ${
              applicantType === 'DRIVER'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>تسجيل مندوب توصيل</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
            <AlertCircle className="w-4 h-4 inline ml-1" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-6 bg-purple-950/50 border border-purple-500/40 rounded-2xl text-center space-y-4 animate-fadeIn">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <div className="space-y-1">
              <h3 className="font-black text-purple-100 text-lg">تم إرسال الطلب بنجاح! 🎉</h3>
              <p className="text-xs text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-800/60 py-2 px-3 rounded-xl inline-block">
                حالة الحساب: قيد الانتظار (Pending Approval)
              </p>
            </div>
            <p className="text-sm text-purple-200 leading-relaxed font-semibold">
              {successMessage || 'تم إرسال طلبك بنجاح، سيتم مراجعته وتفعيل حسابك من قبل الإدارة قريباً.'}
            </p>
            <Link
              href="/"
              className="inline-block py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-right text-xs">
            
            {/* 1. Owner Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">
                1. {applicantType === 'SHOP' ? 'اسم صاحب المتجر *' : 'اسم المندوب الكامل *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد عبد الله"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full py-2.5 px-3.5 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <User className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
              </div>
            </div>

            {/* 2. Shop Name (Store Owner only) */}
            {applicantType === 'SHOP' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">2. اسم المتجر *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="مثال: أسواق الكرادة الحديثة"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full py-2.5 px-3.5 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <Store className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">نوع المتجر *</label>
                  <input
                    type="text"
                    required
                    list="storeTypes"
                    placeholder="مثال: صيدلية، مطعم، محل ملابس..."
                    value={storeType}
                    onChange={(e) => setStoreType(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <datalist id="storeTypes">
                    <option value="صيدلية" />
                    <option value="مطعم" />
                    <option value="سوبرماركت / مواد غذائية" />
                    <option value="خضار وفواكه" />
                    <option value="محل إكسسوارات" />
                    <option value="ملابس" />
                    <option value="مخبز / حلويات" />
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">الحد الأدنى للطلبات (دينار عراقي) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    placeholder="مثال: 10000"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">لن يتمكن الزبون من إتمام الطلب إذا كان إجمالي المشتريات أقل من هذا المبلغ.</p>
                </div>
              </div>
            )}

            {/* 3. Phone Number */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">3. رقم الهاتف للتواصل والإنشاء *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="07701234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2.5 px-3.5 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors font-mono"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
              </div>
            </div>

            {/* Secret PIN */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">الرمز السري (يستخدم للدخول لحسابك لاحقاً) *</label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  placeholder="مثال: A1234567"
                  minLength={8}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full py-2.5 px-3.5 pr-10 pl-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors font-mono tracking-widest"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute top-3.5 right-3" />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute top-3.5 left-3 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">ثمانية (8) أحرف/أرقام كحد أدنى وبها حرف إنجليزي واحد على الأقل.</p>
            </div>

            {/* 4. Written Location / Address (Shop Only) */}
            {applicantType === 'SHOP' && (
              <div className="space-y-2">
                <label className="font-bold text-slate-300 block">4. اسم المنطقة (مثل: حي السعدون، قرية حميد،...) *</label>

                {/* Helper Examples Pills */}
                <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-medium pb-1">
                  <span className="opacity-80 mt-0.5 ml-1 select-none">أمثلة:</span>
                  <span className="bg-slate-900 py-0.5 px-2 rounded-lg border border-slate-800 cursor-help" onClick={(e) => setArea('حي السعدون')}>حي السعدون</span>
                  <span className="bg-slate-900 py-0.5 px-2 rounded-lg border border-slate-800 cursor-help" onClick={(e) => setArea('الزوية')}>الزوية</span>
                  <span className="bg-slate-900 py-0.5 px-2 rounded-lg border border-slate-800 cursor-help" onClick={(e) => setArea('حي الغدير')}>حي الغدير</span>
                  <span className="bg-slate-900 py-0.5 px-2 rounded-lg border border-slate-800 cursor-help" onClick={(e) => setArea('قرية حميد')}>قرية حميد</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسم منطقتك هنا..."
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full py-2.5 px-3.5 pr-10 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <MapPin className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
                </div>
              </div>
            )}

            {/* 5. Interactive Map Location Picker (Required for Store Owners) */}
            {applicantType === 'SHOP' && (
              <div className="space-y-1 animate-fadeIn">
                <span className="font-bold text-slate-300 block mb-1">5. الموقع التفاعلي على الخريطة (حقل إجباري) *</span>
                <MapLocationPicker
                  value={mapCoordinates}
                  onChange={(coords, hint) => {
                    setMapCoordinates(coords);
                    if (hint && !area.trim()) {
                      setArea(hint);
                    }
                  }}
                  required={true}
                />
              </div>
            )}

            {/* 6. Store Front Image Upload (Store Owner only) */}
            {applicantType === 'SHOP' && (
              <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 animate-fadeIn">
                <label className="font-bold text-slate-300 flex items-center gap-1.5 pb-1">
                  <Image className="w-4 h-4 text-purple-400" />
                  <span>6. تحميل صورة واجهة المتجر من جهازك</span>
                </label>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-slate-300 text-xs 
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-xl file:border-0
                    file:text-xs file:font-extrabold
                    file:bg-purple-600 file:text-white
                    hover:file:bg-purple-500 transition-colors cursor-pointer"
                />

                {storeFrontImage && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-700/60 max-w-[200px] h-32 relative">
                    <img src={storeFrontImage} alt="Store Front Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* Driver Vehicle Photos */}
            {applicantType === 'DRIVER' && (
              <div className="space-y-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 animate-fadeIn">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">نوع الوسيلة *</label>
                  <input
                    type="text"
                    required
                    list="vehicleTypes"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="vehicleTypes">
                    <option value="دراجة نارية" />
                    <option value="سيارة" />
                    <option value="شاحنة خفيفة (كيا)" />
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5 pb-1">
                    <Image className="w-4 h-4 text-amber-400" />
                    <span>صورة وسيلة النقل / المركبة *</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => handleBase64Upload(e, setVehicleImage)}
                    className="w-full text-slate-300 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                  />
                  {vehicleImage && (
                    <div className="mt-2 rounded-xl border border-slate-700 h-24 max-w-[150px] overflow-hidden">
                      <img src={vehicleImage} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5 pb-1">
                    <Image className="w-4 h-4 text-amber-400" />
                    <span>صورة واضحة للوحة تسجيل الوسيلة / الرقم *</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => handleBase64Upload(e, setVehiclePlateImage)}
                    className="w-full text-slate-300 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                  />
                  {vehiclePlateImage && (
                    <div className="mt-2 rounded-xl border border-slate-700 h-24 max-w-[150px] overflow-hidden">
                      <img src={vehiclePlateImage} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">ملاحظات إضافية (اختياري)</label>
              <textarea
                rows={2}
                placeholder="تفاصيل عن المنتجات، السجل التجاري، إلخ..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-xs resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-black text-sm rounded-xl shadow-glow-primary flex items-center justify-center gap-2 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إرسال طلب الانضمام...</span>
                </>
              ) : (
                <span>إرسال طلب الانضمام (قيد الانتظار)</span>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
