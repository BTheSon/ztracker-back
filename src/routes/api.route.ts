import { Router } from 'express';
import { deleteMsg, newMsg, reactionMsg } from '../controllers/handler_message.controler';
import { pingServerr } from '../controllers/network.controller';
import { receive_qr } from '../controllers/auth.controller';

const apiRouter = Router();

apiRouter.get('/ping', pingServerr);

export default apiRouter;
