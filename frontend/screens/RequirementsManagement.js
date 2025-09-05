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

export default function RequirementsManagement({ user, onLogout, onNavigate }) {
  // Mock data - replace with real API calls
  const requirements = [
    {
      id: 1,
      title: 'Library Clearance',
      description: 'Return all borrowed books and pay outstanding fees',
      dueDate: '1/15/2025',
      requiredDocuments: ['2D books borrowed'],
      completed: 45,
      pending: 22,
      createdDate: '1/1/2025'
    }
  ];

  const handleAddRequirements = () => {
    // Navigate to add requirements form
    console.log('Add new requirements');
  };

  const handleEditRequirement = (requirementId) => {
    // Navigate to edit requirement
    console.log('Edit requirement:', requirementId);
  };

  const handleDeleteRequirement = (requirementId) => {
    // Delete requirement
    console.log('Delete requirement:', requirementId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      
      {/* Header */}
      <View style={styles.topBar}>
        <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
      </View>
      
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>Requirements Management</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddRequirements}>
              <Text style={styles.addButtonText}>+ Add Requirements</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.pageSubtitle}>Create and manage clearance requirements</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Requirements Cards */}
        {requirements.map((requirement) => (
          <View key={requirement.id} style={styles.requirementCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.requirementTitle}>{requirement.title}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleEditRequirement(requirement.id)}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleDeleteRequirement(requirement.id)}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card Content */}
            <Text style={styles.requirementDescription}>{requirement.description}</Text>
            
            <View style={styles.dueDateContainer}>
              <Text style={styles.dueDateIcon}>📅</Text>
              <Text style={styles.dueDateText}>Due: {requirement.dueDate}</Text>
            </View>

            <Text style={styles.requiredDocsLabel}>Required Documents:</Text>
            <View style={styles.documentTags}>
              {requirement.requiredDocuments.map((doc, index) => (
                <View key={index} style={styles.documentTag}>
                  <Text style={styles.documentIcon}>📄</Text>
                  <Text style={styles.documentText}>{doc}</Text>
                </View>
              ))}
            </View>

            {/* Status Indicators */}
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>✅</Text>
                <Text style={styles.statusText}>{requirement.completed} Completed</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>⏰</Text>
                <Text style={styles.statusText}>{requirement.pending} pending</Text>
              </View>
            </View>

            <Text style={styles.createdDate}>Created: {requirement.createdDate}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => onNavigate && onNavigate('dashboard')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, styles.activeNavItem]} 
          onPress={() => onNavigate && onNavigate('requirements')}
        >
          <Text style={styles.navIcon}>📄</Text>
          <Text style={[styles.navText, styles.activeNavText]}>Requirements</Text>
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
  },
  titleSection: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  requirementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  requirementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dueDateIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  dueDateText: {
    fontSize: 14,
    color: '#666',
  },
  requiredDocsLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  documentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  documentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  documentIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  documentText: {
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
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
});
