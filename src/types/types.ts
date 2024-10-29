export interface IUser {
  id: number;
  username: string;
  password: string;
  email: string;
  balance: number;
  created_at: Date;
}

export interface ITransaction {
  id: number;
  sender_id: number;
  receiver_id: number;
  amount: number;
  created_at: Date;
  type: TransactionType;
}

export interface JwtPayload {
  userId: number;
  username: string;
}

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}