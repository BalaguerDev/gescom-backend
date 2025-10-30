// src/utils/geocode.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function getCoordinatesFromAddress(address) {
    if (!GOOGLE_MAPS_API_KEY)
        throw new Error("Falta GOOGLE_MAPS_API_KEY en .env");

    const encoded = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "OK" || !data.results.length) {
            console.warn(`⚠️ No se encontraron coordenadas para: ${address}`);
            return null;
        }

        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
    } catch (err) {
        console.error("❌ Error geocodificando dirección:", err.message);
        return null;
    }
}
