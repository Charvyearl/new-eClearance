import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../../services/api';
import { Transaction } from '../../types';

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Mock data for demo purposes
        const mockTransactions: Transaction[] = [
          {
            id: 1,
            transaction_id: 'TXN001',
            user_id: 1,
            transaction_type_id: 1,
            amount: 100.00,
            balance_before: 200.00,
            balance_after: 300.00,
            description: 'Account Top-up',
            reference_id: 'TOPUP001',
            status: 'completed',
            created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
            updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            rfid_card_id: 'CARD001',
            first_name: 'John',
            last_name: 'Doe',
            transaction_type_name: 'top-up'
          },
          {
            id: 2,
            transaction_id: 'TXN002',
            user_id: 2,
            transaction_type_id: 2,
            amount: 15.50,
            balance_before: 50.00,
            balance_after: 34.50,
            description: 'Canteen Purchase',
            reference_id: 'PURCHASE001',
            status: 'completed',
            created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
            updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            rfid_card_id: 'CARD002',
            first_name: 'Jane',
            last_name: 'Smith',
            transaction_type_name: 'purchase'
          }
        ];
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  transaction.transaction_type_name === 'top-up' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.first_name} {transaction.last_name} ({transaction.rfid_card_id})
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {transaction.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  transaction.transaction_type_name === 'top-up' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {transaction.transaction_type_name === 'top-up' ? '+' : ''}{formatAmount(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;
