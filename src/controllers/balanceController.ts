import { Request, Response } from 'express';
import User from '../models/user.js';
import logger from '../utils/logger.js';

export async function getBalance(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req.user as { userId: number }).userId;
        const user = await User.findUserById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return
        }

        res.json({ balance: user.balance });
    } catch (error) {
        logger.error('Error fetching balance:', error);
        res.status(500).json({ message: 'Error fetching balance', error });
    }
}