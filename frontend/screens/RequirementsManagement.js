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
  Platform
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
        {loading ? (
          <Text style={{ textAlign: 'center', color: '#666' }}>Loading requirements...</Text>
        ) : requirements.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#666' }}>No requirements yet</Text>
        ) : (
          requirements.map((requirement) => (
            <View key={requirement.id} style={styles.requirementCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.requirementTitle}>{requirement.title}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleEditRequirement(requirement.id)}>
                    <Text style={styles.actionIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteRequirement(requirement.id)}>
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.requirementDescription}>{requirement.description || 'No description'}</Text>

              <View style={styles.dueDateContainer}>
                <Text style={styles.dueDateIcon}>📅</Text>
                <Text style={styles.dueDateText}>Due: {requirement.due_date || '—'}</Text>
              </View>

              <Text style={styles.requiredDocsLabel}>Required Documents:</Text>
              <View style={styles.documentTags}>
                {(requirement.required_documents || []).map((doc, index) => {
                  const label = typeof doc === 'string' ? doc : (doc && doc.name) ? `${doc.name} • ${doc.type || 'text'}` : 'Document';
                  return (
                    <View key={index} style={styles.documentTag}>
                      <Text style={styles.documentIcon}>📄</Text>
                      <Text style={styles.documentText}>{label}</Text>
                    </View>
                  );
                })}
              </View>

              <Text style={styles.createdDate}>Created: {String(requirement.created_at).slice(0, 10)}</Text>
            </View>
          ))
        )}
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
            <Text style={styles.modalTitle}>Add Requirement</Text>

            <TextInput
              style={styles.input}
              placeholder="Requirement Title"
              value={reqTitle}
              onChangeText={setReqTitle}
            />

            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Description"
              multiline
              value={reqDescription}
              onChangeText={setReqDescription}
            />

            {Platform.OS === 'web' ? (
              <View style={styles.webInputWrapper}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <Text style={styles.webLabel}>Due Date</Text>
                {/* Using native input for web to get type=date */}
                <input
                  type="date"
                  value={reqDueDate}
                  onChange={(e) => setReqDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#f7f7f7',
                    marginTop: 6,
                    marginBottom: 16,
                    display: 'block',
                  }}
                />
              </View>
            ) : (
              <View>
                <Text style={styles.webLabel}>Due Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {reqDueDate || 'Select Due Date'}
                  </Text>
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>
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
            )}

            <Text style={styles.requiredDocsLabel}>Required Documents</Text>
            {documents.map((doc, idx) => (
              <View key={idx} style={{ marginBottom: 10 }}>
                <View style={styles.docRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={`Required Document ${idx + 1}`}
                    value={doc.name}
                    onChangeText={(v) => handleChangeDocumentName(v, idx)}
                  />
                  {documents.length > 1 ? (
                    <TouchableOpacity style={styles.removeDocBtn} onPress={() => handleRemoveDocumentField(idx)}>
                      <Text style={styles.removeDocText}>×</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                {/* Document type selector */}
                {Platform.OS === 'web' ? (
                  <View style={{ marginTop: 6 }}>
                    <Text style={styles.webLabel}>Type</Text>
                    <select
                      value={doc.type}
                      onChange={(e) => handleChangeDocumentType(e.target.value, idx)}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 8,
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#f7f7f7',
                        marginTop: 6,
                      }}
                    >
                      <option value="checkbox">Checkbox</option>
                      <option value="file">Upload File</option>
                    </select>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', marginTop: 6 }}>
                    {['checkbox','file'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => handleChangeDocumentType(t, idx)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderWidth: 1,
                          borderColor: '#90caf9',
                          borderRadius: 6,
                          marginRight: 8,
                          backgroundColor: doc.type === t ? '#e3f2fd' : 'transparent'
                        }}
                      >
                        <Text style={{ color: '#1976d2', fontSize: 12 }}>{t === 'checkbox' ? 'Checkbox' : 'File'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleAddDocumentField}>
              <Text style={styles.secondaryBtnText}>Add Document</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#e0e0e0' }]} onPress={() => { setIsAddOpen(false); resetAddForm(); }}>
                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#1976d2', marginLeft: 8 }]} onPress={handleSaveRequirement}>
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  webInputWrapper: {
    marginTop: 4,
    marginBottom: 8,
    marginRight: 20,

  },
  webLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  datePickerButton: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 14,
    color: '#333',
  },
  calendarIcon: {
    fontSize: 18,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
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
    marginBottom: 12,
    color: '#333',
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeDocBtn: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fce4e4',
  },
  removeDocText: {
    color: '#c62828',
    fontSize: 18,
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  secondaryBtnText: {
    color: '#1976d2',
    fontWeight: '500',
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  modalBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  confirmCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    alignSelf: 'center',
  },
});
