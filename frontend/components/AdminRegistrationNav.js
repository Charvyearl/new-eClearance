import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AdminRegistrationNav({ mode, setMode }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, mode === 'student' && styles.navItemActive]}
        onPress={() => setMode('student')}
      >
        <Text style={styles.navIcon}>🧑‍🎓</Text>
        <Text style={[styles.navText, mode === 'student' && styles.navTextActive]}>Student</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navItem, mode === 'department' && styles.navItemActive]}
        onPress={() => setMode('department')}
      >
        <Text style={styles.navIcon}>🏢</Text>
        <Text style={[styles.navText, mode === 'department' && styles.navTextActive]}>Department</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingVertical: 8, marginTop: 12 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  navItemActive: { backgroundColor: '#f0f0f0', borderRadius: 8, marginHorizontal: 4 },
  navIcon: { fontSize: 20, marginBottom: 4 },
  navText: { fontSize: 12, color: '#666' },
  navTextActive: { color: '#1976d2', fontWeight: '600' },
});

