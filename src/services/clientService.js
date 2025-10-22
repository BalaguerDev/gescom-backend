import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getClients = async () => {
  // Traemos todos los clientes con sus pedidos
  const clients = await prisma.client.findMany({
    include: { orders: true },
  });

  // Calculamos total de revenueCurrentYear y ordenamos
  const clientsSorted = clients
    .map(client => {
      const totalCurrent = Array.isArray(client.revenueCurrentYear)
        ? client.revenueCurrentYear.reduce((a, b) => a + b, 0)
        : 0;
      return { ...client, totalCurrent };
    })
    .sort((a, b) => b.totalCurrent - a.totalCurrent); // mayor a menor

  return clientsSorted;
};
