import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Wallet } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  login: (rfidCardId: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Mock wallet data based on user type
          const mockWallet = {
            id: userData.id,
            user_id: userData.id,
            balance: userData.user_type === 'admin' ? 1000 : userData.user_type === 'staff' ? 500 : 250,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          };
          setWallet(mockWallet);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setWallet(null);
        }
      } else {
        // No stored auth data, ensure clean state
        setToken(null);
        setUser(null);
        setWallet(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (rfidCardId: string) => {
    try {
      // Mock login for demo purposes - Admin and Staff only
      const mockUsers = {
        'ADMIN001': {
          id: 1,
          rfid_card_id: 'ADMIN001',
          student_id: undefined,
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@school.edu',
          phone: '+1234567890',
          user_type: 'admin' as 'admin' | 'staff' | 'student',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        'STAFF001': {
          id: 2,
          rfid_card_id: 'STAFF001',
          student_id: undefined,
          first_name: 'Staff',
          last_name: 'Member',
          email: 'staff@school.edu',
          phone: '+1234567891',
          user_type: 'staff' as 'admin' | 'staff' | 'student',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      };

      const user = mockUsers[rfidCardId as keyof typeof mockUsers];
      
      if (!user) {
        throw new Error('Access denied. Only admin and staff can access the web dashboard.');
      }

      // Mock wallet data
      const mockWallet = {
        id: user.id,
        user_id: user.id,
        balance: user.user_type === 'admin' ? 1000 : user.user_type === 'staff' ? 500 : 250,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      // Mock token for development
      const mockToken = 'mock-jwt-token-' + user.id;

      setUser(user);
      setWallet(mockWallet);
      setToken(mockToken);
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setWallet(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    wallet,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
