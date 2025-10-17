import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image, StatusBar, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

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
          subData.forEach((s) => { submissionsMap[s.requirement_id] = s.status || 'submitted'; });
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
      const body = { responses: responses[requirementId] || {} };
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
      // Mark this requirement as pending in the UI and clear draft responses
      setRequirements((prev) => prev.map((r) => r.id === requirementId ? { ...r, status: 'pending' } : r));
      setResponses((prev) => ({ ...prev, [requirementId]: {} }));
      setMySubmissions((prev) => ({ ...prev, [requirementId]: 'submitted' }));
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
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      <View style={{ height: 56, backgroundColor: '#1976d2', justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1565c0' }}>
        <Image source={require('../assets/mysmclogo.webp')} style={{ width: 80, height: 30, resizeMode: 'contain' }} />
      </View>
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>Requirements</Text>
      </View>
      <View style={styles.reqFilterRow}>
        <TouchableOpacity style={[styles.reqFilterBtn, requirementsFilter === 'all' && styles.reqFilterBtnActive]} onPress={() => setRequirementsFilter('all')}>
          <Text style={[styles.reqFilterText, requirementsFilter === 'all' && styles.reqFilterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.reqFilterBtn, requirementsFilter === 'pending' && styles.reqFilterBtnActive]} onPress={() => setRequirementsFilter('pending')}>
          <Text style={[styles.reqFilterText, requirementsFilter === 'pending' && styles.reqFilterTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.reqFilterBtn, requirementsFilter === 'completed' && styles.reqFilterBtnActive]} onPress={() => setRequirementsFilter('completed')}>
          <Text style={[styles.reqFilterText, requirementsFilter === 'completed' && styles.reqFilterTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.statusBadge, renderStatusBadgeStyle(item.status || 'not_started')]}>
                <Text style={styles.statusBadgeText}>{renderStatusText(item.status || 'not_started')}</Text>
              </View>
            </View>
            <Text style={styles.reqDescription}>{item.description || 'No description'}</Text>
            <Text style={styles.reqSubtext}>Due: {item.due_date || 'No due date'}</Text>

            {(item.status || 'not_started') !== 'completed' && (
              <View style={styles.reqDocsRow}>
                <Text style={styles.reqDocsLabel}>Required Documents:</Text>
                {(() => {
                  const isLocked = (mySubmissions[item.id] || item.status) === 'submitted' || (item.status || 'not_started') === 'pending';
                  return (item.required_documents || []).map((doc, index) => {
                    const isObj = typeof doc === 'object' && doc;
                    const name = isObj ? (doc.name || 'Document') : String(doc);
                    const type = isObj ? (doc.type || 'checkbox') : 'checkbox';
                    return (
                      <View key={index} style={{ marginBottom: 10, marginHorizontal: 16 }}>
                        <Text style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{name}</Text>
                        {type === 'checkbox' ? (
                          <TouchableOpacity
                            disabled={isLocked}
                            onPress={() => { if (isLocked) return; setResponse(item.id, index, !(responses[item.id]?.[index])); }}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                          >
                            <View style={{ width: 18, height: 18, borderWidth: 1, borderColor: '#1976d2', marginRight: 8, backgroundColor: responses[item.id]?.[index] ? '#1976d2' : 'transparent', opacity: isLocked ? 0.5 : 1 }} />
                            <Text style={{ color: '#1976d2', opacity: isLocked ? 0.5 : 1 }}>{responses[item.id]?.[index] ? 'Checked' : 'Check'}</Text>
                          </TouchableOpacity>
                        ) : (
                          // File upload: Web uses input, React Native uses DocumentPicker
                          (typeof document !== 'undefined' && typeof FileReader !== 'undefined' ? (
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              disabled={isLocked}
                              onChange={async (e) => {
                                if (isLocked) { return; }
                                const f = e.target.files && e.target.files[0];
                                if (!f) { setResponse(item.id, index, null); return; }
                                // Limit to 2MB to avoid oversized payloads in DB
                                const maxBytes = 2 * 1024 * 1024;
                                if (f.size > maxBytes) {
                                  alert('File too large. Please upload a file under 2 MB.');
                                  e.target.value = '';
                                  return;
                                }
                                try {
                                  const base64 = await fileToBase64Web(f);
                                  setResponse(item.id, index, { name: f.name, type: f.type, size: f.size, data: base64 });
                                } catch {
                                  setResponse(item.id, index, null);
                                }
                              }}
                            />
                          ) : (
                            <View style={styles.fileUploadContainer}>
                              {responses[item.id]?.[index] ? (
                                <View style={styles.fileInfoContainer}>
                                  <Text style={styles.fileName}>
                                    📄 {responses[item.id][index].name || 'Selected file'}
                                  </Text>
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
                                    <Text style={styles.removeFileText}>Remove</Text>
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <TouchableOpacity 
                                  style={[styles.fileUploadBtn, isLocked && styles.fileUploadBtnDisabled]}
                                  onPress={() => pickDocument(item.id, index)}
                                  disabled={isLocked}
                                >
                                  <Text style={[styles.fileUploadText, isLocked && styles.fileUploadTextDisabled]}>
                                    📁 Choose File
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          ))
                        )}
                      </View>
                    );
                  });
                })()}
              </View>
            )}

            {(item.status || 'not_started') !== 'completed' && (
              ( (mySubmissions[item.id] || item.status) === 'submitted' || (item.status || 'not_started') === 'pending' ? (
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => unsubmitRequirement(item.id)}>
                  <Text style={styles.secondaryBtnText}>Unsubmit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.primaryBtn} onPress={() => submitRequirement(item.id)}>
                  <Text style={styles.primaryBtnText}>Submit Request</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <Text style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>Loading requirements...</Text>
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>No requirements</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  pageHeaderTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, color: '#fff', fontWeight: '500' },
  reqFilterRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
  reqFilterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, backgroundColor: '#fff', marginRight: 8 },
  reqFilterBtnActive: { backgroundColor: '#f0f0f0', borderColor: '#d0d0d0' },
  reqFilterText: { fontSize: 12, color: '#666' },
  reqFilterTextActive: { color: '#1976d2', fontWeight: '600' },
  reqDescription: { fontSize: 14, color: '#333', marginBottom: 4 },
  reqSubtext: { fontSize: 12, color: '#666', marginBottom: 12 },
  reqDocsRow: { marginBottom: 12 },
  reqDocsLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  reqChipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  reqChip: { backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  reqChipText: { fontSize: 12, color: '#333' },
  primaryBtn: { backgroundColor: '#000', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { backgroundColor: '#E0E0E0', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  secondaryBtnText: { color: '#333', fontWeight: '600' },
  
  // File upload styles
  fileUploadContainer: { marginTop: 8 },
  fileUploadBtn: { 
    backgroundColor: '#f0f8ff', 
    borderWidth: 1, 
    borderColor: '#1976d2', 
    borderStyle: 'dashed', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  fileUploadBtnDisabled: { 
    backgroundColor: '#f5f5f5', 
    borderColor: '#ccc', 
    opacity: 0.5 
  },
  fileUploadText: { 
    color: '#1976d2', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  fileUploadTextDisabled: { 
    color: '#999' 
  },
  fileInfoContainer: { 
    backgroundColor: '#f8f9fa', 
    borderWidth: 1, 
    borderColor: '#e9ecef', 
    borderRadius: 8, 
    padding: 12 
  },
  fileName: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#333', 
    marginBottom: 4 
  },
  fileSize: { 
    fontSize: 12, 
    color: '#666', 
    marginBottom: 8 
  },
  removeFileBtn: { 
    backgroundColor: '#dc3545', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 4, 
    alignSelf: 'flex-start' 
  },
  removeFileText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '500' 
  },
});


