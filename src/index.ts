import app from './app';
import { config } from './config';

const startServer = () => {
    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
        console.log(`Health check: http://localhost:${config.port}/api/`);
    });
};

startServer();
