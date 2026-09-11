import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dazly database...');

  // Clean existing database records
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.driver.deleteMany();

  // 1. Create Dazly Mart (سلة دزلي الشاملة - Free Delivery 0 IQD)
  const dazlyMart = await prisma.shop.create({
    data: {
      name: 'Dazly Mart',
      nameAr: 'سلة دزلي الشاملة 🛒',
      description: 'كافة المستلزمات والغذائيات اليومية بتوصيل مجاني فوري',
      category: 'DAZLY_MART',
      deliveryFee: 0, // Free Delivery
      rating: 4.9,
      isAvailable: true,
      products: {
        create: [
          {
            name: 'Kalleh Milk 1L',
            nameAr: 'حليب كاله كامل الدسم 1 لتر',
            description: 'حليب طبيعي طازج ومعقم',
            price: 1500,
          },
          {
            name: 'Local Eggs 30 Pack',
            nameAr: 'طبقة بيض مائدة محلي (30 بيضة)',
            description: 'بيض مائدة طازج وعالي الجودة',
            price: 6500,
          },
          {
            name: 'Basmati Rice 5kg',
            nameAr: 'رائحة الهند رز بسمتي 5 كغم',
            description: 'رز عنبر ممتاز عالي الجودة',
            price: 12500,
          },
          {
            name: 'Lipton Tea 100 Bags',
            nameAr: 'شاي ليبتون علبة 100 كيس',
            description: 'شاي أحمر فاخر ومصفي',
            price: 4500,
          },
          {
            name: 'Mineral Water 12x500ml',
            nameAr: 'كرتون ماء نقي 12 قنينة (500 مل)',
            description: 'مياه شرب نقية ومفلترة',
            price: 2500,
          },
        ],
      },
    },
  });

  // 2. Create Standard Shop 1: Zarzour Restaurant (Fixed 1500 IQD)
  const zarzour = await prisma.shop.create({
    data: {
      name: 'Zarzour Restaurant',
      nameAr: 'مطعم زرزور المشويات',
      description: 'أشهى المشويات العراقية، الصاج والشاورما الفاخرة',
      category: 'STANDARD',
      deliveryFee: 1500, // 1500 IQD
      rating: 4.8,
      isAvailable: true,
      products: {
        create: [
          {
            name: 'Mixed Grill Kebab Plate',
            nameAr: 'ماعون كباب مشكل عراقي',
            description: '3 شيش كباب لحم غنم مع خضار مشوية وخبر حار',
            price: 14000,
          },
          {
            name: 'Chicken Shawarma Sandwich',
            nameAr: 'لفة شاورما دجاج صاج كبير',
            description: 'مع الثومية والبطاطس المقرمشة والمخلل',
            price: 3500,
          },
          {
            name: 'Farrouj Chicken',
            nameAr: 'فروج مشوي على الفحم كامل',
            description: 'يقدم مع السلاطات والمقبلات والخبز',
            price: 13000,
          },
        ],
      },
    },
  });

  // 3. Create Standard Shop 2: Haj Zabala Juices (Fixed 1500 IQD)
  const zabala = await prisma.shop.create({
    data: {
      name: 'Haj Zabala Juices',
      nameAr: 'عصير الحاج زبالة الشهير',
      description: 'شربت زبيب وتمر هندي عراقي أصيل وعصائر طازجة',
      category: 'STANDARD',
      deliveryFee: 1500, // 1500 IQD
      rating: 4.9,
      isAvailable: true,
      products: {
        create: [
          {
            name: 'Raisin Juice 1L',
            nameAr: 'بطل شربت زبيب أصل 1 لتر',
            description: 'عصير زبيب زبالة الطبيعي الشهير',
            price: 3000,
          },
          {
            name: 'Tamarind Juice 1L',
            nameAr: 'بطل تمر هندي طبيعي 1 لتر',
            description: 'عصير تمر هندي بارد ومستخلص طازج',
            price: 2500,
          },
          {
            name: 'Baklava Plate',
            nameAr: 'صحن بقلاوة مشكلة بالبقسماط',
            description: 'بقلاوة عراقية مقرمشة بالسمن الحيواني',
            price: 8000,
          },
        ],
      },
    },
  });

  // 4. Create Sample Driver
  await prisma.driver.create({
    data: {
      name: 'أحمد الساعدي',
      phone: '07701234567',
      vehicle: 'تكتك توصيل دزلي السريع',
      isAvailable: true,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
