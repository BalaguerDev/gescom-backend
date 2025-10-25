// src/routes/clientRoute.js
import express from "express";
import { getClientsHandler } from "../controllers/clientController.js";
import prisma from "../../prisma/client.js";
import { geocodeAddress } from "../services/geocodeService.js";

const router = express.Router();

// 🔹 Obtener todos los clientes con pedidos e items
router.get("/", getClientsHandler);

// 🔹 Crear cliente con geocodificación automática
router.post("/", async (req, res) => {
  try {
    const { name, address, cif, phone, email, category, notes } = req.body;
    const coords = await geocodeAddress(address);

    const newClient = await prisma.client.create({
      data: {
        name,
        address,
        cif,
        phone,
        email,
        category,
        notes,
        lat: coords?.lat || null,
        lng: coords?.lng || null,
      },
    });

    res.status(201).json(newClient);
  } catch (error) {
    console.error("❌ Error creando cliente:", error);
    res.status(500).json({ error: "Error creando cliente" });
  }
});

export default router;
