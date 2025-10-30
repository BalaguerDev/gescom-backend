// prisma/seed.js
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function updateClientCoordinates() {
  console.log("\n🗺️  Actualizando coordenadas de clientes...");

  const clients = await prisma.client.findMany({
    select: { id: true, name: true, address: true, lat: true, lng: true },
  });

  for (const client of clients) {
    if (!client.lat || !client.lng) {
      const coords = await getCoordinatesFromAddress(client.address);
      if (coords) {
        await prisma.client.update({
          where: { id: client.id },
          data: { lat: coords.lat, lng: coords.lng },
        });
        console.log(`📍 Coordenadas añadidas a ${client.name}:`, coords);
      } else {
        console.warn(`⚠️ No se encontraron coordenadas para ${client.name}`);
      }
    }
  }

  console.log("✅ Coordenadas actualizadas correctamente.");
}

async function getCoordinatesFromAddress(address) {
  if (!address) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.warn("❌ Google Maps no devolvió resultados:", data.status);
      return null;
    }
  } catch (error) {
    console.error("❌ Error obteniendo coordenadas:", error);
    return null;
  }
}

async function main() {
  console.log("🌱 Iniciando seed completo...");

  console.log("🧹 Limpiando base de datos...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Ejecutando seed de usuarios...");
  execSync("node prisma/seedUsers.js", { stdio: "inherit" });

  console.log("🏢 Ejecutando seed de clientes...");
  execSync("node prisma/seedClients.js", { stdio: "inherit" });

  console.log("🌍 Generando coordenadas...");
  await updateClientCoordinates();

  console.log("\n✅ Seed completo terminado con éxito.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error en seed.js:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
