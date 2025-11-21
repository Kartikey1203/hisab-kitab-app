import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { api } from '../api';
import { Person, Transaction, TransactionType, NewTransaction } from '../types';

interface PersonDetailScreenProps {
  route: any;
  navigation: any;
}

const PersonDetailScreen: React.FC<PersonDetailScreenProps> = ({ route, navigation }) => {
  const initialPerson = route.params?.person as Person;
  const [person, setPerson] = useState<Person>(initialPerson);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.I_PAID);

  const refreshPerson = async () => {
    try {
      const people = await api.getPeople();
      const updated = people.find(p => p.id === person.id);
      if (updated) {
        setPerson(updated);
      }
    } catch (err) {
      console.error('Failed to refresh person:', err);
    }
  };

  const calculateBalance = (): number => {
    return person.transactions.reduce((sum, tx) => {
      return tx.type === TransactionType.I_PAID ? sum + tx.amount : sum - tx.amount;
    }, 0);
  };

  const handleAddTransaction = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!purpose.trim()) {
      Alert.alert('Error', 'Please enter a purpose');
      return;
    }

    try {
      const newTx: NewTransaction = {
        amount: amountNum,
        purpose: purpose.trim(),
        type: transactionType,
      };

      const created = await api.addTransaction(person.id, newTx);
      setPerson(prev => ({
        ...prev,
        transactions: [created, ...prev.transactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      }));

      setAmount('');
      setPurpose('');
      setShowAddTransaction(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to add transaction');
    }
  };

  const deleteTransaction = async (txId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTransaction(txId);
              setPerson(prev => ({
                ...prev,
                transactions: prev.transactions.filter(tx => tx.id !== txId),
              }));
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isIPaid = item.type === TransactionType.I_PAID;
    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onLongPress={() => deleteTransaction(item.id)}
      >
        <View style={styles.transactionHeader}>
          <View
            style={[
              styles.transactionIcon,
              isIPaid ? styles.transactionIconPositive : styles.transactionIconNegative,
            ]}
          >
            <Text style={styles.transactionIconText}>{isIPaid ? '↑' : '↓'}</Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionPurpose}>{item.purpose}</Text>
            <Text style={styles.transactionDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              isIPaid ? styles.amountPositive : styles.amountNegative,
            ]}
          >
            {isIPaid ? '+' : '-'}₹{item.amount.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const balance = calculateBalance();
  const isPositive = balance > 0;
  const isZero = balance === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{person.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.personName}>{person.name}</Text>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            {isZero ? 'Settled' : isPositive ? 'They owe you' : 'You owe them'}
          </Text>
          <Text
            style={[
              styles.balanceAmount,
              isPositive && styles.balancePositive,
              !isPositive && !isZero && styles.balanceNegative,
            ]}
          >
            ₹{Math.abs(balance).toFixed(2)}
          </Text>
        </View>
      </View>

      {showAddTransaction && (
        <View style={styles.addTransactionForm}>
          <Text style={styles.formTitle}>Add Transaction</Text>

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === TransactionType.I_PAID && styles.typeButtonActive,
              ]}
              onPress={() => setTransactionType(TransactionType.I_PAID)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === TransactionType.I_PAID && styles.typeButtonTextActive,
                ]}
              >
                I Paid
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === TransactionType.THEY_PAID && styles.typeButtonActive,
              ]}
              onPress={() => setTransactionType(TransactionType.THEY_PAID)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === TransactionType.THEY_PAID && styles.typeButtonTextActive,
                ]}
              >
                They Paid
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor="#94a3b8"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Purpose"
            placeholderTextColor="#94a3b8"
            value={purpose}
            onChangeText={setPurpose}
          />

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => setShowAddTransaction(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.addButton]}
              onPress={handleAddTransaction}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={person.transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
      />

      {!showAddTransaction && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddTransaction(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  personName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  balancePositive: {
    color: '#10b981',
  },
  balanceNegative: {
    color: '#ef4444',
  },
  addTransactionForm: {
    backgroundColor: '#1e293b',
    padding: 20,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#f59e0b',
  },
  typeButtonText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#334155',
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#f59e0b',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  transactionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  transactionIconNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  transactionIconText: {
    fontSize: 20,
    color: '#fff',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionPurpose: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountPositive: {
    color: '#10b981',
  },
  amountNegative: {
    color: '#ef4444',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PersonDetailScreen;
