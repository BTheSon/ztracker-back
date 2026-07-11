import { Router } from 'express';
import { deleteMsg, newMsg, reactionMsg } from '../controllers/handler_message.controler';
import { receive_qr } from '../controllers/auth.controller';

const workerRouter = Router();

workerRouter.post('/qr_code', receive_qr);

// Endpoint xử lý tin nhắn (Gemini phân tích ảnh)
workerRouter.post('/messages', newMsg);

// Endpoint xử lý thả cảm xúc
workerRouter.post('/messages/reaction', reactionMsg);

workerRouter.delete('/messages/delete', deleteMsg);

export default workerRouter;
