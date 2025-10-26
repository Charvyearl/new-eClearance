import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  StatusBar,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';

export default function DepartmentRequests({ user, onLogout, onNavigate, API_URL, token }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [requests, setRequests] = useState([]);
  const [viewing, setViewing] = useState(null); // holds full submission object
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const filterOptions = [
    'All Status',
    'submitted',
    'approved',
    'rejected',
    'overdue'
  ];

  async function loadRequests() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/requirements/submissions`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) {
        // shape items for display
        setRequests(data.map((r) => ({
          id: r.id,
          name: String(r.student_name || r.student_identifier || r.student_user_id),
          studentId: String(r.student_identifier || r.student_user_id),
          course: String(r.student_course || ''),
          timeAgo: new Date(r.created_at).toLocaleString(),
          createdAt: new Date(r.created_at), // Store original date for overdue calculation
          status: (r.status || 'submitted').toLowerCase(),
          requirementTitle: r.requirement_title || 'Requirement'
        })));
      } else {
        setRequests([]);
      }
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRequests(); }, [token]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('All Status');
  };

  async function handleViewRequest(requestId) {
    try {
      const res = await fetch(`${API_URL}/requirements/submissions/${requestId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setViewing(data);
    } catch {}
  }

  async function updateStatus(requestId, action) {
    try {
      const res = await fetch(`${API_URL}/requirements/submissions/${requestId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        await loadRequests();
      }
    } catch {}
  }

  const getStatusColor = (status, createdAt) => {
    // Check if overdue (older than 7 days and still pending)
    const daysSinceSubmission = Math.ceil((new Date() - createdAt) / (1000 * 60 * 60 * 24));
    const isPending = status.toLowerCase() === 'submitted';
    const isOverdue = daysSinceSubmission > 7 && isPending;
    
    if (isOverdue) {
      return '#FF5722'; // Orange-red for overdue
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
        return '#666';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const filteredRequests = requests.filter(request => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
                         request.name.toLowerCase().includes(searchLower) ||
                         request.studentId.toLowerCase().includes(searchLower) ||
                         request.course.toLowerCase().includes(searchLower) ||
                         request.requirementTitle.toLowerCase().includes(searchLower);
    
    let matchesFilter = true;
    
    if (filterStatus === 'All Status') {
      matchesFilter = true;
    } else if (filterStatus === 'overdue') {
      // Check if request is overdue (older than 7 days and still pending)
      const daysSinceSubmission = Math.ceil((new Date() - request.createdAt) / (1000 * 60 * 60 * 24));
      const isPending = request.status.toLowerCase() === 'submitted';
      matchesFilter = daysSinceSubmission > 7 && isPending;
    } else {
      matchesFilter = request.status.toLowerCase() === filterStatus.toLowerCase();
    }
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
        <View style={styles.topBar}>
          <View style={styles.topBarContent}>
            <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Department Requests</Text>
              <Text style={styles.headerSubtitle}>Manage clearance requests</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading requests...</Text>
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
            <Text style={styles.headerTitle}>Department Requests</Text>
            <Text style={styles.headerSubtitle}>Manage clearance requests</Text>
          </View>
        </View>
      </View>
      
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>👥 Clearance Requests</Text>
          <Text style={styles.welcomeSubtitle}>Review and manage student clearance submissions</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{requests.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {requests.filter(r => r.status === 'submitted').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enhanced Search and Filter Bar */}
        <View style={styles.searchFilterCard}>
          <View style={styles.searchSection}>
            <Text style={styles.searchSectionTitle}>🔍 Search & Filter</Text>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, ID, course, or requirement"
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor="#9e9e9e"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
              <Text style={styles.filterIcon}>🔽</Text>
              <Text style={styles.filterText}>{filterStatus}</Text>
              <Text style={styles.filterChevron}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              {filteredRequests.length} of {requests.length} requests
            </Text>
            <Text style={styles.resultsSubtext}>
              {filterStatus !== 'All Status' ? `Filtered by: ${filterStatus}` : 'All requests'}
            </Text>
          </View>
          {(searchQuery.length > 0 || filterStatus !== 'All Status') && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
              <Text style={styles.clearFiltersIcon}>🗑️</Text>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976d2" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>
              {requests.length === 0 ? 'No requests yet' : 'No matching requests'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {requests.length === 0 
                ? 'Student clearance requests will appear here' 
                : 'Try adjusting your search or filter criteria'
              }
            </Text>
            {(searchQuery.length > 0 || filterStatus !== 'All Status') && (
              <TouchableOpacity onPress={clearFilters} style={styles.emptyStateBtn}>
                <Text style={styles.emptyStateBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.requestsList}>
            {filteredRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.requestLeft}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>👤</Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requirementTitle}>{request.requirementTitle}</Text>
                      <Text style={styles.studentInfo}>
                        {request.name} • {request.course}
                      </Text>
                      <Text style={styles.requestTime}>{request.timeAgo}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { backgroundColor: getStatusColor(request.status, request.createdAt) }
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {(() => {
                          const daysSinceSubmission = Math.ceil((new Date() - request.createdAt) / (1000 * 60 * 60 * 24));
                          const isPending = request.status.toLowerCase() === 'submitted';
                          const isOverdue = daysSinceSubmission > 7 && isPending;
                          return isOverdue ? 'Overdue' : request.status;
                        })()}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => handleViewRequest(request.id)}>
                    <Text style={styles.viewBtnIcon}>👁️</Text>
                    <Text style={styles.viewBtnText}>View Details</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.approveBtn} 
                      onPress={() => updateStatus(request.id, 'approve')}
                    >
                      <Text style={styles.approveBtnIcon}>✅</Text>
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.rejectBtn} 
                      onPress={() => updateStatus(request.id, 'reject')}
                    >
                      <Text style={styles.rejectBtnIcon}>❌</Text>
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
            style={[styles.navItem, styles.activeNavItem]} 
            onPress={() => onNavigate && onNavigate('requests')}
          >
            <Text style={styles.navIcon}>👥</Text>
            <Text style={[styles.navText, styles.activeNavText]}>Request</Text>
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

      {/* Enhanced Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>🔽 Filter by Status</Text>
              <Text style={styles.filterModalSubtitle}>Select a status to filter requests</Text>
            </View>
            
            <View style={styles.filterOptionsList}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterOption,
                    filterStatus === option && styles.filterOptionSelected
                  ]}
                  onPress={() => handleFilterChange(option)}
                >
                  <View style={styles.filterOptionContent}>
                    <Text style={styles.filterOptionIcon}>
                      {option === 'All Status' ? '📋' :
                       option === 'submitted' ? '⏳' :
                       option === 'approved' ? '✅' :
                       option === 'rejected' ? '❌' : '⚠️'}
                    </Text>
                    <Text style={[
                      styles.filterOptionText,
                      filterStatus === option && styles.filterOptionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </View>
                  {filterStatus === option && (
                    <Text style={styles.filterCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.filterCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.filterCloseText}>Close Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

       {/* Enhanced View Submission Modal */}
       <Modal
         visible={Boolean(viewing)}
         transparent={true}
         animationType="slide"
         onRequestClose={() => setViewing(null)}
       >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
           {viewing && (
             <>
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>📄 Submission Details</Text>
                    <Text style={styles.modalSubtitle}>Review student submission</Text>
                  </View>
                  
                  <View style={styles.submissionInfo}>
                    <View style={styles.submissionHeader}>
                      <Text style={styles.submissionId}>#{String(viewing.id)}</Text>
                      <Text style={styles.submissionTitle}>
                        {(viewing.requirement && viewing.requirement.title) || 'Requirement'}
                      </Text>
                    </View>
                    <Text style={styles.studentInfo}>Student: {String(viewing.student_user_id)}</Text>
                  </View>

                  <Text style={{ fontWeight: '600', marginBottom: 6 }}>Submitted Responses:</Text>
            <View style={{ gap: 8 }}>
              {((viewing.requirement && viewing.requirement.required_documents) || []).map((doc, index) => {
                const isObj = typeof doc === 'object' && doc;
                const name = isObj ? (doc.name || `Document ${index+1}`) : String(doc);
                const type = isObj ? (doc.type || 'checkbox') : 'checkbox';
                const resp = (viewing.responses || {})[index] || (viewing.responses || {})[String(index)];
                const isFile = resp && typeof resp === 'object' && (resp.data || resp.name);
                return (
                  <View key={index} style={{ padding: 8, backgroundColor: '#f7f7f7', borderRadius: 8 }}>
                    <Text style={{ marginBottom: 4 }}>{name} {type === 'checkbox' ? '(checkbox)' : '(file)'}</Text>
                    {type === 'checkbox' ? (
                      <Text style={{ color: '#1976d2' }}>{resp ? 'Checked' : 'Unchecked'}</Text>
                    ) : (
                      isFile ? (
                        resp.data ? (
                          <View>
                            {(String(resp.type || '').startsWith('image/')) ? (
                              <View style={{ marginBottom: 8 }}>
                                <View style={{ 
                                  width: '100%', 
                                  height: 220, 
                                  backgroundColor: '#f5f5f5', 
                                  borderRadius: 8, 
                                  borderWidth: 1,
                                  borderColor: '#eee',
                                  overflow: 'hidden'
                                }}>
                                  <Image 
                                    source={{ uri: `data:${resp.type || 'image/jpeg'};base64,${resp.data}` }}
                                    style={{ 
                                      width: '100%', 
                                      height: '100%'
                                    }}
                                    resizeMode="contain"
                                  />
                                </View>
                                <View style={{ 
                                  flexDirection: 'row', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  marginTop: 8 
                                }}>
                                  <Text style={{ color: '#666', fontSize: 12, flex: 1 }}>
                                    {resp.name || 'image.jpg'}
                                  </Text>
                                  {typeof document !== 'undefined' && (
                                    <TouchableOpacity 
                                      style={{ 
                                        backgroundColor: '#1976d2', 
                                        padding: 6, 
                                        borderRadius: 4,
                                        marginLeft: 8
                                      }}
                                      onPress={() => {
                                        try {
                                          const link = document.createElement('a');
                                          link.href = `data:${resp.type || 'image/jpeg'};base64,${resp.data}`;
                                          link.download = resp.name || `image-${index}.jpg`;
                                          link.click();
                                        } catch (error) {
                                          console.error('Error downloading image:', error);
                                        }
                                      }}
                                    >
                                      <Text style={{ color: 'white', fontSize: 11 }}>📥 Download</Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            ) : (String(resp.type || '') === 'application/pdf') ? (
                              <View style={{ marginBottom: 8 }}>
                                <View style={{ 
                                  width: '100%', 
                                  height: 320, 
                                  backgroundColor: '#f5f5f5', 
                                  borderRadius: 8, 
                                  borderWidth: 1,
                                  borderColor: '#ffcc02',
                                  overflow: 'hidden'
                                }}>
                                  {typeof document !== 'undefined' ? (
                                    <iframe 
                                      src={`data:application/pdf;base64,${resp.data}`} 
                                      style={{ 
                                        width: '100%', 
                                        height: '100%',
                                        border: 'none'
                                      }}
                                      onError={(e) => {
                                        console.error('PDF load error:', e);
                                      }}
                                    />
                                  ) : (
                                    <View style={{ 
                                      flex: 1, 
                                      justifyContent: 'center', 
                                      alignItems: 'center',
                                      padding: 20
                                    }}>
                                      <Text style={{ color: '#e65100', fontSize: 14, fontWeight: '600' }}>
                                        📄 PDF Document
                                      </Text>
                                      <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                                        {resp.name || 'document.pdf'}
                                      </Text>
                                      <Text style={{ color: '#999', fontSize: 10, marginTop: 8, textAlign: 'center' }}>
                                        PDF preview not available on mobile
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <View style={{ 
                                  flexDirection: 'row', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  marginTop: 8 
                                }}>
                                  <Text style={{ color: '#666', fontSize: 12, flex: 1 }}>
                                    {resp.name || 'document.pdf'}
                                  </Text>
                                  {typeof document !== 'undefined' && (
                                    <TouchableOpacity 
                                      style={{ 
                                        backgroundColor: '#ff9800', 
                                        padding: 6, 
                                        borderRadius: 4,
                                        marginLeft: 8
                                      }}
                                      onPress={() => {
                                        try {
                                          const link = document.createElement('a');
                                          link.href = `data:application/pdf;base64,${resp.data}`;
                                          link.download = resp.name || `document-${index}.pdf`;
                                          link.click();
                                        } catch (error) {
                                          console.error('Error downloading PDF:', error);
                                        }
                                      }}
                                    >
                                      <Text style={{ color: 'white', fontSize: 11 }}>📥 Download</Text>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            ) : (
                              <View style={{ 
                                padding: 12, 
                                backgroundColor: '#f8f9fa', 
                                borderRadius: 8, 
                                marginBottom: 8,
                                borderWidth: 1,
                                borderColor: '#e0e0e0'
                              }}>
                                <Text style={{ color: '#666', fontSize: 14, fontWeight: '600' }}>
                                  📎 File Attachment
                                </Text>
                                <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                                  {resp.name || resp.type || 'file'}
                                </Text>
                                {typeof document !== 'undefined' && (
                                  <TouchableOpacity 
                                    style={{ 
                                      backgroundColor: '#6c757d', 
                                      padding: 8, 
                                      borderRadius: 4, 
                                      marginTop: 8,
                                      alignItems: 'center'
                                    }}
                                    onPress={() => {
                                      try {
                                        const link = document.createElement('a');
                                        link.href = `data:${resp.type || 'application/octet-stream'};base64,${resp.data}`;
                                        link.download = resp.name || `file-${index}`;
                                        link.click();
                                      } catch (error) {
                                        console.error('Error downloading file:', error);
                                      }
                                    }}
                                  >
                                    <Text style={{ color: 'white', fontSize: 12 }}>📥 Download File</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            )}
                          </View>
                        ) : resp.uri ? (
                          <View>
                            <View style={{ 
                              width: '100%', 
                              height: 220, 
                              backgroundColor: '#f5f5f5', 
                              borderRadius: 8, 
                              marginBottom: 8,
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              <Text style={{ color: '#666', fontSize: 14 }}>📁 File</Text>
                              <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                                {resp.name || 'file'}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <View style={{ 
                            padding: 12, 
                            backgroundColor: '#f8f9fa', 
                            borderRadius: 8, 
                            marginBottom: 8,
                            borderWidth: 1,
                            borderColor: '#e0e0e0'
                          }}>
                            <Text style={{ color: '#666', fontSize: 14 }}>
                              📄 {resp && (resp.name || resp.type || 'file') || 'file'}
                            </Text>
                          </View>
                        )
                      ) : (
                        <Text style={{ color: '#999' }}>No file submitted</Text>
                      )
                    )}
                  </View>
                );
              })}
            </View>
                </ScrollView>

             <View style={styles.modalActions}>
               <View style={styles.actionButtons}>
                 <TouchableOpacity 
                   style={styles.approveActionBtn} 
                   onPress={async () => { await updateStatus(viewing.id, 'approve'); setViewing(null); }}
                 >
                   <Text style={styles.approveActionIcon}>✅</Text>
                   <Text style={styles.approveActionText}>Approve</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={styles.rejectActionBtn} 
                   onPress={async () => { await updateStatus(viewing.id, 'reject'); setViewing(null); }}
                 >
                   <Text style={styles.rejectActionIcon}>❌</Text>
                   <Text style={styles.rejectActionText}>Reject</Text>
                 </TouchableOpacity>
               </View>
               
               <TouchableOpacity 
                 style={styles.closeActionBtn} 
                 onPress={() => setViewing(null)}
               >
                 <Text style={styles.closeActionIcon}>❌</Text>
                 <Text style={styles.closeActionText}>Close</Text>
               </TouchableOpacity>
             </View>
               </>
             )}
           </View>
         </View>
       </Modal>
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
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    minWidth: 60,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Content styles
  content: {
    flex: 1,
    paddingTop: 16,
  },

  // Search and filter styles
  searchFilterCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  filterSection: {
    alignItems: 'flex-end',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#1976d2',
  },
  filterText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
    marginRight: 8,
  },
  filterChevron: {
    fontSize: 12,
    color: '#1976d2',
  },

  // Results header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  resultsInfo: {
    flex: 1,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  resultsSubtext: {
    fontSize: 12,
    color: '#666',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  clearFiltersIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyStateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Request cards
  requestsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatarText: {
    fontSize: 24,
  },
  requestInfo: {
    flex: 1,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  studentInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardActions: {
    padding: 20,
    gap: 12,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  viewBtnIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  viewBtnText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  approveBtnIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  approveBtnText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#F44336',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectBtnIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  rejectBtnText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },

   // Modal styles
   modalBackdrop: {
     flex: 1,
     backgroundColor: 'rgba(0,0,0,0.5)',
     justifyContent: 'flex-end',
     paddingTop: 80, // Space for navigation bar
     paddingHorizontal: 20,
     paddingBottom: 20,
   },
   modalCard: {
     backgroundColor: '#ffffff',
     borderRadius: 20,
     padding: 24,
     height: '85%',
     width: '100%',
     maxWidth: 500,
     marginTop: 20,
     marginHorizontal: 0,
     flexDirection: 'column',
   },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  submissionInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  submissionHeader: {
    marginBottom: 8,
  },
  submissionId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  studentInfo: {
    fontSize: 14,
    color: '#666',
  },
   modalActions: {
     marginTop: 20,
     paddingTop: 20,
     borderTopWidth: 1,
     borderTopColor: '#f0f0f0',
     flexShrink: 0,
   },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  approveActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  approveActionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  approveActionText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  rejectActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#F44336',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectActionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  rejectActionText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  closeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
  },
  closeActionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  closeActionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },

  // Filter modal styles
  filterModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxHeight: '70%',
  },
  filterModalHeader: {
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
    textAlign: 'center',
  },
  filterModalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  filterOptionsList: {
    marginBottom: 20,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  filterCheckmark: {
    fontSize: 18,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  filterCloseButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#1976d2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterCloseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
