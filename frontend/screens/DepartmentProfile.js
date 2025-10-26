import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  StatusBar
} from 'react-native';

export default function DepartmentProfile({ user, onLogout, onNavigate }) {
  // Use real user data
  const departmentInfo = {
    name: user?.department_name || 'Department',
    head: user?.name || 'N/A',
    email: user?.email || 'N/A'
  };

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      
      {/* Header */}
      <View style={styles.topBar}>
        <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
      </View>
      
      <View style={styles.headerContent}>
        {/* Department Icon */}
        <View style={styles.departmentIconContainer}>
          <Text style={styles.departmentIcon}>🏢👥</Text>
        </View>
        
        {/* Department Name */}
        <Text style={styles.departmentName}>{departmentInfo.name}</Text>
        
        {/* Department Portal Button */}
        <TouchableOpacity style={styles.portalButton}>
          <Text style={styles.portalButtonText}>Department Portal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Department Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Account Information</Text>
          
          {/* Department */}
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>🏢</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{departmentInfo.name}</Text>
            </View>
          </View>
          
          {/* Account Name */}
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>👤</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{departmentInfo.head}</Text>
            </View>
          </View>
          
          {/* Email */}
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.infoIcon}>✉️</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{departmentInfo.email}</Text>
            </View>
          </View>
        </View>
        
        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => onNavigate && onNavigate('dashboard')}
          >
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navText}>Dashboard</Text>
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
            style={[styles.navItem, styles.activeNavItem]} 
            onPress={() => onNavigate && onNavigate('profile')}
          >
            <Text style={styles.navIcon}>👤</Text>
            <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
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
  headerContent: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  departmentIconContainer: {
    marginBottom: 16,
  },
  departmentIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  departmentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  portalButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  portalButtonText: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  signOutIcon: {
    fontSize: 16,
    marginRight: 8,
    color: 'white',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
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
  activeNavItem: {
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
  activeNavText: {
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
