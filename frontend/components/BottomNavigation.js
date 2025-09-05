import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function BottomNavigation({ currentScreen, setCurrentScreen }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={[styles.navItem, currentScreen === 'dashboard' && styles.navItemActive]} onPress={() => setCurrentScreen('dashboard')}>
        <Text style={styles.navIcon}>🏠</Text>
        <Text style={[styles.navText, currentScreen === 'dashboard' && styles.navTextActive]}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navItem, currentScreen === 'requirements' && styles.navItemActive]} onPress={() => setCurrentScreen('requirements')}>
        <Text style={styles.navIcon}>📄</Text>
        <Text style={[styles.navText, currentScreen === 'requirements' && styles.navTextActive]}>Requirements</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navItem, currentScreen === 'profile' && styles.navItemActive]} onPress={() => setCurrentScreen('profile')}>
        <Text style={styles.navIcon}>👤</Text>
        <Text style={[styles.navText, currentScreen === 'profile' && styles.navTextActive]}>Profile</Text>
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


