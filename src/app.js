import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import privateRoutes from "./routes/privateRoutes.js";

dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", privateRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.send("🚀 API comercial funcionando correctamente");
});

export default app;
