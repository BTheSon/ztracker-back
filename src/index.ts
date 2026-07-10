import http from 'http';
import app from './app';
import { config } from './config';
import { initSocket } from './socket';

const server = http.createServer(app);

// Khởi tạo WebSocket
initSocket(server);

const startServer = () => {
    server.listen(config.port, () => {
        console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
        console.log(`Health check: http://localhost:${config.port}/api/`);
    });
};

startServer();
