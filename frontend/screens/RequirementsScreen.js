import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image, StatusBar, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

export default function RequirementsScreen({ API_URL, token, user }) {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requirementsFilter, setRequirementsFilter] = useState('all');
  const [responses, setResponses] = useState({}); // { [requirementId]: { [docIndex]: value } }
  const [mySubmissions, setMySubmissions] = useState({}); // { requirementId: status }

  async function loadRequirementsAndSubmissions() {
    if (!token) return;
    try {
      setLoading(true);
      // 1) Load requirements
      const reqRes = await fetch(`${API_URL}/requirements`, { headers: { 'Authorization': `Bearer ${token}` } });
      const reqData = await reqRes.json();
      const baseRequirements = Array.isArray(reqData) ? reqData : [];

      // 2) Load my submissions
      let submissionsMap = {};
      try {
        const subRes = await fetch(`${API_URL}/requirements/submissions/mine`, { headers: { 'Authorization': `Bearer ${token}` } });
        const subData = await subRes.json();
        if (Array.isArray(subData)) {
          // Since backend returns submissions ordered by ID DESC, the first occurrence of each requirement_id is the latest
          subData.forEach((s) => { 
            if (!submissionsMap[s.requirement_id]) { // Only take the first (latest) submission for each requirement
              submissionsMap[s.requirement_id] = s.status || 'submitted'; 
            }
          });
        }
      } catch {}

      // 3) Persist submissions in state
      setMySubmissions(submissionsMap);

      // 4) Merge: map submission status -> UI status
      const merged = baseRequirements.map((r) => {
        const subStatus = submissionsMap[r.id];
        if (!subStatus) return r;
        let uiStatus = 'not_started';
        if (subStatus === 'submitted' || subStatus === 'reviewed') uiStatus = 'pending';
        else if (subStatus === 'approved') uiStatus = 'completed';
        else if (subStatus === 'rejected') uiStatus = 'not_started';
        return { ...r, status: uiStatus };
      });
      setRequirements(merged);
    } catch (e) {
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequirementsAndSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function getFilteredRequirements() {
    switch (requirementsFilter) {
      case 'pending':
        return requirements.filter((r) => r.status === 'pending');
      case 'completed':
        return requirements.filter((r) => r.status === 'completed');
      default:
        return requirements;
    }
  }

  function startProcess(requirementId) {
    setRequirements((prev) => prev.map((r) => r.id === requirementId ? { ...r, status: 'pending' } : r));
  }

  function markCompleted(requirementId) {
    setRequirements((prev) => prev.map((r) => r.id === requirementId ? { ...r, status: 'completed' } : r));
  }

  function setResponse(requirementId, docIndex, value) {
    setResponses((prev) => ({
      ...prev,
      [requirementId]: { ...(prev[requirementId] || {}), [docIndex]: value }
    }));
  }

  function fileToBase64Web(file) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } catch (e) { reject(e); }
    });
  }

  async function pickDocument(requirementId, docIndex) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (limit to 2MB)
        const maxBytes = 2 * 1024 * 1024;
        if (file.size && file.size > maxBytes) {
          Alert.alert('File Too Large', 'Please upload a file under 2 MB.');
          return;
        }

        // For React Native, we'll store the file URI and metadata
        // The actual file upload to server would need to be handled differently
        setResponse(requirementId, docIndex, {
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
          size: file.size || 0,
          uri: file.uri,
          isLocalFile: true
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  }

  async function submitRequirement(requirementId) {
    try {
      // Process responses to convert file URIs to base64
      const processedResponses = { ...(responses[requirementId] || {}) };
      
      // Convert file URIs to base64 for React Native
      for (const key in processedResponses) {
        const resp = processedResponses[key];
        if (resp && typeof resp === 'object' && resp.isLocalFile && resp.uri) {
          try {
            let base64;
            
            // Check if we're on web or mobile
            if (typeof document !== 'undefined') {
              // Web: Use FileReader
              base64 = await new Promise((resolve, reject) => {
                fetch(resp.uri)
                  .then(res => res.blob())
                  .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const result = reader.result;
                      const base64Data = result.split(',')[1];
                      resolve(base64Data);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                  })
                  .catch(reject);
              });
            } else {
              // Mobile: Use expo-file-system
              base64 = await FileSystem.readAsStringAsync(resp.uri, {
                encoding: 'base64',
              });
            }
            
            processedResponses[key] = {
              name: resp.name,
              type: resp.type,
              size: resp.size,
              data: base64 // Now storing base64 data instead of URI
            };
          } catch (error) {
            console.error('Error converting file to base64:', error);
            alert('Failed to process file: ' + resp.name);
            return;
          }
        }
      }
      
      const body = { responses: processedResponses };
      const res = await fetch(`${API_URL}/requirements/${requirementId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data && data.message ? data.message : 'Failed to submit');
        return;
      }
      alert('Submitted');
      
      // Update local state immediately
      setMySubmissions((prev) => ({ ...prev, [requirementId]: 'submitted' }));
      setRequirements((prev) => prev.map((r) => r.id === requirementId ? { ...r, status: 'pending' } : r));
      setResponses((prev) => ({ ...prev, [requirementId]: {} }));
      
      // Reload data from server to ensure consistency
      setTimeout(async () => {
        await loadRequirementsAndSubmissions();
      }, 500);
    } catch (e) {
      alert('Failed to submit');
    }
  }

  async function unsubmitRequirement(requirementId) {
    try {
      const res = await fetch(`${API_URL}/requirements/${requirementId}/submit`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data && data.message ? data.message : 'Failed to unsubmit');
        return;
      }
      setRequirements((prev) => prev.map((r) => r.id === requirementId ? { ...r, status: 'not_started' } : r));
      setMySubmissions((prev) => {
        const copy = { ...prev };
        delete copy[requirementId];
        return copy;
      });
      
      // Reload requirements and submissions to get the latest data
      await loadRequirementsAndSubmissions();
    } catch (e) {
      alert('Failed to unsubmit');
    }
  }

  const renderStatusBadgeStyle = (status) => {
    if (status === 'completed') return { backgroundColor: '#4CAF50' };
    if (status === 'pending') return { backgroundColor: '#FF9800' };
    return { backgroundColor: '#9E9E9E' };
  };

  const renderStatusText = (status) => {
    if (status === 'completed') return 'Completed';
    if (status === 'pending') return 'Pending';
    return 'Not Started';
  };

  const data = getFilteredRequirements();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      
      {/* Enhanced Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Requirements</Text>
            <Text style={styles.headerSubtitle}>Complete your clearance</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          <TouchableOpacity 
            style={[styles.filterTab, requirementsFilter === 'all' && styles.filterTabActive]} 
            onPress={() => setRequirementsFilter('all')}
          >
            <Text style={styles.filterTabIcon}>📋</Text>
            <Text style={[styles.filterTabText, requirementsFilter === 'all' && styles.filterTabTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterTab, requirementsFilter === 'pending' && styles.filterTabActive]} 
            onPress={() => setRequirementsFilter('pending')}
          >
            <Text style={styles.filterTabIcon}>⏳</Text>
            <Text style={[styles.filterTabText, requirementsFilter === 'pending' && styles.filterTabTextActive]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterTab, requirementsFilter === 'completed' && styles.filterTabActive]} 
            onPress={() => setRequirementsFilter('completed')}
          >
            <Text style={styles.filterTabIcon}>✅</Text>
            <Text style={[styles.filterTabText, requirementsFilter === 'completed' && styles.filterTabTextActive]}>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Requirements List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading requirements...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.requirementCard}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardIcon}>
                    {item.status === 'completed' ? '✅' : 
                     item.status === 'pending' ? '⏳' : '📋'}
                  </Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <View style={[styles.statusBadge, renderStatusBadgeStyle(item.status || 'not_started')]}>
                  <Text style={styles.statusBadgeText}>{renderStatusText(item.status || 'not_started')}</Text>
                </View>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <Text style={styles.requirementDescription}>{item.description || 'No description provided'}</Text>
                <View style={styles.requirementMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📅</Text>
                    <Text style={styles.metaText}>Due: {item.due_date || 'No due date'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>🏢</Text>
                    <Text style={styles.metaText}>{item.department_name || 'Department'}</Text>
                  </View>
                </View>
              </View>

              {/* Documents Section */}
              {(item.status || 'not_started') !== 'completed' && (
                <View style={styles.documentsSection}>
                  <View style={styles.documentsHeader}>
                    <Text style={styles.documentsTitle}>📄 Required Documents</Text>
                  </View>
                  <View style={styles.documentsList}>
                    {(() => {
                      const isLocked = (mySubmissions[item.id] || item.status) === 'submitted' || (item.status || 'not_started') === 'pending';
                      return (item.required_documents || []).map((doc, index) => {
                        const isObj = typeof doc === 'object' && doc;
                        const name = isObj ? (doc.name || 'Document') : String(doc);
                        const type = isObj ? (doc.type || 'checkbox') : 'checkbox';
                        return (
                          <View key={index} style={styles.documentItem}>
                            <View style={styles.documentHeader}>
                              <Text style={styles.documentName}>{name}</Text>
                              <View style={styles.documentTypeBadge}>
                                <Text style={styles.documentTypeText}>
                                  {type === 'checkbox' ? 'Checkbox' : 'File Upload'}
                                </Text>
                              </View>
                            </View>
                            
                            {type === 'checkbox' ? (
                              <TouchableOpacity
                                disabled={isLocked}
                                onPress={() => { if (isLocked) return; setResponse(item.id, index, !(responses[item.id]?.[index])); }}
                                style={[styles.checkboxContainer, isLocked && styles.checkboxDisabled]}
                              >
                                <View style={[styles.checkbox, responses[item.id]?.[index] && styles.checkboxChecked]}>
                                  {responses[item.id]?.[index] && <Text style={styles.checkboxIcon}>✓</Text>}
                                </View>
                                <Text style={[styles.checkboxText, isLocked && styles.checkboxTextDisabled]}>
                                  {responses[item.id]?.[index] ? 'Completed' : 'Mark as Complete'}
                                </Text>
                              </TouchableOpacity>
                            ) : (
                              <View style={styles.fileUploadContainer}>
                                {responses[item.id]?.[index] ? (
                                  <View style={styles.fileInfoContainer}>
                                    <View style={styles.fileInfoHeader}>
                                      <Text style={styles.fileIcon}>📄</Text>
                                      <Text style={styles.fileName}>{responses[item.id][index].name || 'Selected file'}</Text>
                                    </View>
                                    <Text style={styles.fileSize}>
                                      {responses[item.id][index].size ? 
                                        `${Math.round(responses[item.id][index].size / 1024)} KB` : 
                                        'Unknown size'
                                      }
                                    </Text>
                                    <TouchableOpacity 
                                      style={styles.removeFileBtn}
                                      onPress={() => setResponse(item.id, index, null)}
                                      disabled={isLocked}
                                    >
                                      <Text style={styles.removeFileText}>🗑️ Remove</Text>
                                    </TouchableOpacity>
                                  </View>
                                ) : (
                                  <TouchableOpacity 
                                    style={[styles.fileUploadBtn, isLocked && styles.fileUploadBtnDisabled]}
                                    onPress={() => pickDocument(item.id, index)}
                                    disabled={isLocked}
                                  >
                                    <Text style={styles.fileUploadIcon}>📁</Text>
                                    <Text style={[styles.fileUploadText, isLocked && styles.fileUploadTextDisabled]}>
                                      Choose File
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      });
                    })()}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              {(item.status || 'not_started') !== 'completed' && (
                <View style={styles.actionButtons}>
                  {(mySubmissions[item.id] || item.status) === 'submitted' || (item.status || 'not_started') === 'pending' ? (
                    <TouchableOpacity style={styles.unsubmitBtn} onPress={() => unsubmitRequirement(item.id)}>
                      <Text style={styles.unsubmitBtnIcon}>↩️</Text>
                      <Text style={styles.unsubmitBtnText}>Unsubmit</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.submitBtn} onPress={() => submitRequirement(item.id)}>
                      <Text style={styles.submitBtnIcon}>🚀</Text>
                      <Text style={styles.submitBtnText}>Submit Request</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>No requirements found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {requirementsFilter === 'all' ? 'No requirements available' :
                 requirementsFilter === 'pending' ? 'No pending requirements' :
                 'No completed requirements'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Screen styles
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

  // Filter styles
  filterContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabs: {
    flexDirection: 'row',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#e3f2fd',
  },
  filterTabIcon: {
    fontSize: 16,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#1976d2',
  },

  // Loading styles
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

  // List styles
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Card styles
  requirementCard: {
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
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },

  // Card content
  cardContent: {
    padding: 20,
  },
  requirementDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  requirementMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },

  // Documents section
  documentsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  documentsHeader: {
    marginBottom: 16,
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  documentsList: {
    gap: 12,
  },
  documentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  documentTypeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  documentTypeText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '600',
  },

  // Checkbox styles
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1976d2',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1976d2',
  },
  checkboxIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  checkboxTextDisabled: {
    color: '#999',
  },

  // File upload styles
  fileUploadContainer: {
    marginTop: 8,
  },
  fileUploadBtn: {
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#1976d2',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fileUploadBtnDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    opacity: 0.5,
  },
  fileUploadIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  fileUploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  fileUploadTextDisabled: {
    color: '#999',
  },
  fileInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
  },
  fileInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  removeFileBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  removeFileText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Action buttons
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1976d2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unsubmitBtn: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  unsubmitBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  unsubmitBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },

  // Empty state
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
    lineHeight: 20,
  },
});


