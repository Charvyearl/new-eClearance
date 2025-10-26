import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  StatusBar,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RequirementsManagement({ user, onLogout, onNavigate, API_URL, token }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqDueDate, setReqDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  // Each required document: { name: string, type: 'checkbox' | 'file' }
  const [documents, setDocuments] = useState([{ name: '', type: 'checkbox' }]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function loadRequirements() {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/requirements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRequirements(data);
      } else {
        setRequirements([]);
      }
    } catch (e) {
      // no-op display for now
    } finally {
      setLoading(false);
    }
  }

  const handleAddRequirements = () => {
    setIsAddOpen(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep picker open on iOS
    if (selectedDate) {
      setDatePickerDate(selectedDate);
      // Format date as YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setReqDueDate(`${year}-${month}-${day}`);
    }
  };

  const handleEditRequirement = (requirementId) => {
    const r = requirements.find((x) => x.id === requirementId);
    if (!r) return;
    setEditingId(requirementId);
    setReqTitle(r.title || '');
    setReqDescription(r.description || '');
    setReqDueDate(r.due_date || '');
    const docs = Array.isArray(r.required_documents) && r.required_documents.length
      ? r.required_documents.map((d) => (typeof d === 'string' ? { name: d, type: 'checkbox' } : { name: d.name || '', type: (d.type === 'file' ? 'file' : 'checkbox') }))
      : [{ name: '', type: 'checkbox' }];
    setDocuments(docs);
    setIsAddOpen(true);
  };

  const handleDeleteRequirement = (requirementId) => {
    setConfirmDeleteId(requirementId);
  };

  async function performDelete() {
    if (!confirmDeleteId) return;
    try {
      const res = await fetch(`${API_URL}/requirements/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      // Regardless of specific error text, just close and refresh on success
      if (res.ok) {
        await loadRequirements();
      }
    } catch {}
    setConfirmDeleteId(null);
  }

  function resetAddForm() {
    setReqTitle('');
    setReqDescription('');
    setReqDueDate('');
    setDocuments([{ name: '', type: 'checkbox' }]);
  }

  function handleAddDocumentField() {
    setDocuments((prev) => [...prev, { name: '', type: 'checkbox' }]);
  }

  function handleChangeDocumentName(value, index) {
    setDocuments((prev) => prev.map((d, i) => (i === index ? { ...d, name: value } : d)));
  }

  function handleChangeDocumentType(value, index) {
    setDocuments((prev) => prev.map((d, i) => (i === index ? { ...d, type: value } : d)));
  }

  function handleRemoveDocumentField(index) {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveRequirement() {
    try {
      const body = {
        title: reqTitle,
        description: reqDescription,
        due_date: reqDueDate,
        required_documents: documents
          .filter((d) => (d && String(d.name).trim() !== ''))
          .map((d) => ({ name: String(d.name).trim(), type: d.type === 'file' ? 'file' : 'checkbox' })),
      };
      const isEditing = Boolean(editingId);
      const url = isEditing ? `${API_URL}/requirements/${editingId}` : `${API_URL}/requirements`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data && data.message ? data.message : 'Failed to create requirement');
        return;
      }
      setIsAddOpen(false);
      resetAddForm();
      setEditingId(null);
      await loadRequirements();
    } catch (e) {
      alert('Failed to create requirement');
    }
  }

  useEffect(() => {
    loadRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" translucent={false} />
      
      {/* Enhanced Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Image source={require('../assets/mysmclogo.webp')} style={styles.topBarLogo} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Requirements Management</Text>
            <Text style={styles.headerSubtitle}>Create and manage requirements</Text>
          </View>
        </View>
      </View>
      
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>Requirements Management</Text>
          <Text style={styles.welcomeSubtitle}>Create and manage clearance requirements</Text>
        </View>
        <TouchableOpacity style={styles.addRequirementBtn} onPress={handleAddRequirements}>
          <Text style={styles.addRequirementIcon}>➕</Text>
          <Text style={styles.addRequirementText}>Add Requirement</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976d2" />
            <Text style={styles.loadingText}>Loading requirements...</Text>
          </View>
        ) : requirements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📄</Text>
            <Text style={styles.emptyStateTitle}>No requirements yet</Text>
            <Text style={styles.emptyStateSubtitle}>Create your first requirement to get started</Text>
            <TouchableOpacity style={styles.emptyStateBtn} onPress={handleAddRequirements}>
              <Text style={styles.emptyStateBtnText}>Create First Requirement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.requirementsList}>
            {requirements.map((requirement) => (
              <View key={requirement.id} style={styles.requirementCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.requirementIcon}>📋</Text>
                    <Text style={styles.requirementTitle}>{requirement.title}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEditRequirement(requirement.id)}>
                      <Text style={styles.editBtnIcon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteRequirement(requirement.id)}>
                      <Text style={styles.deleteBtnIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.requirementDescription}>{requirement.description || 'No description provided'}</Text>

                  <View style={styles.requirementMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>📅</Text>
                      <Text style={styles.metaText}>Due: {requirement.due_date || 'No due date'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>📄</Text>
                      <Text style={styles.metaText}>{(requirement.required_documents || []).length} documents</Text>
                    </View>
                  </View>

                  <View style={styles.documentsSection}>
                    <Text style={styles.requiredDocsLabel}>Required Documents:</Text>
                    <View style={styles.documentTags}>
                      {(requirement.required_documents || []).map((doc, index) => {
                        const label = typeof doc === 'string' ? doc : (doc && doc.name) ? doc.name : 'Document';
                        const type = typeof doc === 'object' && doc.type === 'file' ? 'file' : 'checkbox';
                        return (
                          <View key={index} style={styles.documentTag}>
                            <Text style={styles.documentIcon}>
                              {type === 'file' ? '📁' : '☑️'}
                            </Text>
                            <Text style={styles.documentText}>{label}</Text>
                            <View style={styles.documentTypeBadge}>
                              <Text style={styles.documentTypeText}>
                                {type === 'file' ? 'File' : 'Checkbox'}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.createdDate}>
                      Created: {new Date(requirement.created_at).toLocaleDateString()}
                    </Text>
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
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.copyrightIcon}>©</Text>
          <Text style={styles.copyrightText}>Copyright 2025 Developed by Cortez Charvy</Text>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal visible={Boolean(confirmDeleteId)} transparent animationType="fade" onRequestClose={() => setConfirmDeleteId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={{ color: '#555', marginBottom: 12 }}>This action cannot be undone.</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#e0e0e0' }]} onPress={() => setConfirmDeleteId(null)}>
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#c62828', marginLeft: 8 }]} onPress={performDelete}>
                <Text style={styles.modalBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Requirement Modal */}
      <Modal visible={isAddOpen} animationType="slide" transparent onRequestClose={() => setIsAddOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '90%' }}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingId ? '✏️ Edit Requirement' : '➕ Add Requirement'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {editingId ? 'Update requirement details' : 'Create a new clearance requirement'}
                </Text>
              </View>

              <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📋 Requirement Title</Text>
              <TextInput
                style={styles.modernInput}
                placeholder="Enter requirement title"
                placeholderTextColor="#9e9e9e"
                value={reqTitle}
                onChangeText={setReqTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📝 Description</Text>
              <TextInput
                style={[styles.modernInput, styles.textAreaInput]}
                placeholder="Enter requirement description"
                placeholderTextColor="#9e9e9e"
                multiline
                numberOfLines={4}
                value={reqDescription}
                onChangeText={setReqDescription}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📅 Due Date</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={reqDueDate}
                  onChange={(e) => setReqDueDate(e.target.value)}
                  style={styles.webDateInput}
                />
              ) : (
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {reqDueDate || 'Select Due Date'}
                  </Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>
              )}
              {showDatePicker && (
                <DateTimePicker
                  value={datePickerDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.documentsSection}>
              <View style={styles.documentsHeader}>
                <Text style={styles.documentsTitle}>📄 Required Documents</Text>
                <Text style={styles.documentsSubtitle}>Define what documents students need to submit</Text>
              </View>
              <View style={styles.documentsList}>
                {documents.map((doc, idx) => (
                  <View key={idx} style={styles.documentItem}>
                    <View style={styles.documentItemHeader}>
                      <Text style={styles.documentItemTitle}>Document {idx + 1}</Text>
                      {documents.length > 1 && (
                        <TouchableOpacity style={styles.removeDocBtn} onPress={() => handleRemoveDocumentField(idx)}>
                          <Text style={styles.removeDocText}>🗑️</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={styles.documentInputRow}>
                      <TextInput
                        style={styles.documentNameInput}
                        placeholder="Enter document name"
                        placeholderTextColor="#9e9e9e"
                        value={doc.name}
                        onChangeText={(v) => handleChangeDocumentName(v, idx)}
                      />
                    </View>
                    
                    <View style={styles.documentTypeSelector}>
                      <Text style={styles.documentTypeLabel}>Type:</Text>
                      {Platform.OS === 'web' ? (
                        <select
                          value={doc.type}
                          onChange={(e) => handleChangeDocumentType(e.target.value, idx)}
                          style={styles.webSelect}
                        >
                          <option value="checkbox">☑️ Checkbox</option>
                          <option value="file">📁 File Upload</option>
                        </select>
                      ) : (
                        <View style={styles.typeButtons}>
                          {[
                            { value: 'checkbox', label: '☑️ Checkbox', icon: '☑️' },
                            { value: 'file', label: '📁 File Upload', icon: '📁' }
                          ].map((type) => (
                            <TouchableOpacity
                              key={type.value}
                              onPress={() => handleChangeDocumentType(type.value, idx)}
                              style={[
                                styles.typeButton,
                                doc.type === type.value && styles.typeButtonActive
                              ]}
                            >
                              <Text style={styles.typeButtonIcon}>{type.icon}</Text>
                              <Text style={[
                                styles.typeButtonText,
                                doc.type === type.value && styles.typeButtonTextActive
                              ]}>
                                {type.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.addDocumentBtn} onPress={handleAddDocumentField}>
                <Text style={styles.addDocumentIcon}>➕</Text>
                <Text style={styles.addDocumentText}>Add Another Document</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => { setIsAddOpen(false); resetAddForm(); }}
              >
                <Text style={styles.cancelBtnText}>❌ Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleSaveRequirement}
              >
                <Text style={styles.saveBtnText}>
                  {editingId ? '💾 Update Requirement' : '🚀 Create Requirement'}
                </Text>
              </TouchableOpacity>
            </View>
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
  addRequirementBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
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
  addRequirementIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addRequirementText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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

  // Requirements list
  requirementsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
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
  requirementIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  requirementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnIcon: {
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnIcon: {
    fontSize: 16,
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
    marginBottom: 16,
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
  documentsSection: {
    marginBottom: 16,
  },
  requiredDocsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 12,
  },
  documentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  documentIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  documentText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginRight: 8,
  },
  documentTypeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  documentTypeText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  confirmCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  modalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalHeader: {
    marginBottom: 24,
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

  // Input styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modernInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#333',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  webDateInput: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    border: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
    fontSize: 14,
    color: '#333',
    boxSizing: 'border-box',
  },
  datePickerButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  datePickerText: {
    fontSize: 14,
    color: '#333',
  },
  calendarIcon: {
    fontSize: 18,
  },

  // Documents section
  documentsSection: {
    marginBottom: 20,
  },
  documentsHeader: {
    marginBottom: 16,
  },
  documentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 4,
  },
  documentsSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  documentsList: {
    gap: 16,
  },
  documentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  documentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  removeDocBtn: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 6,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeDocText: {
    fontSize: 12,
  },
  documentInputRow: {
    marginBottom: 12,
  },
  documentNameInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#333',
  },
  documentTypeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  documentTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  webSelect: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#333',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  typeButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  typeButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#1976d2',
    fontWeight: '600',
  },
  addDocumentBtn: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  addDocumentIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addDocumentText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },

  // Modal actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexShrink: 0,
  },
  cancelBtn: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#1976d2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 14,
    color: '#ffffff',
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
