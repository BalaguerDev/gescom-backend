// src/services/clientService.js
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// ----------------------------
// Obtener todos los clientes con pedidos y métricas
export const getClients = async () => {
  const clients = await prisma.client.findMany({
    include: {
      orders: { include: { items: true } },
    },
  });

  // 🔹 Actualizar coordenadas si no existen
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

  // 🔹 Calcular métricas y ordenar
  const clientsSorted = clients.map(client => {
    const totalCurrent = client.revenueCurrentYear?.reduce((a, b) => a + b.total, 0) || 0;
    const totalLast = client.revenueLastYear?.reduce((a, b) => a + b.total, 0) || 0;

    const familias = ["maquinas", "accesorios", "herramienta"];
    const familiasCurrent = {};
    const familiasLast = {};

    familias.forEach(f => {
      familiasCurrent[f] =
        client.revenueCurrentYear?.reduce((sum, m) => sum + (m.families?.[f] || 0), 0) || 0;
      familiasLast[f] =
        client.revenueLastYear?.reduce((sum, m) => sum + (m.families?.[f] || 0), 0) || 0;
    });

    const growth = totalLast ? ((totalCurrent - totalLast) / totalLast) * 100 : 0;

    const pedidosFormateados = client.orders.map(order => ({
      id: order.id,
      numero: order.orderNumber,
      date: order.date,
      referencias: order.items.map(i => i.ref),
      items: order.items.map(i => ({
        ref: i.ref,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precio: i.precio,
      })),
    }));

    return {
      ...client,
      totalCurrent,
      totalLast,
      growth,
      familias: {
        current: familiasCurrent,
        last: familiasLast,
      },
      pedidos: pedidosFormateados,
    };
  }).sort((a, b) => b.totalCurrent - a.totalCurrent);

  return clientsSorted;
};

// ----------------------------
// Crear un cliente nuevo y obtener coordenadas
export const createClient = async (data) => {
  const client = await prisma.client.create({ data });

  if (!client.lat || !client.lng) {
    const coords = await getCoordinatesFromAddress(client.address);
    if (coords) {
      await prisma.client.update({
        where: { id: client.id },
        data: { lat: coords.lat, lng: coords.lng },
      });
    }
  }

  return client;
};

// ----------------------------
// Función auxiliar para Google Maps
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
      console.warn("❌ Google Maps no devolvió resultados para:", address, data.status);
      return null;
    }
  } catch (error) {
    console.error("❌ Error obteniendo coordenadas:", error);
    return null;
  }
}
