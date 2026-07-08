import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';
import { newMsg, reactionMsg } from '../controllers/handler_message.controler';

const router = Router();

// Endpoint kiểm tra trạng thái server
router.get('/health', checkHealth);

// Endpoint xử lý tin nhắn (Gemini phân tích ảnh)
router.post('/messages', newMsg);

// Endpoint xử lý thả cảm xúc
router.post('/messages/reactions', reactionMsg);

export default router;
