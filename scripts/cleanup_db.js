const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDB() {
  console.log('--- STARTING DATABASE CLEANUP FOR PRODUCTION ---');
  
  try {
    console.log('1. Deleting OrderItems...');
    await prisma.orderItem.deleteMany({});
    
    console.log('2. Deleting Orders...');
    await prisma.order.deleteMany({});
    
    console.log('3. Deleting Products...');
    await prisma.product.deleteMany({});
    
    console.log('4. Deleting Shops...');
    await prisma.shop.deleteMany({});
    
    console.log('5. Deleting Drivers...');
    await prisma.driver.deleteMany({});
    
    console.log('6. Deleting JoinRequests...');
    await prisma.joinRequest.deleteMany({});
    
    console.log('--- DATABASE CLEANUP COMPLETE ---');
    console.log('Admin accounts and System Settings were preserved.');
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

clearDB();
