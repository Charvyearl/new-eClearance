import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, ActivityIndicator, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';

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
      // Filter out submissions that don't have corresponding requirements
      const recentSubmissions = studentSubmissions
        .filter(sub => {
          const requirement = allRequirements.find(req => req.id === sub.requirement_id);
          return requirement; // Only include submissions with valid requirements
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(sub => {
          const requirement = allRequirements.find(req => req.id === sub.requirement_id);
          return {
            id: sub.id,
            title: requirement.title,
            status: sub.status,
            date: sub.created_at,
            department: requirement.department_name
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
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1976d2" />
            <Text style={styles.loadingText}>Loading your dashboard...</Text>
            <Text style={styles.loadingSubtext}>Please wait while we fetch your clearance progress</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      
      {/* Enhanced Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Clearance Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardIcon}>📊</Text>
              <Text style={styles.cardTitle}>Clearance Progress</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{progress.completed}/{progress.total} Complete</Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
              </View>
              <Text style={styles.progressPercentage}>{progress.percentage}%</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>✅</Text>
              </View>
              <Text style={styles.statNumber}>{progress.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>⏳</Text>
              </View>
              <Text style={styles.statNumber}>{progress.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📋</Text>
              </View>
              <Text style={styles.statNumber}>{progress.total - progress.completed - progress.pending}</Text>
              <Text style={styles.statLabel}>Not Started</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Card */}
        <View style={styles.quickActionsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardIcon}>⚡</Text>
              <Text style={styles.cardTitle}>Quick Actions</Text>
            </View>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionBtn}>
              <Text style={styles.quickActionIcon}>📝</Text>
              <Text style={styles.quickActionText}>View Requirements</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn}>
              <Text style={styles.quickActionIcon}>👤</Text>
              <Text style={styles.quickActionText}>My Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity Card */}
        <View style={styles.activityCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardIcon}>🕒</Text>
              <Text style={styles.cardTitle}>Recent Activity</Text>
            </View>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentActivity.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivity.map((activity, index) => (
                <View key={activity.id || index} style={styles.activityItem}>
                  <View style={styles.activityIconContainer}>
                    <Text style={styles.activityIcon}>
                      {activity.status === 'approved' ? '✅' : 
                       activity.status === 'rejected' ? '❌' : '⏳'}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityMeta}>
                      {new Date(activity.date).toLocaleDateString()} • {activity.department}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    activity.status === 'approved' ? styles.statusSuccess : 
                    activity.status === 'rejected' ? styles.statusError : styles.statusWarning
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {activity.status === 'approved' ? 'Completed' : 
                       activity.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📭</Text>
              <Text style={styles.emptyStateTitle}>No recent activity</Text>
              <Text style={styles.emptyStateSubtitle}>Your recent submissions will appear here</Text>
            </View>
          )}
        </View>

        {/* Student Info Card */}
        <View style={styles.studentInfoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardIcon}>🎓</Text>
              <Text style={styles.cardTitle}>Student Information</Text>
            </View>
          </View>
          <View style={styles.studentInfoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Student ID</Text>
              <Text style={styles.infoValue}>{user?.student_id || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Course</Text>
              <Text style={styles.infoValue}>{user?.course || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Year Level</Text>
              <Text style={styles.infoValue}>{user?.year_level || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  
  // Header styles
  topBar: { 
    backgroundColor: '#1976d2', 
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLogo: { 
    width: 80, 
    height: 30, 
    resizeMode: 'contain' 
  },
  welcomeSection: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Scroll view
  scrollView: { 
    flex: 1,
    paddingTop: 8,
  },
  
  // Loading styles
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 18, 
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Card styles
  progressCard: { 
    backgroundColor: '#ffffff', 
    marginHorizontal: 20, 
    marginVertical: 8, 
    borderRadius: 20, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionsCard: { 
    backgroundColor: '#ffffff', 
    marginHorizontal: 20, 
    marginVertical: 8, 
    borderRadius: 20, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityCard: { 
    backgroundColor: '#ffffff', 
    marginHorizontal: 20, 
    marginVertical: 8, 
    borderRadius: 20, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  studentInfoCard: { 
    backgroundColor: '#ffffff', 
    marginHorizontal: 20, 
    marginVertical: 8, 
    marginBottom: 20,
    borderRadius: 20, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Card header styles
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1a237e' 
  },
  
  // Progress styles
  progressBadge: { 
    backgroundColor: '#e3f2fd', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  progressBadgeText: { 
    fontSize: 12, 
    fontWeight: '600',
    color: '#1976d2' 
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 12,
    fontWeight: '500',
  },
  progressContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  progressTrack: { 
    flex: 1, 
    height: 12, 
    backgroundColor: '#e0e0e0', 
    borderRadius: 6, 
    marginRight: 12 
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: '#1976d2', 
    borderRadius: 6 
  },
  progressPercentage: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#1976d2' 
  },
  
  // Stats grid
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: { 
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statNumber: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1a237e',
    marginBottom: 4,
  },
  statLabel: { 
    fontSize: 12, 
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Quick actions
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  // Activity styles
  viewAllBtn: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
  },
  activityList: {
    gap: 12,
  },
  activityItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#333',
    marginBottom: 4,
  },
  activityMeta: { 
    fontSize: 12, 
    color: '#666' 
  },
  
  // Status badges
  statusBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  statusBadgeText: { 
    color: '#ffffff', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  statusSuccess: { 
    backgroundColor: '#2e7d32' 
  },
  statusWarning: { 
    backgroundColor: '#ef6c00' 
  },
  statusError: { 
    backgroundColor: '#c62828' 
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Student info
  studentInfoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
});


