import React, { useState } from 'react';
import { Person, Transaction, TransactionType, NewTransaction } from '../types';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from './icons';
import TransactionForm from './TransactionForm';

interface PersonDetailProps {
  person: Person;
  onBack: () => void;
  onAddTransaction: (personId: string, transaction: NewTransaction) => void;
  onUpdateTransaction: (personId: string, transactionId: string, transaction: NewTransaction) => void;
  onDeleteTransaction: (personId: string, transactionId: string) => void;
}

const calculateBalance = (person: Person): number => {
  return person.transactions.reduce((acc, tx) => {
    return tx.type === TransactionType.I_PAID ? acc + tx.amount : acc - tx.amount;
  }, 0);
};

const BalanceHeader: React.FC<{ balance: number; name: string }> = ({ balance, name }) => {
    const formattedBalance = Math.abs(balance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    let statusText = `You and ${name} are settled up.`;
    let textColor = 'text-slate-300';
  
    if (balance > 0.001) {
      statusText = `${name} owes you.`;
      textColor = 'text-emerald-400';
    } else if (balance < -0.001) {
      statusText = `You owe ${name}.`;
      textColor = 'text-rose-400';
    }
  
    return (
        <div className="bg-slate-800/50 ring-1 ring-slate-700 p-6 rounded-lg shadow-lg mb-8 text-center">
            <p className="text-slate-400 text-sm">Total Balance with</p>
            <p className="text-2xl font-bold text-white mb-2">{name}</p>
            <p className={`text-3xl font-bold ${textColor}`}>{balance < -0.001 ? '−' : ''}{formattedBalance}</p>
            <p className={`mt-2 text-md ${textColor}`}>{statusText}</p>
        </div>
    );
};

const TransactionItem: React.FC<{
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
}> = ({ transaction, onEdit, onDelete }) => {
    const isCredit = transaction.type === TransactionType.I_PAID;
    const amountColor = isCredit ? 'text-emerald-400' : 'text-rose-400';
    const sign = isCredit ? '+' : '−';
    const payer = isCredit ? 'You paid' : 'They paid';

    return (
        <li className="flex items-center justify-between bg-slate-800/50 ring-1 ring-slate-800 p-4 rounded-lg hover:bg-slate-800 transition-colors">
            <div className="flex-1 min-w-0 pr-4">
                <p className="text-white font-semibold truncate">{transaction.purpose}</p>
                <p className="text-sm text-slate-400">
                    {payer} on {new Date(transaction.date).toLocaleDateString()}
                </p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                <p className={`text-lg font-bold ${amountColor}`}>{sign} {transaction.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                <button onClick={() => onEdit(transaction)} className="text-slate-400 hover:text-amber-400 transition-colors" aria-label="Edit transaction">
                    <PencilIcon />
                </button>
                <button onClick={() => onDelete(transaction.id)} className="text-slate-400 hover:text-rose-400 transition-colors" aria-label="Delete transaction">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
};

const PersonDetail: React.FC<PersonDetailProps> = ({
  person,
  onBack,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const balance = calculateBalance(person);

  const handleAddSubmit = (transaction: NewTransaction) => {
    onAddTransaction(person.id, transaction);
  };
  
  const handleUpdateSubmit = (transaction: NewTransaction) => {
    if (editingTransaction) {
        onUpdateTransaction(person.id, editingTransaction.id, transaction);
        setEditingTransaction(null);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const sortedTransactions = [...person.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
      >
        <ArrowLeftIcon />
        Back to All People
      </button>

      <BalanceHeader balance={balance} name={person.name} />

      <TransactionForm 
        onSubmit={editingTransaction ? handleUpdateSubmit : handleAddSubmit}
        editingTransaction={editingTransaction}
        onCancel={handleCancelEdit}
      />

      <div>
        <h3 className="text-2xl font-bold text-white mb-4 mt-8">Transaction History</h3>
        {sortedTransactions.length > 0 ? (
          <ul className="space-y-3">
            {sortedTransactions.map(tx => (
              <TransactionItem 
                key={tx.id}
                transaction={tx}
                onEdit={handleEditClick}
                onDelete={(id) => onDeleteTransaction(person.id, id)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 px-6 bg-slate-800/50 ring-1 ring-slate-700 rounded-lg">
            <h3 className="text-lg font-medium text-white">No transactions yet.</h3>
            <p className="mt-1 text-sm text-slate-400">Add one using the form above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetail;