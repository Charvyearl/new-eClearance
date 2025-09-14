import React, { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import { Student, Personnel } from '../../types';

interface AccountListProps {
  accountType: 'student' | 'personnel';
  onEdit: (account: Student | Personnel) => void;
  onDelete: (id: number) => void;
  onView: (account: Student | Personnel) => void;
}

const AccountList: React.FC<AccountListProps> = ({
  accountType,
  onEdit,
  onDelete,
  onView
}) => {
  const [accounts, setAccounts] = useState<(Student | Personnel)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = accountType === 'student' 
        ? await adminAPI.getStudents({ 
            page: currentPage, 
            limit: 10, 
            is_active: showActiveOnly ? true : undefined 
          })
        : await adminAPI.getPersonnel({ 
            page: currentPage, 
            limit: 10, 
            is_active: showActiveOnly ? true : undefined 
          });
      
      setAccounts(response.data.data);
      // Note: You might need to adjust this based on your API response structure
      setTotalPages(Math.ceil(response.data.total / 10) || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch accounts if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      fetchAccounts();
    }
  }, [accountType, currentPage, showActiveOnly]);

  const filteredAccounts = accounts.filter(account => {
    const fullName = `${account.first_name} ${account.last_name}`.toLowerCase();
    const email = account.email?.toLowerCase() || '';
    const rfid = account.rfid_card_id.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || 
           email.includes(search) || 
           rfid.includes(search);
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchAccounts}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search ${accountType}s...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active only</span>
          </label>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAccounts.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No {accountType}s found
            </li>
          ) : (
            filteredAccounts.map((account) => (
              <li key={accountType === 'student' ? (account as Student).user_id : (account as Personnel).personnel_id}>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          account.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {account.first_name.charAt(0)}{account.last_name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {account.first_name} {account.last_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {account.email || 'No email'}
                        </p>
                        <p className="text-xs text-gray-400">
                          RFID: {account.rfid_card_id} • Created: {formatDate(account.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(account.balance)}
                      </p>
                      <p className={`text-xs ${
                        account.is_active ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onView(account)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(account)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(accountType === 'student' ? (account as Student).user_id : (account as Personnel).personnel_id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountList;
