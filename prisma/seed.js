const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dazly database with Featured & Standard shops with Logos...');

  // Clean existing database records
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.driver.deleteMany();

  // 1. Featured Shop 1: Zarzour Restaurant
  await prisma.shop.create({
    data: {
      name: 'Zarzour Restaurant',
      nameAr: 'مطعم زرزور المشويات',
      description: 'أشهى المشويات العراقية، الصاج والشاورما الفاخرة',
      category: 'STANDARD',
      deliveryFee: 1500,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      products: {
        create: [
          {
            name: 'Mixed Grill Kebab Plate',
            nameAr: 'ماعون كباب مشكل عراقي',
            category: 'المأكولات والمشويات 🍖',
            description: '3 شيش كباب لحم غنم مع خضار مشوية وخبر حار',
            price: 14000,
            imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Chicken Shawarma Sandwich',
            nameAr: 'لفة شاورما دجاج صاج كبير',
            category: 'المأكولات والمشويات 🍖',
            description: 'مع الثومية والبطاطس المقرمشة والمخلل',
            price: 3500,
            imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Farrouj Chicken',
            nameAr: 'فروج مشوي على الفحم كامل',
            category: 'المأكولات والمشويات 🍖',
            description: 'يقدم مع السلاطات والمقبلات والخبز',
            price: 13000,
            imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
    },
  });

  // 2. Featured Shop 2: Haj Zabala Juices & Sweets
  await prisma.shop.create({
    data: {
      name: 'Haj Zabala Juices',
      nameAr: 'عصير الحاج زبالة والحلويات',
      description: 'شربت زبيب وتمر هندي عراقي أصيل وعصائر طازجة وبقلاوة',
      category: 'STANDARD',
      deliveryFee: 1500,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      products: {
        create: [
          {
            name: 'Raisin Juice 1L',
            nameAr: 'بطل شربت زبيب أصلي 1 لتر',
            category: 'العصائر والحلويات 🥤',
            description: 'عصير زبيب زبالة الطبيعي الشهير',
            price: 3000,
            imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Tamarind Juice 1L',
            nameAr: 'بطل تمر هندي طبيعي 1 لتر',
            category: 'العصائر والحلويات 🥤',
            description: 'عصير تمر هندي بارد ومستخلص طازج',
            price: 2500,
            imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Baklava Plate',
            nameAr: 'صحن بقلاوة مشكلة بالبقسماط',
            category: 'العصائر والحلويات 🥤',
            description: 'بقلاوة عراقية مقرمشة بالسمن الحيواني',
            price: 8000,
            imageUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
    },
  });

  // 3. Featured Shop 3: Dazly Golden Supermarket & Hypermarket (SUPERMARKET)
  await prisma.shop.create({
    data: {
      name: 'Dazly Golden Supermarket',
      nameAr: 'سوبرماركت وهايبرماركت دزلي الشامل 🛒',
      description: 'قسم الألبان، الخضار، المشروبات، المواد الغذائية والمنظفات بأسعار الجملة',
      category: 'SUPERMARKET',
      deliveryFee: 1500,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      products: {
        create: [
          // Department 1: الأجبان والألبان 🧀
          {
            name: 'Fresh Erbil Yoghurt 1kg',
            nameAr: 'لبن أربيل طازج ممتاز 1 كغم',
            category: 'الأجبان والألبان 🧀',
            description: 'لبن خاثر كامل الدسم طازج يومياً',
            price: 2500,
            imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Iraqi Arab Cheese 500g',
            nameAr: 'جبن عرب عراقي طازج 500 غرام',
            category: 'الأجبان والألبان 🧀',
            description: 'جبن غنم طازج قليل الملح',
            price: 4500,
            imageUrl: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Iraqi Geymar 250g',
            nameAr: 'قيمر سدة الهندية الفاخر 250 غرام',
            category: 'الأجبان والألبان 🧀',
            description: 'قشطة قيمر طبيعية 100%',
            price: 5000,
            imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
          },
          // Department 2: المشروبات والمياه 🥤
          {
            name: 'Pure Water Carton 12x500ml',
            nameAr: 'كرتون مياه نقية معدنية 12 حبة',
            category: 'المشروبات والمياه 🥤',
            description: 'مياه شرب نقية مبردة',
            price: 3000,
            imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Fresh Orange Juice 1L',
            nameAr: 'عصير برتقال طازج طبيعي 1 لتر',
            category: 'المشروبات والمياه 🥤',
            description: 'بدون إضافة سكر أو مواد حافظة',
            price: 3500,
            imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Pepsi Can Pack 6x330ml',
            nameAr: 'مجموعة بيبسي صفيح 6 حبات',
            category: 'المشروبات والمياه 🥤',
            description: 'مشروب غازي منعش مبرد',
            price: 3000,
            imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
          },
          // Department 3: الخضروات والفواكه 🍎
          {
            name: 'Bananas Ecuador 1kg',
            nameAr: 'موز إكوادوري درجة أولى 1 كغم',
            category: 'الخضروات والفواكه 🍎',
            description: 'موز طازج حلو المذاق',
            price: 2000,
            imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Red Apples 1kg',
            nameAr: 'تفاح أحمر سكري طازج 1 كغم',
            category: 'الخضروات والفواكه 🍎',
            description: 'تفاح مقرمش عالي الجودة',
            price: 2500,
            imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Fresh Local Tomatoes 1kg',
            nameAr: 'طماطم حمراء زراعية 1 كغم',
            category: 'الخضروات والفواكه 🍎',
            description: 'طازجة من المزرعة للسلة',
            price: 1500,
            imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
          },
          // Department 4: المواد الغذائية الجافة 🌾
          {
            name: 'Anbar Rice Bag 5kg',
            nameAr: 'رز عنبر عراقي ممتاز كيس 5 كغم',
            category: 'المواد الغذائية الجافة 🌾',
            description: 'أرز عالي النكهة والرائحة الزكية',
            price: 16000,
            imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Pure Sunflower Oil 1L',
            nameAr: 'زيت عباد الشمس النقي 1 لتر',
            category: 'المواد الغذائية الجافة 🌾',
            description: 'زيت طعام ممتاز للقلي والطبخ',
            price: 2750,
            imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
          },
          // Department 5: المجمدات واللحوم 🥩
          {
            name: 'Whole Frozen Chicken 1.1kg',
            nameAr: 'دجاج كامل مجمد دزلي 1.1 كغم',
            category: 'المجمدات واللحوم 🥩',
            description: 'مذبوح حسب الشريعة الإسلامية',
            price: 4500,
            imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Beef Burger 8 Pieces',
            nameAr: 'برغر لحم بقر فاخر 8 أقراص',
            category: 'المجمدات واللحوم 🥩',
            description: 'جاهز للشوي والتنظيف',
            price: 5500,
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
          },
          // Department 6: المنظفات والعناية 🧼
          {
            name: 'Washing Powder 3kg',
            nameAr: 'مسحوق غسيل أوتوماتيك 3 كغم',
            category: 'المنظفات والعناية 🧼',
            description: 'نظافة فائقة ورائحة زكية يدوم طويلاً',
            price: 7500,
            imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Kalleh Milk 1L',
            nameAr: 'حليب كاله كامل الدسم 1 لتر',
            category: 'الأجبان والألبان 🧀',
            description: 'حليب طبيعي طازج ومعقم',
            price: 1500,
            imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Local Eggs 30 Pack',
            nameAr: 'طبقة بيض مائدة محلي (30 بيضة)',
            category: 'الأجبان والألبان 🧀',
            description: 'بيض مائدة طازج وعالي الجودة',
            price: 6500,
            imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Basmati Rice 5kg',
            nameAr: 'رائحة الهند رز بسمتي 5 كغم',
            category: 'المواد الغذائية الجافة 🌾',
            description: 'رز عنبر ممتاز عالي الجودة',
            price: 12500,
            imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
    },
  });

  // 4. Other Shop 1: Mosul Bakery (Standard)
  await prisma.shop.create({
    data: {
      name: 'Mosul Bakery',
      nameAr: 'مخبز وفرن الموصل',
      description: 'صمون حجري عراقي، كعك وسوفليه طازج يومياً',
      category: 'STANDARD',
      deliveryFee: 1500,
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: false,
      products: {
        create: [
          {
            name: 'Samoon 10 Pack',
            nameAr: 'ربطة صمون حجري طازج (10 قطع)',
            category: 'المخبوزات 🥐',
            description: 'صمون حار ومحمص من الفرن مباشرة',
            price: 1000,
            imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Iraq Tea Biscuits',
            nameAr: 'كعك شاي عراقي بالسمسم 1 كغم',
            category: 'المخبوزات 🥐',
            description: 'مقرمش وهش مثالي مع شاي الاستكان',
            price: 4000,
            imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
    },
  });

  // 5. Other Shop 2: Karrada Roastery (Standard)
  await prisma.shop.create({
    data: {
      name: 'Karrada Roastery',
      nameAr: 'محمصة الكرادة الفاخرة',
      description: 'مكسرات مشكلة طازجة، قهوة هيل وشوكولاتة مستوردة',
      category: 'STANDARD',
      deliveryFee: 1500,
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: false,
      products: {
        create: [
          {
            name: 'Mixed Nuts 500g',
            nameAr: 'مكسرات فاخرة مشكلة 500 غرام',
            category: 'المكسرات والتسالي 🥜',
            description: 'فستق حلبي، كاجو، ومحمضات طازجة',
            price: 9000,
            imageUrl: 'https://images.unsplash.com/photo-1536591375315-1988d6960926?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Cardamom Coffee 250g',
            nameAr: 'قهوة عربية بالهيل 250 غرام',
            category: 'المشروبات والقهوة ☕',
            description: 'بن محمص ومطحون طازج مع الهيل الأخضر',
            price: 5000,
            imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
    },
  });

  // 6. Other Shop 3: Baghdad Fresh Fruit (Standard)
  await prisma.shop.create({
    data: {
      name: 'Baghdad Fresh Fruit',
      nameAr: 'فواكه وخضروات بغداد',
      description: 'فواكه طازجة وخضار يومية من الحقل للمنزل مباشرة',
      category: 'STANDARD',
      deliveryFee: 1500,
      rating: 4.4,
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: false,
      products: {
        create: [
          {
            name: 'Bananas 1kg',
            nameAr: 'موز إكوادوري درجة أولى 1 كغم',
            category: 'الخضروات والفواكه 🍎',
            description: 'طازج وحلو المذاق',
            price: 2500,
            imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
          },
          {
            name: 'Apples 1kg',
            nameAr: 'تفاح أحمر فاخر 1 كغم',
            category: 'الخضروات والفواكه 🍎',
            description: 'تفاح سكري طازج',
            price: 2000,
            imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
          },
        ],
      },
    },
  });

  // 7. Create Sample Drivers with Financial Debt Tracking
  await prisma.driver.create({
    data: {
      name: 'أحمد الساعدي',
      phone: '07701234567',
      pinCode: '123456',
      vehicle: 'تكتك توصيل دزلي السريع',
      currentDebt: 15500,
      maxCreditLimit: 50000,
      isAvailable: true,
    },
  });

  await prisma.driver.create({
    data: {
      name: 'علي العبيدي',
      phone: '07709876543',
      pinCode: '123456',
      vehicle: 'دراجة شحن سريعة',
      currentDebt: 55000, // Exceeds limit to demonstrate blocked status
      maxCreditLimit: 50000,
      isAvailable: true,
    },
  });

  console.log('✅ Seeding completed with shop logos & product images!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
