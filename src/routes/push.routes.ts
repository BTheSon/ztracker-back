import { Router } from 'express';
import { getVapidPublicKey, subscribe, testPush } from '../controllers/push.controller';

const router = Router();

// Endpoint lấy VAPID Public Key
router.get('/vapid-public-key', getVapidPublicKey);

// Endpoint nhận Subscription từ Client
router.post('/subscribe', subscribe);

// Endpoint test bắn thông báo
router.post('/test', testPush);

export default router;
