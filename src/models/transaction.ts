import pool from '../database.js';
import { ITransaction, TransactionType } from '../types/types.js';

class Transaction {
  static async createTransaction(senderId: number, receiverId: number, amount: number) {
    await pool.query('BEGIN');
    try {
      // Lock sender's balance for verification and update
      const senderResult = await pool.query(
        `SELECT balance FROM users WHERE id = $1 FOR UPDATE`,
        [senderId]
      );
      const senderBalance = senderResult.rows[0]?.balance;

      if (senderBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Update sender's balance
      await pool.query(
        `UPDATE users SET balance = balance - $1 WHERE id = $2`,
        [amount, senderId]
      );

      // Update receiver's balance
      await pool.query(
        `UPDATE users SET balance = balance + $1 WHERE id = $2`,
        [amount, receiverId]
      );

      // Record transaction with sender and receiver specified
      await pool.query(
        `INSERT INTO transactions (sender_id, receiver_id, amount) VALUES ($1, $2, $3)`,
        [senderId, receiverId, amount]
      );

      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  static async getUserTransactions(userId: number, page: number, pageSize: number): Promise<ITransaction[]> {
    const offset = (page - 1) * pageSize;
    const query = `
            SELECT * FROM transactions
            WHERE sender_id = $1 OR receiver_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
    const result = await pool.query(query, [userId, pageSize, offset]);
    return result.rows;
  }

  static async getFilteredTransactions(
    userId: number,
    page: number,
    pageSize: number,
    filters: { transactionType?: TransactionType; date?: string }
  ): Promise<ITransaction[]> {
    const offset = (page - 1) * pageSize;
    const params: (string | number)[] = [userId];
    let query = `
        SELECT * FROM transactions
        WHERE (sender_id = $1 OR receiver_id = $1)
    `;

    if (filters.transactionType) {
      const amountCondition = filters.transactionType === 'credit' ? '> 0' : '< 0';
      query += ` AND amount ${amountCondition}`;
    }

    if (filters.date) {
      query += ` AND DATE(created_at) = $${params.length + 1}`;
      params.push(filters.date);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Метод для копирования транзакции по её ID
  static async copyTransactionById(transactionId: number): Promise<void> {
    const transactionResult = await pool.query(
      `SELECT sender_id, receiver_id, amount FROM transactions WHERE id = $1`,
      [transactionId]
    );
    const transaction = transactionResult.rows[0];

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return this.createTransaction(transaction.sender_id, transaction.receiver_id, transaction.amount)
  }
}

export default Transaction;