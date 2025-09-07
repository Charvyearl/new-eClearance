import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function RequirementsScreen({ API_URL, token, user }) {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requirementsFilter, setRequirementsFilter] = useState('all');

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
      // Fallback to empty array on error
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequirements();
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

            <View style={styles.reqDocsRow}>
              <Text style={styles.reqDocsLabel}>Required Documents:</Text>
              <View style={styles.reqChipsRow}>
                {(item.required_documents || []).map((doc, index) => (
                  <View key={index} style={styles.reqChip}><Text style={styles.reqChipText}>{doc}</Text></View>
                ))}
              </View>
            </View>

            {(item.status || 'not_started') === 'not_started' && (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => startProcess(item.id)}>
                <Text style={styles.primaryBtnText}>Start Process</Text>
              </TouchableOpacity>
            )}
            {(item.status || 'not_started') === 'pending' && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => markCompleted(item.id)}>
                <Text style={styles.secondaryBtnText}>Mark as Completed</Text>
              </TouchableOpacity>
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
});


