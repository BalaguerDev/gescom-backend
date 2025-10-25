import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const LOCATIONIQ_KEY = process.env.LOCATIONIQ_KEY;

export async function geocodeAddress(address) {
  if (!LOCATIONIQ_KEY) throw new Error("Falta LOCATIONIQ_KEY en .env");

  const encoded = encodeURIComponent(address);
  const url = `https://eu1.locationiq.com/v1/search?key=${LOCATIONIQ_KEY}&q=${encoded}&format=json&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } else {
      console.warn(`⚠️ No se encontraron coordenadas para: ${address}`);
      return null;
    }
  } catch (err) {
    console.error("❌ Error geocodificando dirección:", err.message);
    return null;
  }
}
