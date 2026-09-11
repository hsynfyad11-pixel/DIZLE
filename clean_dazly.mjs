import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  await prisma.shop.deleteMany({
    where: { category: 'DAZLY_MART' }
  });
  console.log('Deleted Dazly Mart shops.');
}

clean().finally(() => prisma.$disconnect());
