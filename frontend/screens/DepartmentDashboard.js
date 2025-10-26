import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';

export default function DepartmentDashboard({ user, onLogout, onNavigate, API_URL, token }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    completed: 0,
    overdue: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [departmentName, setDepartmentName] = useState('Department');

  // Fetch department dashboard data
  const fetchDashboardData = async () => {
    if (!token || !user) return;
    
    try {
      setLoading(true);
      
      // Fetch department submissions
      const submissionsRes = await fetch(`${API_URL}/requirements/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const submissionsData = await submissionsRes.json();
      const allSubmissions = Array.isArray(submissionsData) ? submissionsData : [];
      
      // Calculate statistics
      const totalRequests = allSubmissions.length;
      let pending = 0;
      let completed = 0;
      let overdue = 0;
      
      allSubmissions.forEach(submission => {
        if (submission.status === 'submitted' || submission.status === 'reviewed') {
          pending++;
        } else if (submission.status === 'approved') {
          completed++;
        }
        // For now, we'll consider overdue as submissions older than 7 days that are still pending
        const submissionDate = new Date(submission.created_at);
        const daysSinceSubmission = Math.ceil((new Date() - submissionDate) / (1000 * 60 * 60 * 24));
        if (daysSinceSubmission > 7 && (submission.status === 'submitted' || submission.status === 'reviewed')) {
          overdue++;
        }
      });
      
      setStats({
        totalRequests,
        pending,
        completed,
        overdue
      });
      
      // Get recent requests (last 5 submissions)
      const recentSubmissions = allSubmissions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(submission => {
          const timeAgo = getTimeAgo(new Date(submission.created_at));
          return {
            id: submission.id,
            name: submission.student_name || 'Unknown Student',
            studentId: submission.student_id || 'N/A',
            course: submission.student_course || 'Unknown Course',
            timeAgo,
            status: submission.status === 'approved' ? 'Completed' : 
                   submission.status === 'rejected' ? 'Rejected' : 'Pending'
          };
        });
      
      setRecentRequests(recentSubmissions);
      
      // Set department name (you might want to fetch this from a departments API)
      setDepartmentName(user.department_name || 'Department');
      
    } catch (error) {
      console.error('Error fetching department dashboard data:', error);
      // Set empty states on error
      setStats({ totalRequests: 0, pending: 0, completed: 0, overdue: 0 });
      setRecentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
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

  const handleViewPending = () => {
    // Navigate to pending requests
    onNavigate && onNavigate('requests');
  };

  const handleViewOverdue = () => {
    // Navigate to overdue requests
    onNavigate && onNavigate('requests');
  };

  const handleAddRequirements = () => {
    // Navigate to add requirements page
    onNavigate && onNavigate('requirements');
  };

  const handleViewAll = () => {
    // Navigate to all requests
    onNavigate && onNavigate('requests');
  };

  const handleRequestPress = (request) => {
    // Navigate to request details
    onNavigate && onNavigate('requests');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
        <View style={styles.topBar}>
          <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#1976d2" />
            <Text style={styles.loadingText}>Loading department dashboard...</Text>
            <Text style={styles.loadingSubtext}>Please wait while we fetch your data</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      
      {/* Enhanced Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Department Portal</Text>
            <Text style={styles.headerSubtitle}>Clearance Management</Text>
          </View>
        </View>
      </View>
      
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.departmentName}>{departmentName}</Text>
          <Text style={styles.welcomeSubtitle}>Manage clearance requests efficiently</Text>
        </View>
        <View style={styles.welcomeIcon}>
          <Text style={styles.welcomeIconText}>🏢</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics Dashboard */}
        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>📊 Request Statistics</Text>
            <Text style={styles.statsSubtitle}>Overview of clearance requests</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>👥</Text>
              </View>
              <Text style={styles.statNumber}>{stats.totalRequests}</Text>
              <Text style={styles.statLabel}>Total Requests</Text>
              <View style={styles.statTrend}>
                <Text style={styles.statTrendText}>All time</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>⏳</Text>
              </View>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
              <View style={styles.statTrend}>
                <Text style={styles.statTrendText}>Needs attention</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>✅</Text>
              </View>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
              <View style={styles.statTrend}>
                <Text style={styles.statTrendText}>Successfully processed</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>⚠️</Text>
              </View>
              <Text style={styles.statNumber}>{stats.overdue}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
              <View style={styles.statTrend}>
                <Text style={styles.statTrendText}>Requires immediate action</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsHeader}>
            <Text style={styles.quickActionsTitle}>⚡ Quick Actions</Text>
            <Text style={styles.quickActionsSubtitle}>Common tasks and shortcuts</Text>
          </View>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleViewPending}>
              <View style={styles.quickActionIconContainer}>
                <Text style={styles.quickActionIcon}>⏳</Text>
              </View>
              <Text style={styles.quickActionTitle}>Process Pending</Text>
              <Text style={styles.quickActionSubtitle}>Review pending requests</Text>
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>{stats.pending}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} onPress={handleViewOverdue}>
              <View style={styles.quickActionIconContainer}>
                <Text style={styles.quickActionIcon}>⚠️</Text>
              </View>
              <Text style={styles.quickActionTitle}>Check Overdue</Text>
              <Text style={styles.quickActionSubtitle}>Urgent requests</Text>
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>{stats.overdue}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} onPress={handleAddRequirements}>
              <View style={styles.quickActionIconContainer}>
                <Text style={styles.quickActionIcon}>📄</Text>
              </View>
              <Text style={styles.quickActionTitle}>Add Requirements</Text>
              <Text style={styles.quickActionSubtitle}>Create new requirements</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} onPress={handleViewAll}>
              <View style={styles.quickActionIconContainer}>
                <Text style={styles.quickActionIcon}>📋</Text>
              </View>
              <Text style={styles.quickActionTitle}>View All Requests</Text>
              <Text style={styles.quickActionSubtitle}>Complete request list</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Requests */}
        <View style={styles.recentRequestsContainer}>
          <View style={styles.recentRequestsHeader}>
            <View style={styles.recentRequestsTitleContainer}>
              <Text style={styles.recentRequestsTitle}>🕒 Recent Requests</Text>
              <Text style={styles.recentRequestsSubtitle}>Latest clearance submissions</Text>
            </View>
            <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewAll}>
              <Text style={styles.viewAllBtnText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentRequests.length > 0 ? (
            <View style={styles.requestsList}>
              {recentRequests.map((request) => (
                <TouchableOpacity 
                  key={request.id} 
                  style={styles.requestCard} 
                  onPress={() => handleRequestPress(request)}
                >
                  <View style={styles.requestAvatar}>
                    <Text style={styles.requestAvatarText}>👤</Text>
                  </View>
                  <View style={styles.requestContent}>
                    <Text style={styles.requestName}>{request.name}</Text>
                    <Text style={styles.requestDetails}>{request.studentId} • {request.course}</Text>
                    <Text style={styles.requestTime}>{request.timeAgo}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    request.status === 'Completed' ? styles.statusCompleted :
                    request.status === 'Rejected' ? styles.statusRejected : styles.statusPending
                  ]}>
                    <Text style={styles.statusBadgeText}>{request.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📭</Text>
              <Text style={styles.emptyStateTitle}>No recent requests</Text>
              <Text style={styles.emptyStateSubtitle}>New clearance requests will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemActive]} 
            onPress={() => onNavigate && onNavigate('dashboard')}
          >
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={[styles.navText, styles.navTextActive]}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => onNavigate && onNavigate('requirements')}
          >
            <Text style={styles.navIcon}>📄</Text>
            <Text style={styles.navText}>Requirements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => onNavigate && onNavigate('requests')}
          >
            <Text style={styles.navIcon}>👥</Text>
            <Text style={styles.navText}>Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => onNavigate && onNavigate('profile')}
          >
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyrightIcon}>©</Text>
          <Text style={styles.copyrightText}>Copyright 2025 Developed by Cortez Charvy</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Screen styles
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    resizeMode: 'contain',
  },
  headerInfo: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },

  // Welcome section
  welcomeSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeIconText: {
    fontSize: 28,
  },

  // Content styles
  content: {
    flex: 1,
    paddingTop: 16,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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

  // Statistics styles
  statsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
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
  statsHeader: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  statTrend: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statTrendText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },

  // Quick actions styles
  quickActionsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
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
  quickActionsHeader: {
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  quickActionsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  quickActionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  quickActionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  quickActionBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Recent requests styles
  recentRequestsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
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
  recentRequestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  recentRequestsTitleContainer: {
    flex: 1,
  },
  recentRequestsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  recentRequestsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  viewAllBtn: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewAllBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  requestAvatar: {
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
  requestAvatarText: {
    fontSize: 18,
  },
  requestContent: {
    flex: 1,
  },
  requestName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  requestDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 11,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusCompleted: {
    backgroundColor: '#2e7d32',
  },
  statusRejected: {
    backgroundColor: '#c62828',
  },
  statusPending: {
    backgroundColor: '#ef6c00',
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

  // Navigation styles
  navContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#666',
  },
  navTextActive: {
    color: '#1976d2',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  copyrightIcon: {
    color: '#6b7280',
    fontSize: 12,
    marginRight: 4,
  },
  copyrightText: {
    color: '#6b7280',
    fontSize: 10,
    textAlign: 'center',
  },
});
