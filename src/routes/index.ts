import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';
import { deleteMsg, newMsg, reactionMsg } from '../controllers/handler_message.controler';
import { pingServerr } from '../controllers/network.controller';

const router = Router();

// Endpoint kiểm tra trạng thái server
router.get('/health', checkHealth);

router.get('/ping', pingServerr);

// Endpoint xử lý tin nhắn (Gemini phân tích ảnh)
router.post('/messages', newMsg);

// Endpoint xử lý thả cảm xúc
router.post('/messages/reaction', reactionMsg);

router.delete('/messages/delete', deleteMsg);

export default router;
