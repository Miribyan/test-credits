import pool from '../database.js';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/types.js';


class User {
  static async createUser(username: string, password: string, email: string): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
            INSERT INTO users (username, password, email, balance)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, balance
        `;
    const values = [username, hashedPassword, email, parseInt(process.env.WELCOME_BONUS || '500')];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findUserByUsername(username: string) {
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  }
  
  static async findUserByEmail(email: string): Promise<IUser | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findUserById(id: number): Promise<IUser | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getAllUsers(): Promise<Pick<IUser, 'id' | 'username'>[]> {
    const query = 'SELECT id, username FROM users';
    const result = await pool.query(query);
    return result.rows;
  }
}

export default User;