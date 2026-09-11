import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FloatingCart } from '@/components/FloatingCart';
import { ClearCartModal } from '@/components/ClearCartModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'دزلي DIZLY - منصة التوصيل السريع المحلي',
  description: 'تطبيق التوصيل الفائق والطلبات المحلية في العراق - اطلب من المتاجر المحلية وتوصلك بأسرع وقت',
  keywords: ['ديزلي', 'DIZLY', 'توصيل بغداد', 'تطبيق توصيل', 'العراق'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-arabic antialiased selection:bg-dazly-500 selection:text-white pb-24">
        <Header />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
        <FloatingCart />
        <ClearCartModal />
      </body>
    </html>
  );
}
