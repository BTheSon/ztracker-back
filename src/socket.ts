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

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });

        // Ví dụ: Lắng nghe một sự kiện
        // socket.on('chat_message', (msg) => {
        //     io.emit('chat_message', msg);
        // });
    });

    return io;
};
