import { PrismaClient } from '@prisma/client';
import { fakerES as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Crear 25 clientes de prueba
  for (let i = 0; i < 25; i++) {
    const client = await prisma.client.create({
      data: {
        name: faker.company.name(),
        cif: faker.string.alphanumeric(9),
        phone: faker.phone.number('#########'),
        email: faker.internet.email(),
        address: faker.location.streetAddress(),
        category: faker.helpers.arrayElement(['VIP', 'Regular', 'Potencial']),
        notes: faker.lorem.sentence(),
        revenueLastYear: Array.from({ length: 12 }, () => faker.number.int({ min: 500, max: 5000 })),
        revenueCurrentYear: Array.from({ length: 12 }, () => faker.number.int({ min: 500, max: 5000 })),
      },
    });

    // Crear pedidos
    const numOrders = faker.number.int({ min: 1, max: 5 });
    for (let j = 0; j < numOrders; j++) {
      await prisma.order.create({
        data: {
          clientId: client.id,
          orderNumber: `ORD-${faker.string.numeric(5)}`,
          productName: faker.commerce.productName(),
          references: [faker.string.alphanumeric(6)],
          units: faker.number.int({ min: 1, max: 20 }),
          price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
          date: faker.date.recent({ days: 90 }),
        },
      });
    }
  }

  console.log('✅ 25 clientes generados con pedidos');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
