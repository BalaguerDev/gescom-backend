import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // Carga las variables del .env

const prisma = new PrismaClient();
const LOCATIONIQ_KEY = process.env.LOCATIONIQ_KEY;

if (!LOCATIONIQ_KEY) {
  console.error("❌ No se encontró LOCATIONIQ_KEY en el archivo .env");
  process.exit(1);
}

async function geocodeAddress(address) {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://eu1.locationiq.com/v1/search?key=${LOCATIONIQ_KEY}&q=${encodedAddress}&format=json&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`❌ Error al geocodificar ${address}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      return { lat, lng };
    } else {
      console.warn(`⚠️ No se encontraron coordenadas para: ${address}`);
      return null;
    }
  } catch (err) {
    console.error(`❌ Error de red al geocodificar ${address}:`, err);
    return null;
  }
}

async function updateClientCoords() {
  const clients = await prisma.client.findMany({
    where: { lat: null, lng: null },
  });

  console.log(`📍 Clientes sin coordenadas: ${clients.length}`);

  for (const client of clients) {
    console.log(`🧭 Geocodificando: ${client.name} (${client.address})`);

    const coords = await geocodeAddress(client.address);

    if (coords) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          lat: coords.lat,
          lng: coords.lng,
        },
      });
      console.log(`✅ ${client.name}: (${coords.lat}, ${coords.lng})`);
    } else {
      console.log(`🚫 No se pudo actualizar: ${client.name}`);
    }

    // Esperar 1 segundo entre peticiones (LocationIQ limita a 2 req/seg)
    await new Promise((res) => setTimeout(res, 1000));
  }

  console.log("🎉 Proceso completado");
  await prisma.$disconnect();
}

updateClientCoords().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
