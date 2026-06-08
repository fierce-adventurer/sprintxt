import { Router } from 'express';
import { handleCompletion } from '../controllers/completion.controller';
import { aiCompletionLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Endpoint mapped to POST /api/v1/completion
router.post('/completion', aiCompletionLimiter, handleCompletion);

export default router;