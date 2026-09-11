'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Compass, CheckCircle2 } from 'lucide-react';

interface MapLocationPickerProps {
  value: string; // e.g. "lat, lng"
  onChange: (coords: string, addressHint?: string) => void;
  required?: boolean;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  value,
  onChange,
  required = true,
}) => {
  const [lat, setLat] = useState<number>(32.2858);
  const [lng, setLng] = useState<number>(45.9818);
  const [locationName, setLocationName] = useState<string>('تحديد على الخريطة');
  const [gettingGPS, setGettingGPS] = useState(false);
  const [hasSelected, setHasSelected] = useState<boolean>(Boolean(value));
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Parse initial coordinates if passed
  useEffect(() => {
    if (value && value.includes(',')) {
      const parts = value.split(',').map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setLat(parts[0]);
        setLng(parts[1]);
        setHasSelected(true);
        if (mapInstance.current && markerInstance.current) {
           const newPos = { lat: parts[0], lng: parts[1] };
           mapInstance.current.setCenter(newPos);
           markerInstance.current.setPosition(newPos);
        }
      }
    }
  }, [value]);

  // Load Google Maps Script
  useEffect(() => {
    if (!apiKey) return;
    
    // @ts-ignore
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      // Script is already loading, wait for it
      const checkInterval = setInterval(() => {
        // @ts-ignore
        if (window.google && window.google.maps) {
          setMapLoaded(true);
          clearInterval(checkInterval);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    }
  }, [apiKey]);

  const initMap = useCallback(() => {
    // @ts-ignore
    if (!mapRef.current || !window.google || mapInstance.current) return;

    const initialPos = { lat, lng };

    // @ts-ignore
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: initialPos,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
    });

    // @ts-ignore
    markerInstance.current = new window.google.maps.Marker({
      position: initialPos,
      map: mapInstance.current,
      draggable: true,
      // @ts-ignore
      animation: window.google.maps.Animation.DROP,
    });

    // Handle map click
    mapInstance.current.addListener('click', (e: any) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      markerInstance.current.setPosition(e.latLng);
      handleSelectCoords(newLat, newLng, 'تحديد من الخريطة 📍');
    });

    // Handle marker drag end
    markerInstance.current.addListener('dragend', (e: any) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      handleSelectCoords(newLat, newLng, 'تحديد دقيق (عبر الدبوس) 📍');
    });
  }, [lat, lng]);

  useEffect(() => {
    if (mapLoaded) {
      initMap();
    }
  }, [mapLoaded, initMap]);

  const handleSelectCoords = (newLat: number, newLng: number, presetName?: string) => {
    const formattedLat = Number(newLat.toFixed(6));
    const formattedLng = Number(newLng.toFixed(6));
    setLat(formattedLat);
    setLng(formattedLng);
    setHasSelected(true);
    
    const coordsStr = `${formattedLat}, ${formattedLng}`;
    const nameStr = presetName || `تحديد دقيق (${formattedLat}, ${formattedLng})`;
    setLocationName(nameStr);
    
    // Pan map to new center
    if (mapInstance.current) {
       mapInstance.current.panTo({ lat: formattedLat, lng: formattedLng });
    }
    
    onChange(coordsStr, nameStr);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع غير مدعومة في متصفحك');
      return;
    }

    setGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGettingGPS(false);
        handleSelectCoords(pos.coords.latitude, pos.coords.longitude, 'موقعي الحالي عبر الـ GPS 📍');
        
        if (markerInstance.current) {
          markerInstance.current.setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      },
      (err) => {
        setGettingGPS(false);
        console.warn('Geolocation error:', err);
        alert('تعذر جلب موقع الـ GPS الحالي، يرجى تفعيل الموقع أو سحب الدبوس يدوياً.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-right text-xs shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-400" />
          <label className="font-black text-slate-100 text-sm">
            الخريطة التفاعلية (دبوس الموقع) {required && <span className="text-red-400">*</span>}
          </label>
        </div>
      </div>

      <p className="text-slate-400 text-[11px] leading-relaxed">
        قم بسحب الدبوس أو الضغط على أي مساحة في الخريطة لتحديد الموقع بدقة لتسهيل وصول الكابتن.
      </p>

      {apiKey ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 h-[280px] shadow-inner bg-slate-800 w-full group">
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold">
                <Navigation className="w-4 h-4 animate-spin ml-2" /> جاري تحميل الخريطة...
              </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Overlay My Location Button on Map (Floating) */}
            <button
              onClick={(e) => { e.preventDefault(); handleGetCurrentLocation(); }}
              disabled={gettingGPS}
              className="absolute bottom-6 right-4 bg-white/90 backdrop-blur hover:bg-white text-slate-900 p-3.5 rounded-full shadow-lg shadow-black/40 transition-all active:scale-90 flex items-center justify-center z-10 hover:shadow-xl ring-2 ring-transparent focus:ring-purple-500"
              title="توسيط الخريطة على موقعي الحالي"
            >
              <Navigation className={`w-5 h-5 ${gettingGPS ? 'animate-spin text-purple-600' : 'text-blue-600'}`} />
            </button>
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              اسحب الدبوس للتحديد 📌
            </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-800/80 rounded-xl text-center text-slate-400 border border-amber-900/40">
           تنبيه: مفتاح Google Maps غير متوفر. الخريطة التفاعلية معطلة حالياً. يمكنك استخدام زر الـ GPS ادناه أو الإدخال اليدوي.
        </div>
      )}

      {/* Primary GPS Action Button for UI parity */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={gettingGPS}
        className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm relative overflow-hidden"
      >
        <Navigation className={`w-4 h-4 ${gettingGPS ? 'animate-spin text-amber-300' : 'text-purple-400'}`} />
        <span>{gettingGPS ? 'جاري الاتصال...' : 'تحديد عبر GPS الهاتف 📍'}</span>
      </button>

      {/* Selected Location Target State */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between text-xs transition-all gap-3 ${
        hasSelected
          ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-200'
          : 'bg-slate-950 border-slate-800 text-slate-400'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <CheckCircle2 className={`w-6 h-6 shrink-0 mt-0.5 sm:mt-0 ${hasSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
          <div>
            <span className="font-bold block text-sm mb-0.5">{hasSelected ? 'تم تحديد الموقع بنجاح ✓' : 'لم يتم اختيار الموقع'}</span>
            <span className="font-mono text-[11px] opacity-80 dir-ltr block text-left w-full mt-1 bg-black/20 p-1 rounded min-w-[150px]">
              {hasSelected ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '---'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Manual Override Input (Fallback) */}
      <div className="pt-2">
        <label className="text-[11px] font-bold text-slate-400 block mb-1">
          إدخال يدوي (رابط خرائط جوجل أو الإحداثيات):
        </label>
        <input
          type="text"
          placeholder="مثال: https://maps.app.goo.gl/... أو 32.2858, 45.9818"
          onChange={(e) => {
            const val = e.target.value.trim();
            if (val.length > 5) {
              setHasSelected(true);
              setLocationName('موقع تم إدخاله يدوياً');
              onChange(val, 'موقع تم إدخاله يدوياً');
            } else {
              setHasSelected(false);
              onChange('');
            }
          }}
          className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500 transition-colors font-mono dir-ltr"
        />
      </div>
    </div>
  );
};
