const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface BackendUser {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface BackendPerson {
  _id: string;
  name: string;
}

interface BackendTransaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  type: 'credit' | 'debit';
  person: string;
}

export enum TransactionType {
  I_PAID = 'I_PAID',
  THEY_PAID = 'THEY_PAID',
}

export interface Transaction {
  id: string;
  amount: number;
  purpose: string;
  type: TransactionType;
  date: string;
}

export interface Person {
  id: string;
  name: string;
  transactions: Transaction[];
}

export interface NewTransaction {
  amount: number;
  purpose: string;
  type: TransactionType;
}

const getStoredUser = (): BackendUser | null => {
  try {
    const raw = window.localStorage.getItem('hisab-kitab-user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const authHeaders = (): Record<string, string> => {
  const user = getStoredUser();
  if (user?.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

const request = async <T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> => {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`.replace(/\/$/, ''), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      // Try to parse a JSON error { message }
      let message = `Request failed (${res.status})`;
      try {
        const data = await res.clone().json();
        if (data && typeof data.message === 'string' && data.message.trim()) {
          message = data.message;
        } else {
          const textFallback = await res.text();
          if (textFallback) message = textFallback;
        }
      } catch {
        const text = await res.text().catch(() => '');
        if (text) message = text;
      }
      throw new Error(message);
    }

    return res.json();
  } catch (error: any) {
    // Normalize network and unexpected errors
    const msg = error?.message || 'Network error. Please try again.';
    throw new Error(msg);
  }
};

const mapBackendTxToFrontend = (tx: BackendTransaction): Transaction => ({
  id: tx._id,
  amount: tx.amount,
  purpose: tx.description,
  type: tx.type === 'credit' ? TransactionType.I_PAID : TransactionType.THEY_PAID,
  date: new Date(tx.date).toISOString(),
});

export const api = {
  async register(name: string, email: string, password: string): Promise<BackendUser> {
    return request<BackendUser>('/api/auth/register', 'POST', { name, email, password });
  },
  async login(email: string, password: string): Promise<BackendUser> {
    return request<BackendUser>('/api/auth/login', 'POST', { email, password });
  },
  async getPeople(): Promise<Person[]> {
    const people = await request<BackendPerson[]>('/api/people');
    // fetch transactions per person in parallel
    const withTransactions = await Promise.all(
      people.map(async (p) => {
        const txs = await request<BackendTransaction[]>(`/api/transactions/${p._id}`);
        return {
          id: p._id,
          name: p.name,
          transactions: txs.map(mapBackendTxToFrontend).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        } as Person;
      })
    );
    return withTransactions.sort((a, b) => a.name.localeCompare(b.name));
  },
  async addPerson(name: string): Promise<Person> {
    const created = await request<BackendPerson>('/api/people', 'POST', { name });
    return { id: created._id, name: created.name, transactions: [] };
  },
  async deletePerson(personId: string): Promise<void> {
    await request(`/api/people/${personId}`, 'DELETE');
  },
  async addTransaction(personId: string, tx: NewTransaction): Promise<Transaction> {
    const payload = {
      amount: tx.amount,
      description: tx.purpose,
      type: tx.type === TransactionType.I_PAID ? 'credit' : 'debit',
      date: new Date().toISOString(),
    };
    const created = await request<BackendTransaction>(`/api/transactions/${personId}`, 'POST', payload);
    return mapBackendTxToFrontend(created);
  },
  async updateTransaction(transactionId: string, tx: NewTransaction): Promise<Transaction> {
    const payload = {
      amount: tx.amount,
      description: tx.purpose,
      type: tx.type === TransactionType.I_PAID ? 'credit' : 'debit',
    };
    const updated = await request<BackendTransaction>(`/api/transactions/${transactionId}`, 'PUT', payload);
    return mapBackendTxToFrontend(updated);
  },
  async deleteTransaction(transactionId: string): Promise<void> {
    await request(`/api/transactions/${transactionId}`, 'DELETE');
  },
};

export type { BackendUser };


