import { PrismaClient } from '@prisma/client';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../src/lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL database with PLAKATKU catalog...');

  // Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { productCount, ...catData } = cat;
    await prisma.category.upsert({
      where: { id: cat.id },
      update: catData,
      create: catData,
    });
  }
  console.log(`Seeded ${INITIAL_CATEGORIES.length} categories.`);

  // Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category, ...prodData } = prod;
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        ...prodData,
        specs: prodData.specs as any,
      },
      create: {
        ...prodData,
        specs: prodData.specs as any,
      },
    });
  }
  console.log(`Seeded ${INITIAL_PRODUCTS.length} products.`);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
