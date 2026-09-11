import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShopCatalogView } from '@/components/ShopCatalogView';

interface ShopPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0; // Dynamic server fetching

export default async function ShopPage({ params }: ShopPageProps) {
  // Explicitly fetch shop with products to prevent empty screens
  const shop = await prisma.shop.findUnique({
    where: { id: params.id },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!shop) {
    notFound();
  }



  return <ShopCatalogView shop={shop} />;
}
