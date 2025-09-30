import axios from 'axios';
import { Platform } from 'react-native';

// Determine sensible defaults for emulator/simulator vs device
// - Android emulator: 10.0.2.2 maps to host localhost
// - iOS simulator: localhost works
// - Physical devices: set CASHLESS_API_URL to your machine IP (e.g., http://192.168.1.10:3000)
const DEFAULT_BASE_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

// Allow override via Expo config env or process.env
const BASE_URL =
  (typeof process !== 'undefined' && process.env && (process.env.CASHLESS_API_URL || process.env.EXPO_PUBLIC_CASHLESS_API_URL)) ||
  DEFAULT_BASE_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const authAPI = {
  loginWithRfid: async (rfidCardId) => {
    const res = await api.post('/auth/login', { rfid_card_id: rfidCardId });
    return res.data;
  },
  verify: async () => {
    const res = await api.get('/auth/verify');
    return res.data;
  },
};

export const walletAPI = {
  getBalance: async () => {
    const res = await api.get('/wallets/balance');
    return res.data;
  },
  getTransactions: async (params = {}) => {
    const res = await api.get('/wallets/transactions', { params });
    return res.data;
  },
};

export const menuAPI = {
  getItems: async (params = {}) => {
    const res = await api.get('/menu/items', { params });
    return res.data;
  },
  getProducts: async (params = {}) => {
    const res = await api.get('/menu/products', { params });
    return res.data;
  },
};

export const getBaseUrl = () => BASE_URL;


