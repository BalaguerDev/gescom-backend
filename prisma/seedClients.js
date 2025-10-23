import { PrismaClient } from '@prisma/client';
import { fakerES as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Eliminando clientes antiguos...');
  await prisma.order.deleteMany();
  await prisma.client.deleteMany();

  const familias = ['maquinas', 'accesorios', 'herramienta'];
  const provinciasCatalanas = ['Barcelona', 'Girona', 'Lleida', 'Tarragona'];

  console.log('🚀 Creando 57 nuevos clientes catalanes...');
  for (let i = 0; i < 57; i++) {
    const provincia = faker.helpers.arrayElement(provinciasCatalanas);
    const ciudad = faker.location.city();
    const direccion = faker.location.streetAddress();

    // Ingresos mes a mes
    const revenueLastYear = Array.from({ length: 12 }, (_, monthIndex) => {
      const families = familias.reduce((acc, f) => {
        acc[f] = faker.number.int({ min: 200, max: 3000 });
        return acc;
      }, {});
      return {
        month: monthIndex + 1,
        total: Object.values(families).reduce((a, b) => a + b, 0),
        families,
      };
    });

    const revenueCurrentYear = Array.from({ length: 12 }, (_, monthIndex) => {
      const families = familias.reduce((acc, f) => {
        acc[f] = faker.number.int({ min: 200, max: 3500 });
        return acc;
      }, {});
      return {
        month: monthIndex + 1,
        total: Object.values(families).reduce((a, b) => a + b, 0),
        families,
      };
    });

    const client = await prisma.client.create({
      data: {
        name: faker.company.name(),
        cif: faker.string.alphanumeric(9).toUpperCase(),
        phone: faker.phone.number('9########'),
        email: faker.internet.email(),
        address: `${direccion}, ${ciudad}, ${provincia}`,
        category: faker.helpers.arrayElement(['VIP', 'Regular', 'Potencial']),
        notes: faker.lorem.sentence(),
        revenueLastYear,
        revenueCurrentYear,
      },
    });

    // Pedidos
    const numOrders = faker.number.int({ min: 2, max: 6 });
    for (let j = 0; j < numOrders; j++) {
      // Crear pedido
      const order = await prisma.order.create({
        data: {
          clientId: client.id,
          orderNumber: `ORD-${faker.string.numeric(5)}`,
          productName: faker.commerce.productName(),
          references: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
            faker.string.alphanumeric(6).toUpperCase()
          ),
          units: faker.number.int({ min: 1, max: 20 }),
          price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
          date: faker.date.between({ from: '2024-01-01', to: '2025-10-01' }),
        },
      });

      // Crear entre 2 y 5 artículos asociados a ese pedido
      const numItems = faker.number.int({ min: 2, max: 5 });
      for (let k = 0; k < numItems; k++) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            ref: faker.string.alphanumeric(6).toUpperCase(),
            nombre: faker.commerce.productName(),
            cantidad: faker.number.int({ min: 1, max: 10 }),
            precio: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
          },
        });
      }
    }
  }

  console.log('✅ 57 clientes catalanes generados correctamente con ingresos por familia y pedidos.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
