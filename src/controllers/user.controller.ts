import { Request, Response } from 'express';

export const getUsers = (req: Request, res: Response) => {
    // Logic to fetch users
    res.json({
        success: true,
        data: [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Doe' },
        ],
    });
};

export const getUserById = (req: Request, res: Response) => {
    const { id } = req.params;
    // Logic to fetch user by ID
    res.json({
        success: true,
        data: { id: Number(id), name: 'John Doe' },
    });
};

export const createUser = (req: Request, res: Response) => {
    const body = req.body;
    // Logic to create user
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: body,
    });
};
