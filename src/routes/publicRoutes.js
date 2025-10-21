import express from 'express';
const router = express.Router();

router.get('/public', (req, res) => {
    res.json({ message: "Ruta pública accesible sin autenticación" });
});

export default router;