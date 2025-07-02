import express from 'express';
import { saveEmbedding, getEmbeddings } from '../controllers/embeddingControllers.js'

const router = express.Router();

router.post('/', saveEmbedding);      // Crear o actualizar
router.get('/', getEmbeddings);       // Listar todos

export default router;