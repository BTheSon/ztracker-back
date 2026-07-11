import { io } from "../socket";

export const login_qr = (base64: string) => {
    if (io) {
        io.emit('login_qr', { qrcode_base64: base64 });
    }
}