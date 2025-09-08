import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { User, Wallet } from '../types';

interface WalletWithUser extends Wallet {
  user: User;
}

const Wallets: React.FC = () => {
  const [wallets, setWallets] = useState<WalletWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletWithUser | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpDescription, setTopUpDescription] = useState('');
  const [stats, setStats] = useState({
    totalWallets: 0,
    totalBalance: 0,
    averageBalance: 0,
    activeWallets: 0
  });

  useEffect(() => {
    fetchWallets();
    fetchStats();
  }, []);

  const fetchWallets = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockWallets: WalletWithUser[] = [
        {
          id: 1,
          user_id: 1,
          balance: 415.00,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T11:45:00Z',
          user: {
            id: 1,
            rfid_card_id: 'CARD001',
            student_id: '2024-001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@school.edu',
            phone: '+1234567890',
            user_type: 'student',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        },
        {
          id: 2,
          user_id: 2,
          balance: 300.00,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T09:15:00Z',
          user: {
            id: 2,
            rfid_card_id: 'CARD002',
            student_id: '2024-002',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@school.edu',
            phone: '+1234567891',
            user_type: 'student',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        },
        {
          id: 3,
          user_id: 3,
          balance: 905.00,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T12:20:00Z',
          user: {
            id: 3,
            rfid_card_id: 'STAFF001',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@school.edu',
            phone: '+1234567892',
            user_type: 'admin',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        },
        {
          id: 4,
          user_id: 4,
          balance: 0.00,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user: {
            id: 4,
            rfid_card_id: 'CARD003',
            student_id: '2024-003',
            first_name: 'Bob',
            last_name: 'Johnson',
            email: 'bob.johnson@school.edu',
            phone: '+1234567893',
            user_type: 'student',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        }
      ];

      setWallets(mockWallets);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setStats({
        totalWallets: 156,
        totalBalance: 45678.50,
        averageBalance: 292.81,
        activeWallets: 142
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || !topUpAmount) return;

    try {
      console.log('Topping up wallet:', {
        userId: selectedWallet.user_id,
        amount: parseFloat(topUpAmount),
        description: topUpDescription
      });
      
      setShowTopUpModal(false);
      setSelectedWallet(null);
      setTopUpAmount('');
      setTopUpDescription('');
      fetchWallets();
    } catch (error) {
      console.error('Failed to top up wallet:', error);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance === 0) return 'text-red-600';
    if (balance < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBalanceBadge = (balance: number) => {
    if (balance === 0) return 'bg-red-100 text-red-800';
    if (balance < 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const filteredWallets = wallets.filter(wallet =>
    wallet.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.user.rfid_card_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.user.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user wallets and process top-ups
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-blue-500">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Wallets
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.totalWallets.toLocaleString()}
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
                  Total Balance
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatAmount(stats.totalBalance)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-yellow-500">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Average Balance
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatAmount(stats.averageBalance)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-purple-500">
                <CreditCardIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Wallets
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {stats.activeWallets.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, RFID card, or student ID..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Wallets Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFID Card
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWallets.map((wallet) => (
                <tr key={wallet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {wallet.user.first_name[0]}{wallet.user.last_name[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {wallet.user.first_name} {wallet.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {wallet.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {wallet.user.rfid_card_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {wallet.user.student_id || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getBalanceColor(wallet.balance)}`}>
                      {formatAmount(wallet.balance)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBalanceBadge(wallet.balance)}`}>
                      {wallet.balance === 0 ? 'Empty' : wallet.balance < 50 ? 'Low' : 'Good'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(wallet.updated_at).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setShowTopUpModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Top Up
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredWallets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No wallets found matching your search.</p>
          </div>
        )}
      </div>

      {/* Top-up Modal */}
      {showTopUpModal && selectedWallet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Up Wallet
              </h3>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>User:</strong> {selectedWallet.user.first_name} {selectedWallet.user.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>RFID:</strong> {selectedWallet.user.rfid_card_id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current Balance:</strong> {formatAmount(selectedWallet.balance)}
                </p>
              </div>
              <form onSubmit={handleTopUp} className="space-y-4">
                <div>
                  <label className="label">Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="input"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount to add"
                  />
                </div>
                <div>
                  <label className="label">Description (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    value={topUpDescription}
                    onChange={(e) => setTopUpDescription(e.target.value)}
                    placeholder="e.g., Cash payment at finance office"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTopUpModal(false);
                      setSelectedWallet(null);
                      setTopUpAmount('');
                      setTopUpDescription('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Top Up
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
