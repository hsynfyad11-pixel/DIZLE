const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shopCount = await prisma.shop.count();
  if (shopCount === 0) {
    const shop1 = await prisma.shop.create({
      data: {
        name: 'baraka-supermarket',
        nameAr: 'سوبرماركت البركة',
        phone: '07700000001',
        description: 'تسوق أفضل المنتجات والمواد الغذائية الطازجة',
        category: 'SUPERMARKET',
        deliveryFee: 1500,
        minOrderAmount: 2000,
        areaName: 'حي الجامعة',
        products: {
          create: [
            {
              name: 'Pepsi Family',
              nameAr: 'بيبسي حجم عائلي 2.25 لتر',
              category: 'الغذائيات والمشروبات 🌾',
              price: 1500,
              description: 'مشروب غازي منعش وحجم توفيري',
            },
            {
              name: 'Lays Chips',
              nameAr: 'شيبس ليز بالفلفل الحار',
              category: 'المسليات والشبسات',
              price: 1250,
              description: 'شيبس ليز العائلي وزن كبير',
            },
            {
              name: 'Bread',
              nameAr: 'صمون عراقي سمسم (10 قطع)',
              category: 'مخبوزات ساخنة',
              price: 1500,
              description: 'صمون عراقي طازج يخبز يومياً',
            },
            {
              name: 'Oud Perfume',
              nameAr: 'معطر جو برائحة العود',
              category: 'المنظفات والعناية 🧼',
              price: 2500,
              description: 'معطر غرف ورائحة فخمة للصالون',
            }
          ]
        }
      }
    });
    
    console.log('✅ Created Demo Store: سوبرماركت البركة (with 4 products)');

    const shop2 = await prisma.shop.create({
      data: {
        name: 'happiness-restaurant',
        nameAr: 'مطعم ومشويات السعادة',
        phone: '07700000002',
        description: 'أطيب المشويات والوجبات السريعة على الفحم',
        category: 'المأكولات والمشويات 🍖',
        deliveryFee: 2000,
        minOrderAmount: 5000,
        areaName: 'المنصور',
        products: {
          create: [
            {
              name: 'Kebab',
              nameAr: 'نفر كباب لحم عراقي',
              category: 'مشويات 🍖',
              price: 12000,
              description: '3 أسياخ كباب، تقدم مع السلطات والخبز الحار',
            },
            {
              name: 'Shawarma',
              nameAr: 'لفة شاورما دجاج (صاج)',
              category: 'وجبات سريعة 🍔',
              price: 3500,
              description: 'شاورما على الفحم مع صوص الثوم والبطاطا',
            }
          ]
        }
      }
    });

    console.log('✅ Created Demo Store: مطعم ومشويات السعادة (with 2 products)');

    const driverCount = await prisma.driver.count();
    if (driverCount === 0) {
      await prisma.driver.create({
          data: {
              name: "مندوب سريع 1",
              phone: "07800000000",
              pinCode: "123456",
              vehicle: "دراجة نارية",
              maxCreditLimit: 50000
          }
      });
      console.log('✅ Created Demo Driver (07800000000 / 123456)');
    }
    
  } else {
    console.log('⚠️ Database already has shops. Skipping seed to prevent duplicates.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
