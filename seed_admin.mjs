import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPhone = '07837555605';
  const adminPassword = 'fbhmas1997';

  try {
    const admin = await prisma.admin.upsert({
      where: { phone: adminPhone },
      update: { password: adminPassword },
      create: {
        phone: adminPhone,
        password: adminPassword,
      },
    });
    console.log('Admin seeded successfully:', admin);
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
