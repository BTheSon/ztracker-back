import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: '*', // Bạn có thể cấu hình lại cho đúng domain frontend
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);
        if (socket.handshake.auth?.type === 'zalo-worker') {
            // 1. Log ra server
            console.log(`Zalo Worker connected: ${socket.id}`);
        
            // 2. Bắn thông báo (Broadcast) tới toàn bộ các thiết bị (trình duyệt, app) đang kết nối
            io.emit('worker_status', { 
                status: 'online', 
                message: 'Zalo Worker đã kết nối thành công!' 
            });
        }
        socket.on('disconnect', () => {
            if (socket.handshake.auth?.type === 'zalo-worker') {
                io.emit('worker_status', { 
                    status: 'offline', 
                    message: 'Zalo Worker đã mất kết nối!' 
                });
            }
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};
