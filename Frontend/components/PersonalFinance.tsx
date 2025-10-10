import React, { useState, useEffect } from 'react';
import { PersonalExpense, NewPersonalExpense } from '../types';
import { api } from '../api';
import PersonalExpenseForm from './PersonalExpenseForm';
import ExpensesList from './ExpensesList';
import ExpenseAnalytics from './ExpenseAnalytics';

interface PersonalFinanceProps {
  onError: (message: string) => void;
}

const PersonalFinance: React.FC<PersonalFinanceProps> = ({ onError }) => {
  const [expenses, setExpenses] = useState<PersonalExpense[]>([]);
  const [editingExpense, setEditingExpense] = useState<PersonalExpense | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'analytics'>('expenses');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Load expenses and categories when component mounts
  useEffect(() => {
    loadExpensesAndCategories();
  }, [dateRange]);

  const loadExpensesAndCategories = async () => {
    try {
      setLoading(true);
      const expensesData = await api.getPersonalExpenses(dateRange || undefined);
      setExpenses(expensesData);
    } catch (error: any) {
      onError(error?.message || 'Failed to load expense data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense: NewPersonalExpense) => {
    try {
      const newExpense = await api.addPersonalExpense(expense);
      setExpenses(prev => [newExpense, ...prev]);
    } catch (error: any) {
      onError(error?.message || 'Failed to add expense');
    }
  };

  const handleEditExpense = async (expense: PersonalExpense) => {
    setEditingExpense(expense);
  };

  const handleUpdateExpense = async (expense: NewPersonalExpense) => {
    if (!editingExpense) return;
    
    try {
      const updatedExpense = await api.updatePersonalExpense(editingExpense.id, expense);
      setExpenses(prev => 
        prev.map(e => (e.id === editingExpense.id ? updatedExpense : e))
      );
      
      setEditingExpense(null);
    } catch (error: any) {
      onError(error?.message || 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.deletePersonalExpense(expenseId);
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
      } catch (error: any) {
        onError(error?.message || 'Failed to delete expense');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-700">
        <button
          className={`py-3 px-6 font-medium ${
            activeTab === 'expenses'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`py-3 px-6 font-medium ${
            activeTab === 'analytics'
              ? 'text-primary-400 border-b-2 border-primary-400'
              : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'expenses' ? (
        <div className="space-y-8">
          {editingExpense ? (
            <PersonalExpenseForm
              onSubmit={handleUpdateExpense}
              onCancel={() => setEditingExpense(null)}
              editingExpense={editingExpense}
            />
          ) : (
            <PersonalExpenseForm
              onSubmit={handleAddExpense}
            />
          )}

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Recent Expenses</h2>
            
            <div className="flex gap-2">
              <select
                className="bg-slate-700/70 border border-slate-600/50 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                onChange={(e) => {
                  const value = e.target.value;
                  const now = new Date();
                  const start = new Date();
                  
                  if (value === 'all') {
                    setDateRange(null);
                  } else if (value === 'today') {
                    start.setHours(0, 0, 0, 0);
                    setDateRange({ start: start.toISOString(), end: now.toISOString() });
                  } else if (value === 'week') {
                    start.setDate(start.getDate() - 7);
                    setDateRange({ start: start.toISOString(), end: now.toISOString() });
                  } else if (value === 'month') {
                    start.setMonth(start.getMonth() - 1);
                    setDateRange({ start: start.toISOString(), end: now.toISOString() });
                  } else if (value === 'year') {
                    start.setFullYear(start.getFullYear() - 1);
                    setDateRange({ start: start.toISOString(), end: now.toISOString() });
                  }
                }}
                defaultValue="all"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
              
              <button
                onClick={loadExpensesAndCategories}
                className="bg-slate-700/70 border border-slate-600/50 text-white rounded-lg px-3 py-1.5 text-sm hover:bg-slate-600/70 transition-colors"
                title="Refresh expenses"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-slate-400">Loading expenses...</p>
            </div>
          ) : (
            <ExpensesList 
              expenses={expenses} 
              onEditExpense={handleEditExpense} 
              onDeleteExpense={handleDeleteExpense} 
            />
          )}
        </div>
      ) : (
        <ExpenseAnalytics onError={onError} />
      )}
    </div>
  );
};

export default PersonalFinance;