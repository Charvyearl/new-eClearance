import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

export default function StudentDashboard({ API_URL, token, user }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, pending: 0, total: 0, percentage: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch requirements and submissions data
  const fetchDashboardData = async () => {
    if (!token || !user) return;
    
    try {
      setLoading(true);
      
      // Fetch requirements
      const requirementsRes = await fetch(`${API_URL}/requirements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const requirementsData = await requirementsRes.json();
      const allRequirements = Array.isArray(requirementsData) ? requirementsData : [];
      
      // Fetch student's submissions
      const submissionsRes = await fetch(`${API_URL}/requirements/submissions/mine`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const submissionsData = await submissionsRes.json();
      const studentSubmissions = Array.isArray(submissionsData) ? submissionsData : [];
      
      // Create submissions map for quick lookup
      const submissionsMap = {};
      studentSubmissions.forEach(sub => {
        submissionsMap[sub.requirement_id] = sub;
      });
      
      // Calculate progress
      const totalRequirements = allRequirements.length;
      let completed = 0;
      let pending = 0;
      
      allRequirements.forEach(req => {
        const submission = submissionsMap[req.id];
        if (submission) {
          if (submission.status === 'approved') {
            completed++;
          } else if (submission.status === 'submitted' || submission.status === 'reviewed') {
            pending++;
          }
        }
      });
      
      const percentage = totalRequirements > 0 ? Math.round((completed / totalRequirements) * 100) : 0;
      
      setProgress({
        completed,
        pending,
        total: totalRequirements,
        percentage
      });
      
      // Set requirements and submissions
      setRequirements(allRequirements);
      setSubmissions(studentSubmissions);
      
      // Generate recent activity (last 5 submissions)
      const recentSubmissions = studentSubmissions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(sub => {
          const requirement = allRequirements.find(req => req.id === sub.requirement_id);
          return {
            id: sub.id,
            title: requirement ? requirement.title : 'Unknown Requirement',
            status: sub.status,
            date: sub.created_at,
            department: requirement ? requirement.department_name : 'Unknown Department'
          };
        });
      
      setRecentActivity(recentSubmissions);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty states on error
      setProgress({ completed: 0, pending: 0, total: 0, percentage: 0 });
      setRequirements([]);
      setSubmissions([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [token, user]);

  if (loading) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
        <View style={styles.topBar}>
          <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      <View style={styles.topBar}>
        <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Clearance Progress Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Clearance Progress</Text>
            <View style={styles.badgeGray}>
              <Text style={styles.badgeGrayText}>{progress.completed}/{progress.total} Complete</Text>
            </View>
        </View>
        <Text style={styles.progressLabel}>Overall Progress</Text>
        <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
            </View>
            <Text style={styles.progressPct}>{progress.percentage}%</Text>
        </View>

        <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: '#2e7d32' }]}>{progress.completed}</Text>
              <Text style={styles.statCap}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: '#ef6c00' }]}>{progress.pending}</Text>
              <Text style={styles.statCap}>Pending</Text>
        </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: '#c62828' }]}>{progress.total - progress.completed - progress.pending}</Text>
              <Text style={styles.statCap}>Not Started</Text>
      </View>
          </View>
        </View>

        {/* Recent Activity Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
          </View>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <View key={activity.id || index} style={styles.activityRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityMeta}>
                    {new Date(activity.date).toLocaleDateString()} • {activity.department}
                  </Text>
                </View>
                <View style={[
                  styles.badgeDark, 
                  activity.status === 'approved' ? styles.badgeSuccess : 
                  activity.status === 'rejected' ? styles.badgeError : styles.badgeWarning
                ]}>
                  <Text style={styles.badgeDarkText}>
                    {activity.status === 'approved' ? 'Completed' : 
                     activity.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </Text>
        </View>
          </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No recent activity</Text>
          )}
      </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  topBar: { height: 56, backgroundColor: '#1976d2', justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1565c0' },
  topBarLogo: { width: 80, height: 30, resizeMode: 'contain' },
  scrollView: { flex: 1 },
  
  // Loading styles
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },

  // Card styles
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  emptyStateText: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingVertical: 20 },

  // Progress styles
  badgeGray: { backgroundColor: '#efefef', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeGrayText: { fontSize: 10, color: '#6b7280' },
  progressLabel: { fontSize: 10, color: '#9ca3af', marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressTrack: { flex: 1, height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, marginRight: 10 },
  progressFill: { height: '100%', backgroundColor: '#1976d2', borderRadius: 4 },
  progressPct: { fontSize: 10, color: '#6b7280' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statCap: { fontSize: 10, color: '#6b7280' },

  // Activity styles
  activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  activityMeta: { fontSize: 10, color: '#6b7280' },
  
  // Badge styles
  badgeDark: { backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeDarkText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  badgeSuccess: { backgroundColor: '#2e7d32' },
  badgeWarning: { backgroundColor: '#ef6c00' },
  badgeError: { backgroundColor: '#c62828' },
});


