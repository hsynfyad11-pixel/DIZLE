const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
  const admins = await prisma.admin.findMany();
  console.log('Admins:', admins);
  
  const shops = await prisma.shop.findMany();
  console.log('Shops:', shops);
  
  const drivers = await prisma.driver.findMany();
  console.log('Drivers:', drivers);
  
  const orders = await prisma.order.findMany();
  console.log('Orders:', orders);
  
  const joins = await prisma.joinRequest.findMany();
  console.log('JoinRequests:', joins);
  
  await prisma.$disconnect();
}
checkDB();
