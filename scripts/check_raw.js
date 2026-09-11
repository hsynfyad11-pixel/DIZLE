const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRaw() {
  try {
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;
    console.log('Tables:', tables);

    for (const table of tables) {
      if (!table.name.startsWith('sqlite_') && !table.name.startsWith('_')) {
         const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM "${table.name}"`);
         console.log(`Table ${table.name} has ${Number(count[0].c)} rows`);
         if (Number(count[0].c) > 0) {
            const rows = await prisma.$queryRawUnsafe(`SELECT * FROM "${table.name}" LIMIT 5`);
            console.log(`Preview ${table.name}:`, rows);
         }
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
checkRaw();
