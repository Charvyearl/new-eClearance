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
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      {/* Header */}
      <View style={styles.topBar}>
        <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
      </View>
      
      <View style={styles.headerContent}>
        <Text style={styles.dashboardTitle}>Department Dashboard</Text>
        <Text style={styles.departmentName}>{departmentName}</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>👥</Text>
            <Text style={styles.summaryNumber}>{stats.totalRequests}</Text>
            <Text style={styles.summaryLabel}>Total Requests</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>⏰</Text>
            <Text style={styles.summaryNumber}>{stats.pending}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>✅</Text>
            <Text style={styles.summaryNumber}>{stats.completed}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>⚠️</Text>
            <Text style={styles.summaryNumber}>{stats.overdue}</Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleViewPending}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>⏰</Text>
              <Text style={styles.actionText}>Process pending clearance requests</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.pending}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleViewOverdue}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>⚠️</Text>
              <Text style={styles.actionText}>Check Overdue requests</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.overdue}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleAddRequirements}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionText}>Redirect to Add requirements page</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Requests</Text>
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentRequests.map((request) => (
            <TouchableOpacity 
              key={request.id} 
              style={styles.requestCard} 
              onPress={() => handleRequestPress(request)}
            >
              <View style={styles.requestLeft}>
                <Text style={styles.userIcon}>👤</Text>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{request.name}</Text>
                  <Text style={styles.requestDetails}>{request.studentId} • {request.course}</Text>
                  <Text style={styles.requestTime}>{request.timeAgo}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.statusButton}>
                <Text style={styles.statusText}>{request.status}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
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
  container: {
    flex: 1,
    backgroundColor: '#1976d2',
  },
  topBar: {
    height: 56,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1565c0',
  },
  topBarLogo: {
    width: 80,
    height: 30,
    resizeMode: 'contain',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerContent: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,

  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  departmentName: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
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
  statusButton: {
    backgroundColor: '#ffa726',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  navContainer: {
    backgroundColor: 'white',
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
