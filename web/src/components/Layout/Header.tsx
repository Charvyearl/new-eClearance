import React from 'react';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - System branding */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cashless Canteen System</h1>
            <p className="text-sm text-gray-600">
              Welcome, {user?.first_name} {user?.last_name} ({user?.user_type})
            </p>
          </div>
        </div>

        {/* Right side - Logout */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
