import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';

export default function StudentDashboard() {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      <View style={styles.topBar}>
        <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
      </View>

      {/* Removed white header block */}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Clearance Progress</Text>
          <View style={styles.badgeGray}><Text style={styles.badgeGrayText}>6/8 Complete</Text></View>
        </View>
        <Text style={styles.progressLabel}>Overall Progress</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: '75%' }]} /></View>
          <Text style={styles.progressPct}>75%</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={[styles.statNum, { color: '#2e7d32' }]}>6</Text><Text style={styles.statCap}>Completed</Text></View>
          <View style={styles.statItem}><Text style={[styles.statNum, { color: '#ef6c00' }]}>2</Text><Text style={styles.statCap}>Pending</Text></View>
          <View style={styles.statItem}><Text style={[styles.statNum, { color: '#c62828' }]}>1</Text><Text style={styles.statCap}>Missing</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>Recent Activity</Text></View>
        <View style={styles.activityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>Library Clearance</Text>
            <Text style={styles.activityMeta}>2 days ago</Text>
          </View>
          <View style={[styles.badgeDark]}><Text style={styles.badgeDarkText}>Completed</Text></View>
        </View>
        <View style={styles.activityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>Registrar Document</Text>
            <Text style={styles.activityMeta}>3 days ago</Text>
          </View>
          <View style={styles.badgeLight}><Text style={styles.badgeLightText}>Pending</Text></View>
        </View>
        <View style={styles.activityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>Finance Clearance</Text>
            <Text style={styles.activityMeta}>1 week ago</Text>
          </View>
          <View style={[styles.badgeDark]}><Text style={styles.badgeDarkText}>Completed</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>Upcoming Deadlines</Text></View>
        <View style={styles.activityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>Dean Clearance</Text>
            <Text style={styles.activityMeta}>August 30, 2025</Text>
          </View>
          <View style={[styles.badgePriority, { backgroundColor: '#e53935' }]}><Text style={styles.badgePriorityText}>High</Text></View>
        </View>
        <View style={styles.activityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityTitle}>Clinic Clearance</Text>
            <Text style={styles.activityMeta}>August 26, 2025</Text>
          </View>
          <View style={[styles.badgePriority, { backgroundColor: '#9e9e9e' }]}><Text style={styles.badgePriorityText}>Medium</Text></View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  topBar: { height: 56, backgroundColor: '#1976d2', justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1565c0' },
  topBarLogo: { width: 80, height: 30, resizeMode: 'contain' },
  // removed headerContent styles

  card: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  badgeGray: { backgroundColor: '#efefef', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeGrayText: { fontSize: 10, color: '#6b7280' },

  progressLabel: { fontSize: 10, color: '#9ca3af', marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressTrack: { flex: 1, height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, marginRight: 10 },
  progressFill: { height: '100%', backgroundColor: '#111', borderRadius: 4 },
  progressPct: { fontSize: 10, color: '#6b7280' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statCap: { fontSize: 10, color: '#6b7280' },

  activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  activityMeta: { fontSize: 10, color: '#6b7280' },
  badgeDark: { backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeDarkText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  badgeLight: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeLightText: { color: '#6b7280', fontSize: 10, fontWeight: '600' },
  badgePriority: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgePriorityText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});


