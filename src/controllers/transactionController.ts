import { Request, Response } from 'express';
import Transaction from '../models/transaction.js';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import { TransactionType } from '../types/types.js';

export async function getTransactions(req: Request, res: Response) {
    try {
        const userId = (req.user as { userId: number }).userId;
        const { page = 1, pageSize = 10 } = req.query;

        const transactions = await Transaction.getUserTransactions(userId, Number(page), Number(pageSize));
        res.json({
            data: transactions,
            page: Number(page),
            pageSize: Number(pageSize)
        });
    } catch (error) {
        logger.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
    const { userId: receiverId, amount } = req.body;
    const senderId = (req.user as { userId: number }).userId;

    if (amount <= 0) {
        res.status(400).json({ message: 'Amount must be greater than zero' });
        return
    }

    try {
        const sender = await User.findUserById(senderId);
        const receiver = await User.findUserById(receiverId);

        if (!sender || !receiver) {
            res.status(404).json({ message: 'Sender or receiver not found' });
            return
        }

        if (sender.balance < amount) {
            res.status(400).json({ message: 'Insufficient balance' });
            return
        }

        await Transaction.createTransaction(senderId, receiverId, amount);
        res.status(201).json({ message: 'Transaction successful' });
    } catch (error) {
        logger.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Error creating transaction', error });
    }
}


//EXTRA
// Filtered transaction
export async function getFilteredTransactions(req: Request, res: Response) {
    const userId = (req.user as { userId: number }).userId;
    const { page = 1, pageSize = 10, transactionType, date } = req.query;

    if (transactionType && !Object.values(TransactionType).includes(transactionType as TransactionType)) {
        res.status(400).json({ message: 'Invalid transaction type. Must be debit or credit.' });
        return
    }

    try {
        const filters = {
            transactionType: transactionType ? (transactionType as TransactionType) : undefined,
            date: date ? String(date) : undefined,
        };

        const transactions = await Transaction.getFilteredTransactions(
            userId,
            Number(page),
            Number(pageSize),
            filters
        );

        res.json({
            data: transactions,
            page: Number(page),
            pageSize: Number(pageSize),
        });
    } catch (error) {
        logger.error('Error fetching filtered transactions:', error);
        res.status(500).json({ message: 'Error fetching filtered transactions', error });
    }
}

// Copy in history exact transaction (repeat transaction)
export async function copyTransaction(req: Request, res: Response) {
    const { transactionId } = req.params;

    try {
        await Transaction.copyTransactionById(Number(transactionId));
        res.status(201).json({ message: 'Transaction copied successfully' });
    } catch (error) {
        logger.error('Error copying transaction:', error);
        res.status(500).json({ message: 'Error copying transaction', error });
    }
}