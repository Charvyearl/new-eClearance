import React, { useEffect, useState } from 'react';
import { walletAPI } from '../api/client';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await walletAPI.getTransactions({ limit: 20 });
        if (isMounted && res?.success) {
          setTransactions(res.data.transactions || []);
        }
      } catch (e) {
        // ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionIcon}>🕐</Text>
          <Text style={styles.transactionTitle}>Transaction History</Text>
        </View>
        <View style={styles.transactionContent}>
          {loading ? (
            <Text style={styles.emptyStateText}>Loading...</Text>
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyStateText}>No transactions yet</Text>
          ) : (
            <View style={{ width: '100%' }}>
              {transactions.map((t) => (
                <View key={t.id || t.transaction_id} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '600', color: '#333' }}>{t.type || t.transaction_type}</Text>
                  <Text style={{ color: '#2e7d32' }}>₱{Number(t.amount).toFixed(2)}</Text>
                  <Text style={{ color: '#666' }}>{t.description || t.reference_id || ''}</Text>
                  <Text style={{ color: '#999', fontSize: 12 }}>{t.created_at || t.date}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});
