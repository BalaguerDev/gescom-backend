import express from 'express';
import { getClientsHandler } from '../controllers/clientController.js';

const router = express.Router();

router.get('/', getClientsHandler);

export default router;
