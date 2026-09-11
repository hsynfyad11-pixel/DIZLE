import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing shops...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.shop.deleteMany({});
  await prisma.shop.deleteMany({});

  console.log('Creating Test Shop...');
  const shop = await prisma.shop.create({
    data: {
      name: 'Test Store',
      nameAr: 'متجر التجربة',
      phone: '07837555605',
      description: 'متجر تجريبي لاختبار نظام الطلبات والإشعارات.',
      category: 'STANDARD',
      deliveryFee: 1500,
      minOrderAmount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      areaName: 'مركز المدينة',
      isAvailable: true,
      products: {
        create: [
          {
            nameAr: 'برجر لحم دبل مقرمش',
            category: 'المأكولات والمشويات 🍖',
            price: 6500,
            description: 'برجر لحم بقري مدخن مع جبن وشريحة مقرمشة.',
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            isAvailable: true
          },
          {
            nameAr: 'بيتزا مارغريتا إيطالية',
            category: 'المأكولات والمشويات 🍖',
            price: 9000,
            description: 'صلصة طماطم مع جبن موزاريلا طازج وريحان.',
            imageUrl: 'https://images.unsplash.com/photo-1604381538308-412499d21ce8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            isAvailable: true
          },
          {
            nameAr: 'بيبسي بارد (علبة معدنية)',
            category: 'المشروبات والمياه 🥤',
            price: 750,
            description: 'مشروب غازي منعش 330 مل.',
            imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            isAvailable: true
          },
          {
            nameAr: 'أصابع بطاطا مقلية (كبير)',
            category: 'المستلزمات العامة 📦',
            price: 2500,
            description: 'بطاطا مقرمشة مغطاة بالبهارات الخاصة.',
            imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            isAvailable: true
          }
        ]
      }
    }
  });

  // Link shop telegram to the fallback admin chat
  // So that notifyStoreOwner works with it properly if they somehow bypass the fallback
  // Oh wait, skipping this since I added the fallback Admin logic directly.

  console.log('✅ Created Test Shop:', shop.nameAr, 'with phone:', shop.phone);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
