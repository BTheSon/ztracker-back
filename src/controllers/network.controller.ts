import { Request, Response } from "express";

export const pingServerr = (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Pong!',
    });
}