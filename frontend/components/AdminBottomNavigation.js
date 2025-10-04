import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AdminBottomNavigation({ currentTab, setCurrentTab }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, currentTab === 'panel' && styles.navItemActive]}
        onPress={() => setCurrentTab('panel')}
      >
        <Text style={styles.navIcon}>📝</Text>
        <Text style={[styles.navText, currentTab === 'panel' && styles.navTextActive]}>Registration</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navItem, currentTab === 'accounts' && styles.navItemActive]}
        onPress={() => setCurrentTab('accounts')}
      >
        <Text style={styles.navIcon}>👥</Text>
        <Text style={[styles.navText, currentTab === 'accounts' && styles.navTextActive]}>Accounts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navItem, currentTab === 'departments' && styles.navItemActive]}
        onPress={() => setCurrentTab('departments')}
      >
        <Text style={styles.navIcon}>🏢</Text>
        <Text style={[styles.navText, currentTab === 'departments' && styles.navTextActive]}>Departments</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingVertical: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  navItemActive: { backgroundColor: '#f0f0f0', borderRadius: 8, marginHorizontal: 4 },
  navIcon: { fontSize: 20, marginBottom: 4 },
  navText: { fontSize: 12, color: '#666' },
  navTextActive: { color: '#1976d2', fontWeight: '600' },
});


