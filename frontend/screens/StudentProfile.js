import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function StudentProfile({ user, onLogout }) {
  const initials = (user?.name || '-')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
  const profileItems = [
    { label: 'Name', value: user?.name || '-' },
    { label: 'Email', value: user?.email || '-' },
    { label: 'Student ID', value: user?.student_id || '-' },
    { label: 'Course', value: user?.course || '-' },
    { label: 'Year Level', value: user?.year_level || '-' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>my SMC</Text>
      </View>
      <View style={styles.headerBox}>
        <View style={styles.headerTop}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials || '?'}</Text></View>
          <Text style={styles.headerName}>{user?.name || '-'}</Text>
          <View style={styles.idPill}><Text style={styles.idPillText}>{user?.student_id || '-'}</Text></View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Student Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>✉️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📞</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phone || '-'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🎓</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Course</Text>
            <Text style={styles.infoValue}>{user?.course || '-'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📘</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Year Level</Text>
            <Text style={styles.infoValue}>{user?.year_level || '-'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutIcon}>⎋</Text>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 8 },
  topBar: { height: 56, backgroundColor: '#1976d2', alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1565c0' },
  brand: { color: '#fff', fontWeight: '800', fontSize: 20 },
  headerBox: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  headerTop: { alignItems: 'center', width: '100%' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1976d2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 24 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 8, marginBottom: 6 },
  idPill: { backgroundColor: '#f2f4f7', borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  idPillText: { fontSize: 12, color: '#6b7280' },
  sectionCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  sectionTitle: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  infoIcon: { width: 24, textAlign: 'center', marginRight: 8 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, color: '#111827', fontWeight: '600' },
  infoValue: { fontSize: 12, color: '#6b7280' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6, backgroundColor: '#fafafa', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  profileLabel: { fontSize: 14, color: '#666' },
  profileValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  logoutBtn: { backgroundColor: '#d32f2f', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginHorizontal: 16, marginTop: 12 },
  logoutIcon: { color: '#fff', marginRight: 6 },
  logoutText: { color: '#fff', fontWeight: '600' },
});


