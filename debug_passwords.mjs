import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const admins = await prisma.admin.findMany();
  console.log('Admins:', admins);
  
  const shops = await prisma.shop.findMany();
  console.log('Shops:', shops.map(s => ({
    id: s.id,
    name: s.nameAr,
    phone: s.phone,
    password: s.password
  })));
  
  const drivers = await prisma.driver.findMany();
  console.log('Drivers:', drivers.map(d => ({
    id: d.id,
    name: d.name,
    phone: d.phone,
    pinCode: d.pinCode
  })));
  
  await prisma.$disconnect();
}

check();
