export enum TransactionType {
  I_PAID = 'I_PAID', // They owe me
  THEY_PAID = 'THEY_PAID', // I owe them
}

export interface Transaction {
  id: string;
  amount: number;
  purpose: string;
  type: TransactionType;
  date: string;
}

export interface Person {
  id:string;
  name: string;
  transactions: Transaction[];
  isFriend?: boolean;
  paymentAddress?: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'date'>;

export interface User {
    id: string;
    name: string;
    email: string;
    token?: string;
    photoUrl?: string | null;
}

export interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}