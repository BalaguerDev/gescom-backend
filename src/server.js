import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import publicRoutes from "./routes/publicRoutes.js";
import privateRoutes from "./routes/privateRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", publicRoutes);
app.use("/api", privateRoutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${process.env.PORT}`);
});