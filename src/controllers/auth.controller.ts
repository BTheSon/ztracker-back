import { Request, Response } from "express";
import { login_qr } from "../services/authSocketService";

export const receive_qr = (req: Request, res: Response) => {
    const { qrcode_base64 } = req.body;
    login_qr(qrcode_base64);
    res.json({
        msg: "Đã nhận QR code và phát sự kiện login_qr"
    });
}