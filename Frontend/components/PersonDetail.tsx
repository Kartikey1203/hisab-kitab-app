import React, { useState } from 'react';
import { Person, Transaction, TransactionType, NewTransaction } from '../types';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from './icons';
import { api } from '../api';
import TransactionForm from './TransactionForm';
import ReminderModal from './ReminderModal';

interface PersonDetailProps {
  person: Person;
  onBack: () => void;
  onAddTransaction: (personId: string, transaction: NewTransaction) => void;
  onUpdateTransaction: (personId: string, transactionId: string, transaction: NewTransaction) => void;
  onDeleteTransaction: (personId: string, transactionId: string) => void;
  onPersonUpdate?: () => void; // Callback to refresh person data
}

const calculateBalance = (person: Person): number => {
  return person.transactions.reduce((acc, tx) => {
    return tx.type === TransactionType.I_PAID ? acc + tx.amount : acc - tx.amount;
  }, 0);
};

const BalanceHeader: React.FC<{ 
  balance: number; 
  name: string; 
  isFriend?: boolean; 
  onRemind: () => void; 
  onEditNickname?: () => void; 
  onEditPhone?: () => void;
  nickname?: string;
  phoneNumber?: string;
}> = ({ balance, name, isFriend, onRemind, onEditNickname, onEditPhone, nickname, phoneNumber }) => {
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
            <p className="text-2xl font-bold text-white mb-2">
              {name}{isFriend && <span className="ml-2 text-amber-400 text-xs align-middle">(Friend)</span>}
              {typeof nickname === 'string' && nickname.trim() && (
                <span className="ml-2 text-slate-300 text-sm">“{nickname}”</span>
              )}
            </p>
            <p className={`text-3xl font-bold ${textColor}`}>{balance < -0.001 ? '−' : ''}{formattedBalance}</p>
            <p className={`mt-2 text-md ${textColor}`}>{statusText}</p>
            {phoneNumber && (
              <p className="mt-1 text-sm text-slate-400">
                📱 {phoneNumber}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {balance > 0.01 && isFriend && (
                <button
                  onClick={onRemind}
                  className="px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700"
                >Send Reminder</button>
              )}
              {onEditNickname && (
                <button
                  onClick={onEditNickname}
                  className="px-3 py-1.5 rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
                >Edit Nickname</button>
              )}
              {onEditPhone && (
                <button
                  onClick={onEditPhone}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                >📱 Edit Phone</button>
              )}
            </div>
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
  onPersonUpdate,
}) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
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

      <BalanceHeader 
        balance={balance} 
        name={person.name} 
        nickname={person.nickname} 
        phoneNumber={person.phoneNumber}
        isFriend={person.isFriend} 
        onRemind={() => {
          setShowReminderModal(true);
        }} 
        onEditNickname={async () => {
          const nick = window.prompt('Enter a nickname for this friend', person.nickname || '') || '';
          try {
            await api.updatePerson(person.id, { nickname: nick });
            // Trigger refresh to show updated nickname
            if (onPersonUpdate) onPersonUpdate();
          } catch (e) {
            alert('Failed to update nickname');
          }
        }}
        onEditPhone={async () => {
          const phone = window.prompt('Enter phone number (with country code, e.g., +91 9876543210)', person.phoneNumber || '');
          if (phone !== null) { // Only update if not cancelled
            try {
              await api.updatePerson(person.id, { phoneNumber: phone });
              // Trigger refresh to show updated phone number
              if (onPersonUpdate) onPersonUpdate();
              alert('Phone number saved successfully! ✅');
            } catch (e) {
              alert('Failed to update phone number');
            }
          }
        }}
      />

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

      {/* Reminder Modal */}
      {showReminderModal && (
        <ReminderModal 
          person={person}
          onClose={() => setShowReminderModal(false)}
        />
      )}
    </div>
  );
};

export default PersonDetail;