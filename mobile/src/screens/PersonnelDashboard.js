import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import PersonnelHome from './PersonnelHome';
import TransactionHistory from './TransactionHistory';
import BottomNavigation from '../components/BottomNavigation';
import { walletAPI } from '../api/client';

export default function PersonnelDashboard({ onLogout, user, initialBalance = 0 }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'transaction'
  const [balance, setBalance] = useState(initialBalance);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await walletAPI.getBalance();
        if (isMounted && res?.success) {
          setBalance(res.data.balance);
        }
      } catch (e) {
        // Silent
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            if (onLogout) {
              onLogout();
            }
          },
        },
      ]
    );
  };

  const handleMyReservation = () => {
    Alert.alert('My Reservation', 'View your current reservations');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Image 
          source={require('../../assets/images/mysmclogo.webp')} 
          style={styles.topBarLogo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.dashboardHeader}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.studentName}>{user ? `${user.first_name} ${user.last_name}` : 'Personnel'}</Text>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceIcon}>💳</Text>
          <Text style={styles.balanceTitle}>Balance</Text>
        </View>
        <Text style={styles.balanceSubtitle}>Your current wallet balance</Text>
        <View style={styles.balanceAmountContainer}>
          <Text style={styles.balanceAmount}>₱{Number(balance).toFixed(2)}</Text>
        </View>
        <View style={styles.studentInfo}>
          <View style={styles.studentInfoColumn}>
            <Text style={styles.studentInfoLabel}>Student ID</Text>
            <Text style={styles.studentInfoValue}>{user?.student_id || '—'}</Text>
          </View>
          <View style={styles.studentInfoColumn}>
            <Text style={styles.studentInfoLabel}>Student Name</Text>
            <Text style={styles.studentInfoValue}>{user ? `${user.first_name} ${user.last_name}` : '—'}</Text>
          </View>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {activeTab === 'home' ? <PersonnelHome /> : <TransactionHistory />}
      </View>

      {/* Floating Action Button - My Reservation (only on home tab) */}
      {activeTab === 'home' && (
        <TouchableOpacity style={styles.fab} onPress={handleMyReservation}>
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>My Reservation</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topBar: {
    backgroundColor: '#87CEEB',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarLogo: {
    width: 100,
    height: 30,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  dashboardHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'flex-end',
  },
  welcomeSection: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  studentName: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  balanceCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  balanceIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  balanceSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  balanceAmountContainer: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentInfoColumn: {
    flex: 1,
  },
  studentInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  studentInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 80, // Above bottom navigation
    right: 20,
    backgroundColor: '#87CEEB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
