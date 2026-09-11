import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = ["المشروبات", "الوجبات الخفيفة", "المعلبات", "المنظفات", "العناية الشخصية", "الألبان والأجبان", "المخبوزات"];
const brands = ["شركة الواحة", "نستله", "الربيع", "بيبسي", "كوكا كولا", "ليدر", "تايد", "اريال", "المراعي", "كيري", "لوزين"];
const types = ["عصير", "شيبس", "بسكويت", "معجون طماطم", "صابون", "شامبو", "مشروب غازي", "حليب", "لبن", "جبنة", "كرواسون"];
const sizes = ["صغير", "وسط", "كبير", "عائلي", "٥٠٠ مل", "١ لتر", "١ كجم", "٢٥٠ غرام"];

const brandsEn = ["Al Waha", "Nestle", "Al Rabie", "Pepsi", "Coca Cola", "Leader", "Tide", "Ariel", "Almarai", "Kiri", "Lusine"];
const typesEn = ["Juice", "Chips", "Biscuit", "Tomato Paste", "Soap", "Shampoo", "Soda", "Milk", "Laban", "Cheese", "Croissant"];
const sizesEn = ["Small", "Medium", "Large", "Family", "500ml", "1L", "1kg", "250g"];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProduct(shopId, index) {
    const brandIdx = getRandomInt(0, brands.length - 1);
    const typeIdx = getRandomInt(0, types.length - 1);
    const sizeIdx = getRandomInt(0, sizes.length - 1);
    const category = categories[getRandomInt(0, categories.length - 1)];

    const nameAr = `${brands[brandIdx]} ${types[typeIdx]} ${sizes[sizeIdx]} #${index}`;
    const nameEn = `${brandsEn[brandIdx]} ${typesEn[typeIdx]} ${sizesEn[sizeIdx]} #${index}`;
    
    // prices between 500 and 20000 in steps of 250
    const price = getRandomInt(2, 80) * 250; 
    
    const imageUrl = `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/400/400`;

    return {
        shopId,
        name: nameEn,
        nameAr: nameAr,
        category,
        description: `وصف المنتج لـ ${nameAr} بجودة ممتازة. يصلح للاستخدام اليومي.`,
        price,
        imageUrl,
        isAvailable: Math.random() > 0.05 // 95% available
    };
}

async function main() {
    const shops = await prisma.shop.findMany();
    if (shops.length === 0) {
        console.log("No shops found in the database. Please create a shop first.");
        return;
    }

    const totalProducts = 550;
    const productsToCreate = [];

    for (let i = 0; i < totalProducts; i++) {
        const randomShop = shops[getRandomInt(0, shops.length - 1)];
        productsToCreate.push(generateProduct(randomShop.id, i + 1));
    }

    console.log(`Generating and inserting ${productsToCreate.length} products...`);
    
    const chunkSize = 50; // Smaller chunks for safety with SQLite
    for (let i = 0; i < productsToCreate.length; i += chunkSize) {
        const chunk = productsToCreate.slice(i, i + chunkSize);
        await prisma.product.createMany({
            data: chunk
        });
        console.log(`Inserted batch ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(productsToCreate.length / chunkSize)}`);
    }

    console.log("Successfully seeded 500+ products across existing shops.");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
