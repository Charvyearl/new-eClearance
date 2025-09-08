import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  ArrowDownTrayIcon, 
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Transaction } from '../types';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    status: '',
    search: ''
  });
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    todayTransactions: 0,
    todayAmount: 0
  });

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          transaction_id: 'TXN001',
          user_id: 1,
          transaction_type_id: 1,
          amount: 85.00,
          balance_before: 500.00,
          balance_after: 415.00,
          description: 'Purchase: Chicken Adobo',
          reference_id: 'ORDER001',
          status: 'completed',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          transaction_type_name: 'purchase',
          first_name: 'John',
          last_name: 'Doe',
          rfid_card_id: 'CARD001'
        },
        {
          id: 2,
          transaction_id: 'TXN002',
          user_id: 2,
          transaction_type_id: 2,
          amount: 100.00,
          balance_before: 200.00,
          balance_after: 300.00,
          description: 'Top-up at finance office',
          reference_id: undefined,
          status: 'completed',
          created_at: '2024-01-15T09:15:00Z',
          updated_at: '2024-01-15T09:15:00Z',
          transaction_type_name: 'top_up',
          first_name: 'Jane',
          last_name: 'Smith',
          rfid_card_id: 'CARD002'
        },
        {
          id: 3,
          transaction_id: 'TXN003',
          user_id: 1,
          transaction_type_id: 1,
          amount: 25.00,
          balance_before: 415.00,
          balance_after: 390.00,
          description: 'Purchase: Coca Cola',
          reference_id: 'ORDER002',
          status: 'completed',
          created_at: '2024-01-15T11:45:00Z',
          updated_at: '2024-01-15T11:45:00Z',
          transaction_type_name: 'purchase',
          first_name: 'John',
          last_name: 'Doe',
          rfid_card_id: 'CARD001'
        },
        {
          id: 4,
          transaction_id: 'TXN004',
          user_id: 3,
          transaction_type_id: 1,
          amount: 95.00,
          balance_before: 1000.00,
          balance_after: 905.00,
          description: 'Purchase: Beef Sinigang',
          reference_id: 'ORDER003',
          status: 'completed',
          created_at: '2024-01-15T12:20:00Z',
          updated_at: '2024-01-15T12:20:00Z',
          transaction_type_name: 'purchase',
          first_name: 'Admin',
          last_name: 'User',
          rfid_card_id: 'STAFF001'
        }
      ];

      let filteredTransactions = mockTransactions;

      // Apply filters
      if (filters.startDate) {
        filteredTransactions = filteredTransactions.filter(t => 
          new Date(t.created_at) >= new Date(filters.startDate)
        );
      }
      if (filters.endDate) {
        filteredTransactions = filteredTransactions.filter(t => 
          new Date(t.created_at) <= new Date(filters.endDate)
        );
      }
      if (filters.type) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.transaction_type_name === filters.type
        );
      }
      if (filters.status) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.status === filters.status
        );
      }
      if (filters.search) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.rfid_card_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.transaction_id?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setTransactions(filteredTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        totalTransactions: 1247,
        totalAmount: 45678.50,
        todayTransactions: 89,
        todayAmount: 3245.75
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      purchase: 'bg-blue-100 text-blue-800',
      top_up: 'bg-green-100 text-green-800',
      refund: 'bg-yellow-100 text-yellow-800',
      transfer: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[type as keyof typeof colors]}`}>
        {type.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const handleExport = () => {
    // Implement CSV export functionality
    console.log('Exporting transactions...');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor all system transactions and generate reports
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn btn-secondary flex items-center"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-blue-500">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Transactions
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.totalTransactions.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-green-500">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Amount
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatAmount(stats.totalAmount)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-yellow-500">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Today's Transactions
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.todayTransactions}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-purple-500">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Today's Revenue
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatAmount(stats.todayAmount)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <FunnelIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              className="input"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              className="input"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
          <div>
            <label className="label">Transaction Type</label>
            <select
              className="input"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="top_up">Top-up</option>
              <option value="refund">Refund</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              placeholder="Search by name, RFID, or transaction ID"
              className="input"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {transaction.transaction_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.first_name} {transaction.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.rfid_card_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(transaction.transaction_type_name || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatAmount(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
