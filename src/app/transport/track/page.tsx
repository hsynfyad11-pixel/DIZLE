'use client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const [reqData, setReqData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      router.replace('/transport');
      return;
    }
  }, [id, router]);

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div>{/* بيانات التتبع الخاصة بك */}</div>
      )}
    </div>
  );
}

export default function TransportTrackPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <TrackContent />
    </Suspense>
  );
}