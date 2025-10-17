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
  Modal
} from 'react-native';

export default function DepartmentRequests({ user, onLogout, onNavigate, API_URL, token }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [requests, setRequests] = useState([]);
  const [viewing, setViewing] = useState(null); // holds full submission object
  const [showFilterModal, setShowFilterModal] = useState(false);
  
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      
      {/* Header */}
      <View style={styles.topBar}>
        <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
      </View>
      
      <View style={styles.headerContent}>
        <Text style={styles.pageTitle}>Department Requests</Text>
        <Text style={styles.pageSubtitle}>Manage clearance requests from students</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search and Filter Bar */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, ID, course, or requirement"
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.filterSeparator} />
          
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
            <Text style={styles.filterIcon}>🔽</Text>
            <Text style={styles.filterText}>{filterStatus}</Text>
            <Text style={styles.filterChevron}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Results Count and Clear Filters */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredRequests.length} of {requests.length} requests
          </Text>
          {(searchQuery.length > 0 || filterStatus !== 'All Status') && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Request Cards */}
        <View style={styles.requestsList}>
          {filteredRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestLeft}>
                <View style={styles.userIcon}>
                  <Text style={styles.userIconText}>👤</Text>
                </View>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{request.requirementTitle}</Text>
                  <Text style={styles.requestDetails}>
                    {request.name} • {request.course}
                  </Text>
                  <Text style={styles.requestTime}>{request.timeAgo}</Text>
                </View>
              </View>
              
              <View style={styles.requestRight}>
                <View 
                  style={[
                    styles.statusButton, 
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
                
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <TouchableOpacity style={styles.viewButton} onPress={() => handleViewRequest(request.id)}>
                    <Text style={styles.viewText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewButton} onPress={() => updateStatus(request.id, 'approve')}>
                    <Text style={styles.viewText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewButton} onPress={() => updateStatus(request.id, 'reject')}>
                    <Text style={styles.viewText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
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

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.filterModalCard}>
            <Text style={styles.filterModalTitle}>Filter by Status</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  filterStatus === option && styles.filterOptionSelected
                ]}
                onPress={() => handleFilterChange(option)}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterStatus === option && styles.filterOptionTextSelected
                ]}>
                  {option}
                </Text>
                {filterStatus === option && (
                  <Text style={styles.filterCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.filterCloseButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.filterCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* View Submission Modal */}
      {viewing ? (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submission #{String(viewing.id)}</Text>
            <Text style={{ color: '#555', marginBottom: 8 }}>{(viewing.requirement && viewing.requirement.title) || 'Requirement'}</Text>
            <Text style={{ color: '#777', marginBottom: 12 }}>Student: {String(viewing.student_user_id)}</Text>

            <Text style={{ fontWeight: '600', marginBottom: 6 }}>Submitted Responses:</Text>
            <View style={{ gap: 8 }}>
              {((viewing.requirement && viewing.requirement.required_documents) || []).map((doc, index) => {
                const isObj = typeof doc === 'object' && doc;
                const name = isObj ? (doc.name || `Document ${index+1}`) : String(doc);
                const type = isObj ? (doc.type || 'checkbox') : 'checkbox';
                const resp = (viewing.responses || {})[index];
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
                              typeof document !== 'undefined' ? (
                                <img src={`data:${resp.type};base64,${resp.data}`} style={{ maxWidth: '100%', height: 220, objectFit: 'contain', borderRadius: 8, border: '1px solid #eee', marginBottom: 8 }} />
                              ) : (
                                <Image 
                                  source={{ uri: `data:${resp.type};base64,${resp.data}` }}
                                  style={{ width: '100%', height: 220, borderRadius: 8, marginBottom: 8 }}
                                  resizeMode="contain"
                                />
                              )
                            ) : (String(resp.type || '') === 'application/pdf') ? (
                              typeof document !== 'undefined' ? (
                                <iframe src={`data:application/pdf;base64,${resp.data}`} style={{ width: '100%', height: 320, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }} />
                              ) : (
                                <View style={{ padding: 12, backgroundColor: '#fff3e0', borderRadius: 8, marginBottom: 8 }}>
                                  <Text style={{ color: '#e65100', fontSize: 14 }}>📄 PDF Document: {resp.name || 'document.pdf'}</Text>
                                  <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>PDF preview not available on mobile</Text>
                                </View>
                              )
                            ) : (
                              <Text style={{ color: '#666', marginBottom: 8 }}>{(resp && (resp.name || resp.type || 'file')) || 'file'}</Text>
                            )}
                            {typeof document !== 'undefined' && (
                              <a href={`data:${resp.type || 'application/octet-stream'};base64,${resp.data}`} download={resp.name || `file-${index}`}>Download</a>
                            )}
                          </View>
                        ) : resp.uri ? (
                          <View>
                            <Image 
                              source={{ uri: resp.uri }}
                              style={{ width: '100%', height: 220, borderRadius: 8, marginBottom: 8 }}
                              resizeMode="contain"
                            />
                            <Text style={{ color: '#666', fontSize: 12 }}>{resp.name || 'File'}</Text>
                          </View>
                        ) : (
                          <Text style={{ color: '#666' }}>{(resp && (resp.name || resp.type || 'file')) || 'file'}</Text>
                        )
                      ) : (
                        <Text style={{ color: '#999' }}>No file submitted</Text>
                      )
                    )}
                  </View>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.viewButton, { backgroundColor: '#4CAF50' }]} onPress={async () => { await updateStatus(viewing.id, 'approve'); setViewing(null); }}>
                  <Text style={[styles.viewText, { color: '#fff' }]}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.viewButton, { backgroundColor: '#F44336' }]} onPress={async () => { await updateStatus(viewing.id, 'reject'); setViewing(null); }}>
                  <Text style={[styles.viewText, { color: '#fff' }]}>Reject</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.viewButton, { backgroundColor: '#e0e0e0' }]} onPress={() => setViewing(null)}>
                <Text style={[styles.viewText, { color: '#333' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  searchFilterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
    color: '#666',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  filterChevron: {
    fontSize: 12,
    color: '#666',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userIconText: {
    fontSize: 20,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  requestDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
  },
  requestRight: {
    alignItems: 'flex-end',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  viewText: {
    fontSize: 12,
    color: '#666',
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
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  // New filter styles
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  clearFiltersButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#666',
  },
  filterModalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '70%',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  filterOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextSelected: {
    color: '#1976d2',
    fontWeight: '500',
  },
  filterCheckmark: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  filterCloseButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  filterCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
