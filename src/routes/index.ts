import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';
import userRoutes from './user.routes';

const router = Router();

router.get('/health', checkHealth);
router.use('/users', userRoutes);

export default router;
