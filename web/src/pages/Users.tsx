import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, AcademicCapIcon, UserIcon } from '@heroicons/react/24/outline';
import { User, Student, Personnel } from '../types';
import CreateAccountModal from '../components/Admin/CreateAccountModal';
import AccountList from '../components/Admin/AccountList';
import { useAuth } from '../contexts/AuthContext';

const Users: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'personnel'>('students');

  const handleCreateSuccess = () => {
    // Refresh will be handled by the AccountList components
    console.log('Account created successfully');
  };

  const handleEdit = (account: Student | Personnel) => {
    // Handle edit functionality
    console.log('Edit account:', account);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        console.log('Deleting account:', id);
        // The AccountList component will handle the actual deletion
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const handleView = (account: Student | Personnel) => {
    // Handle view functionality
    console.log('View account:', account);
  };

  // Debug authentication state
  useEffect(() => {
    console.log('Users page - isAuthenticated:', isAuthenticated);
    console.log('Users page - user:', user);
    console.log('Users page - token:', localStorage.getItem('token'));
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Please log in to access account management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student and personnel accounts
          </p>
        </div>
        <button
          onClick={() => {
            console.log('Create Account button clicked, setting showCreateModal to true');
            setShowCreateModal(true);
          }}
           className="flex items-center px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 transition-all duration-200 shadow-[0_4px_14px_0_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.4)] border-2 border-black"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Account
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Students
          </button>
          <button
            onClick={() => setActiveTab('personnel')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'personnel'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserIcon className="h-5 w-5 mr-2" />
            Personnel
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'students' && (
        <AccountList
          accountType="student"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      {activeTab === 'personnel' && (
        <AccountList
          accountType="personnel"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Users;
