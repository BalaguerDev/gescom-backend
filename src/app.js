import express from 'express';
import cors from 'cors';
import clientRoutes from './routes/clientRoutes.js';

const app = express();

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));

app.use(express.json());

// Rutas
app.use('/api/clients', clientRoutes);

export default app;
