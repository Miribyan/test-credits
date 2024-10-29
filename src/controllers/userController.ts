import { Request, Response } from 'express';
import User from '../models/user.js';
import logger from '../utils/logger.js';

export async function getUsers(req: Request, res: Response) {
  
    try {

        const users = await User.getAllUsers();
        res.json(users.map(user => ({ id: user.id, username: user.username })));

    } catch (error) {

        logger.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });

    }
}