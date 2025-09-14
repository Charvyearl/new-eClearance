import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function TransactionHistory() {
  return (
    <View style={styles.container}>
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionIcon}>🕐</Text>
          <Text style={styles.transactionTitle}>Transaction History</Text>
        </View>
        <View style={styles.transactionContent}>
          <Text style={styles.emptyStateText}>No transactions yet</Text>
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
