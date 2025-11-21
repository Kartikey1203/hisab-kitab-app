import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { api } from '../api';
import { Person } from '../types';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPeople = async () => {
    try {
      const data = await api.getPeople();
      setPeople(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load people');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPeople();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPeople();
  };

  const calculateBalance = (person: Person): number => {
    return person.transactions.reduce((sum, tx) => {
      return tx.type === 'I_PAID' ? sum + tx.amount : sum - tx.amount;
    }, 0);
  };

  const deletePerson = async (personId: string) => {
    Alert.alert(
      'Delete Person',
      'Are you sure you want to delete this person?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deletePerson(personId);
              setPeople(prev => prev.filter(p => p.id !== personId));
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const renderPerson = ({ item }: { item: Person }) => {
    const balance = calculateBalance(item);
    const isPositive = balance > 0;
    const isZero = balance === 0;

    return (
      <TouchableOpacity
        style={styles.personCard}
        onPress={() => navigation.navigate('PersonDetail', { person: item })}
        onLongPress={() => deletePerson(item.id)}
      >
        <View style={styles.personHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{item.name}</Text>
            <Text style={styles.transactionCount}>
              {item.transactions.length} transaction{item.transactions.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <Text
            style={[
              styles.balanceAmount,
              isPositive && styles.balancePositive,
              !isPositive && !isZero && styles.balanceNegative,
            ]}
          >
            ₹{Math.abs(balance).toFixed(2)}
          </Text>
          <Text style={styles.balanceLabel}>
            {isZero ? 'Settled' : isPositive ? 'They owe you' : 'You owe them'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={people}
        renderItem={renderPerson}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No people added yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add someone</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPerson', { onPersonAdded: loadPeople })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  listContainer: {
    padding: 16,
  },
  personCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  transactionCount: {
    fontSize: 14,
    color: '#94a3b8',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginBottom: 4,
  },
  balancePositive: {
    color: '#10b981',
  },
  balanceNegative: {
    color: '#ef4444',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
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

export default HomeScreen;
