import { PrismaClient } from "@prisma/client";
import { fakerES as faker } from "@faker-js/faker";
import { generarClienteData, generarPedidoData } from "../src/utils/helpers.js";
import { empresas } from "../src/db/clientes.js";

const prisma = new PrismaClient();

async function seedClientes() {
  console.log("🧹 Eliminando datos antiguos...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.client.deleteMany();

  const totalClientes = empresas.length;
  const porcentajeInactivos = faker.number.int({ min: 10, max: 15 });
  const numInactivos = Math.floor((totalClientes * porcentajeInactivos) / 100);

  console.log(
    `🚀 Generando ${totalClientes} clientes (${numInactivos} serán inactivos)`
  );

  // seleccionar aleatoriamente qué clientes serán inactivos
  const indicesInactivos = new Set();
  while (indicesInactivos.size < numInactivos) {
    indicesInactivos.add(faker.number.int({ min: 0, max: totalClientes - 1 }));
  }

  for (let i = 0; i < totalClientes; i++) {
    const empresa = empresas[i];
    const esInactivo = indicesInactivos.has(i);

    const client = await prisma.client.create({
      data: generarClienteData(empresa),
    });

    // generar entre 0 y 4 pedidos (siempre al menos 1 si activo)
    const numPedidos = esInactivo
      ? faker.number.int({ min: 0, max: 2 }) // pocos o ninguno
      : faker.number.int({ min: 1, max: 5 });

    for (let j = 0; j < numPedidos; j++) {
      await prisma.order.create({
        data: generarPedidoData(client.id, esInactivo),
      });
    }

    if (esInactivo)
      console.log(`🕓 Cliente INACTIVO (${client.name}) sin pedidos recientes`);
  }

  console.log("✅ Clientes, pedidos y artículos generados correctamente.");
}

seedClientes()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
