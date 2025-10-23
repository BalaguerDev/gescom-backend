import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getClients = async () => {
  const clients = await prisma.client.findMany({
    include: { orders: true },
  });

  const clientsSorted = clients.map(client => {
    const totalCurrent = client.revenueCurrentYear.reduce((a, b) => a + b.total, 0);
    const totalLast = client.revenueLastYear.reduce((a, b) => a + b.total, 0);

    const familias = ['maquinas', 'accesorios', 'herramienta'];
    const familiasCurrent = {};
    const familiasLast = {};

    familias.forEach(f => {
      familiasCurrent[f] = client.revenueCurrentYear
        .reduce((sum, m) => sum + (m.families?.[f] || 0), 0);
      familiasLast[f] = client.revenueLastYear
        .reduce((sum, m) => sum + (m.families?.[f] || 0), 0);
    });

    const growth = totalLast
      ? ((totalCurrent - totalLast) / totalLast) * 100
      : 0;

    return {
      ...client,
      totalCurrent,
      totalLast,
      growth,
      familias: {
        current: familiasCurrent,
        last: familiasLast,
      },
    };
  })
  .sort((a, b) => b.totalCurrent - a.totalCurrent);

  return clientsSorted;
};
