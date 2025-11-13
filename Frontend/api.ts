const API_BASE_URL = (import.meta as any).env?.VITE_API_URL;

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
  friendUser?: string | null;
  paymentAddress?: string;
  nickname?: string;
}

interface BackendTransaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  type: 'credit' | 'debit';
  person: string;
}

interface BackendFriendRequest {
  _id: string;
  fromUser: { _id: string; name: string; email: string } | string;
  toUser: { _id: string; name: string; email: string } | string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
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
  
  // OPTIMIZED: Get all people with transactions in ONE API call
  async getPeople(): Promise<Person[]> {
    const peopleWithTransactions = await request<Array<BackendPerson & { transactions: BackendTransaction[] }>>('/api/people/with-transactions');
    
    return peopleWithTransactions
      .map(p => ({
        id: p._id,
        name: p.name,
        isFriend: !!p.friendUser,
        paymentAddress: p.paymentAddress || '',
        nickname: p.nickname || '',
        transactions: p.transactions
          .map(mapBackendTxToFrontend)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  
  // DEPRECATED: Old slow method - keeping for backwards compatibility
  async getPeopleOld(): Promise<Person[]> {
    const people = await request<BackendPerson[]>('/api/people');
    // fetch transactions per person in parallel
    const withTransactions = await Promise.all(
      people.map(async (p) => {
        const txs = await request<BackendTransaction[]>(`/api/transactions/${p._id}`);
        return {
          id: p._id,
          name: p.name,
          isFriend: !!p.friendUser,
          paymentAddress: p.paymentAddress || '',
          nickname: p.nickname || '',
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
  async addBulkTransaction(personIds: string[], tx: NewTransaction): Promise<{ message: string; transactions: Transaction[] }> {
    const payload = {
      amount: tx.amount,
      description: tx.purpose,
      type: tx.type === TransactionType.I_PAID ? 'credit' : 'debit',
      date: new Date().toISOString(),
      personIds,
    };
    const response = await request<{ message: string; transactions: BackendTransaction[] }>('/api/transactions/bulk', 'POST', payload);
    return {
      message: response.message,
      transactions: response.transactions.map(mapBackendTxToFrontend)
    };
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
  async sendFriendRequest(email: string, personId?: string): Promise<BackendFriendRequest> {
    const body: any = { email };
    if (personId) body.personId = personId;
    return request<BackendFriendRequest>('/api/friends/request', 'POST', body);
  },
  async getFriendRequests(): Promise<{ incoming: BackendFriendRequest[]; outgoing: BackendFriendRequest[] }> {
    return request<{ incoming: BackendFriendRequest[]; outgoing: BackendFriendRequest[] }>('/api/friends/requests');
  },
  async respondFriendRequest(requestId: string, action: 'accept' | 'decline'): Promise<BackendFriendRequest> {
    return request<BackendFriendRequest>('/api/friends/respond', 'POST', { requestId, action });
  },
  async cancelFriendRequest(requestId: string): Promise<BackendFriendRequest> {
    return request<BackendFriendRequest>('/api/friends/cancel', 'POST', { requestId });
  },
  async getMe() {
    return request<{ id: string; name: string; email: string; photoUrl?: string | null }>('/api/users/me');
  },
  async updateProfile(name: string, photoUrl?: string | null) {
    return request<{ id: string; name: string; email: string; photoUrl?: string | null }>('/api/users/me', 'PUT', { name, photoUrl });
  },
  async searchUsersByName(query: string) {
    const encoded = encodeURIComponent(query);
    return request<Array<{ id: string; name: string; email: string }>>(`/api/users/search?q=${encoded}`);
  },
  async getNotifications() {
    return request<any[]>('/api/notifications');
  },
  async markNotificationsRead(ids?: string[]) {
    return request<{ ok: boolean }>('/api/notifications/read', 'POST', ids && ids.length ? { ids } : {});
  },
  async clearNotifications() {
    return request<{ ok: boolean }>('/api/notifications/clear', 'DELETE');
  },
  async updatePerson(personId: string, data: Partial<{ name: string; paymentAddress: string; nickname: string }>) {
    return request<BackendPerson>(`/api/people/${personId}`, 'PUT', data);
  },
  async sendReminder(personId: string) {
    return request<{ ok: boolean }>(`/api/people/${personId}/remind`, 'POST', {});
  },
  async deleteAccount() {
    return request<{ ok: boolean }>('/api/users/me', 'DELETE');
  },

  // Personal expense tracking APIs
  async getPersonalExpenses(filters?: { start?: string; end?: string }) {
    let url = '/api/personal-expenses';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.start) params.append('start', filters.start);
      if (filters.end) params.append('end', filters.end);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const expenses = await request<any[]>(url);
    return expenses.map(expense => ({
      id: expense._id,
      amount: expense.amount,
      description: expense.description,
      date: new Date(expense.date).toISOString(),
      createdAt: new Date(expense.createdAt).toISOString(),
      updatedAt: new Date(expense.updatedAt).toISOString(),
    }));
  },

  async addPersonalExpense(expense: { amount: number; description: string; date?: string }) {
    const payload = {
      ...expense,
      category: 'Expense', // Using a default category for backend compatibility
      date: expense.date || new Date().toISOString(),
    };

    const created = await request<any>('/api/personal-expenses', 'POST', payload);
    return {
      id: created._id,
      amount: created.amount,
      description: created.description,
      date: new Date(created.date).toISOString(),
      createdAt: new Date(created.createdAt).toISOString(),
      updatedAt: new Date(created.updatedAt).toISOString(),
    };
  },

  async updatePersonalExpense(id: string, expense: { amount?: number; description?: string; date?: string }) {
    // Add a default category for backend compatibility
    const payload = { ...expense, category: 'Expense' };
    const updated = await request<any>(`/api/personal-expenses/${id}`, 'PUT', payload);
    return {
      id: updated._id,
      amount: updated.amount,
      description: updated.description,
      date: new Date(updated.date).toISOString(),
      createdAt: new Date(updated.createdAt).toISOString(),
      updatedAt: new Date(updated.updatedAt).toISOString(),
    };
  },

  async deletePersonalExpense(id: string) {
    await request<{ message: string }>(`/api/personal-expenses/${id}`, 'DELETE');
  },



  async getTimePeriodSummary(period: 'daily' | 'weekly' | 'monthly', filters?: { start?: string; end?: string }) {
    let url = `/api/personal-expenses/time/summary?period=${period}`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.start) params.append('start', filters.start);
      if (filters.end) params.append('end', filters.end);
      if (params.toString()) {
        url += `&${params.toString()}`;
      }
    }
    
    return request<Array<{ period: string; total: number; count: number }>>(url);
  },
};

export type { BackendUser };


