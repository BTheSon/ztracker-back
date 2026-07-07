import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
) => {
    console.error(err.stack);
    res.status(500).json({
        msg: err.message || 'Internal Server Error'
    });
};
