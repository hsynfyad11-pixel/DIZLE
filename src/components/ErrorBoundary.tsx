'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 border border-purple-500/40 rounded-3xl text-right max-w-lg mx-auto my-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <h2 className="font-extrabold text-base text-slate-100">تم التقاط تنبيه في الواجهة (Diagnostic Safety)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {this.state.error?.message || 'حدث خطأ غير متوقع في رندر إحدى المكونات، تم التقاطه بأمان دون إيقاف التطبيق.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة تحميل الصفحة</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
