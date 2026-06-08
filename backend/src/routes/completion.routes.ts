import { Router } from 'express';
import { handleCompletion } from '../controllers/completion.controller';

const router = Router();

// Endpoint mapped to POST /api/v1/completion
router.post('/completion', handleCompletion);

export default router;