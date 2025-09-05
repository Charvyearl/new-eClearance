import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image
} from 'react-native';

export default function DepartmentDashboard({ user, onLogout }) {
  // Mock data - replace with real API calls
  const stats = {
    totalRequests: 45,
    pending: 12,
    completed: 8,
    overdue: 3
  };

  const recentRequests = [
    {
      id: 1,
      name: 'Charvy Cortez',
      studentId: 'C22-0045',
      course: 'Information Technology',
      timeAgo: '1 day ago',
      status: 'Pending'
    },
    {
      id: 2,
      name: 'Jose Hinaut',
      studentId: 'C22-0025',
      course: 'Information Technology',
      timeAgo: '2 days ago',
      status: 'Pending'
    },
    {
      id: 3,
      name: 'Michael Rendado',
      studentId: 'C22-0020',
      course: 'Information Technology',
      timeAgo: '3 days ago',
      status: 'Pending'
    }
  ];

  const handleViewPending = () => {
    // Navigate to pending requests
    console.log('View pending requests');
  };

  const handleViewOverdue = () => {
    // Navigate to overdue requests
    console.log('View overdue requests');
  };

  const handleAddRequirements = () => {
    // Navigate to add requirements page
    console.log('Add requirements');
  };

  const handleViewAll = () => {
    // Navigate to all requests
    console.log('View all requests');
  };

  const handleRequestPress = (request) => {
    // Navigate to request details
    console.log('View request:', request.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
        </View>
        
        <View style={styles.headerContent}>
          <Text style={styles.dashboardTitle}>Department Dashboard</Text>
          <Text style={styles.departmentName}>Computer Science Department</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navText, styles.navTextActive]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📄</Text>
          <Text style={styles.navText}>Requirements</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👥</Text>
          <Text style={styles.navText}>Request</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
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
  headerContent: {
    padding: 20,
    paddingBottom: 30,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  departmentName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: 16,
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
});
