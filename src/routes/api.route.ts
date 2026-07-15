import { Router } from 'express';
import { pingServerr } from '../controllers/network.controller';
import { receive_qr } from '../controllers/auth.controller';

const apiRouter = Router();

apiRouter.get('/ping', pingServerr);
apiRouter.post('/qr_code', receive_qr);

export default apiRouter;
