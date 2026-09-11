const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const phone = '07837555605';
  const password = 'fbhmas1997';

  // Check if admin exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { phone }
  });

  if (existingAdmin) {
    console.log('Admin already exists. Updating password...');
    await prisma.admin.update({
      where: { phone },
      data: { password }
    });
    console.log('Admin password updated successfully.');
  } else {
    console.log('Creating new admin...');
    await prisma.admin.create({
      data: {
        phone,
        password
      }
    });
    console.log('Admin created successfully.');
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
