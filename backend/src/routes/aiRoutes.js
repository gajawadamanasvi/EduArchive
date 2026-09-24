import express from 'express';
import { handleChatQuery, fetchSuggestedQuestions, runDirectScan } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Optional authentication so public visitors can ask general questions, while logged in students get personalized context
router.post('/chat', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}, handleChatQuery);

router.get('/suggested-questions', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}, fetchSuggestedQuestions);

router.post('/scan-direct', authenticate, runDirectScan);

export default router;
