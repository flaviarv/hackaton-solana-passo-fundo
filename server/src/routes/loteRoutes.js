import { Router } from 'express';
import { cadastrarLote, listarLotes, queimarLote } from '../controllers/loteController.js';

const router = Router();

router.post('/lotes', cadastrarLote);
router.get('/lotes', listarLotes);
router.post('/lotes/burn', queimarLote);

export default router;