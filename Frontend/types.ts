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
  createdBy?: string; // Optional field
}

export interface Person {
  id:string;
  name: string;
  transactions: Transaction[];
  isFriend?: boolean;
  paymentAddress?: string;
  nickname?: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'date' | 'createdBy'>;

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

// Personal expense tracking interfaces
export interface PersonalExpense {
  id: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type NewPersonalExpense = Omit<PersonalExpense, 'id' | 'createdAt' | 'updatedAt'>;

export interface TimePeriodSummary {
  period: string;
  total: number;
  count: number;
}