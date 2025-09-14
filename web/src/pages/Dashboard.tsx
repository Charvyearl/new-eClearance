import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CreditCardIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentTransactions from '../components/Dashboard/RecentTransactions';

interface DashboardStats {
  total_users: number;
  total_transactions: number;
  total_revenue: number;
  active_wallets: number;
  daily_transactions: number;
  daily_revenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_transactions: 0,
    total_revenue: 0,
    active_wallets: 0,
    daily_transactions: 0,
    daily_revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // For now, we'll use mock data since we don't have a dashboard stats endpoint yet
        // In a real implementation, you would call: const response = await dashboardAPI.getStats();
        setStats({
          total_users: 1234,
          total_transactions: 1247,
          total_revenue: 45678.90,
          active_wallets: 1234,
          daily_transactions: 567,
          daily_revenue: 3245.75,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'users', name: 'User Management' },
    { id: 'transactions', name: 'Transactions' },
    { id: 'reports', name: 'Reports' }
  ];

  return (
    <div className="space-y-6">
      {/* Finance Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage accounts, monitor transactions, and generate reports.
          </p>
        </div>
        
        {/* Search and Add User */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => window.location.href = '/users'}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.total_revenue)}
          change="+12.5% from last month"
          changeType="increase"
          icon={CurrencyDollarIcon}
          color="green"
        />
        <StatsCard
          title="Active Users"
          value={stats.total_users.toLocaleString()}
          change="+5.2% from last month"
          changeType="increase"
          icon={UsersIcon}
          color="blue"
        />
        <StatsCard
          title="Today's Transactions"
          value={stats.daily_transactions}
          change="+8.3% from yesterday"
          changeType="increase"
          icon={ChartBarIcon}
          color="blue"
        />
        <StatsCard
          title="Pending Top-ups"
          value="23"
          change="Requires approval"
          changeType="neutral"
          icon={CreditCardIcon}
          color="yellow"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-sm text-gray-600 mb-4">Latest transactions and account activities.</p>
            <RecentTransactions />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">User Management</p>
          <button 
            onClick={() => window.location.href = '/users'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Account Management
          </button>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="text-center py-12">
          <p className="text-gray-500">Transaction Management - Coming Soon</p>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="text-center py-12">
          <p className="text-gray-500">Reports - Coming Soon</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
