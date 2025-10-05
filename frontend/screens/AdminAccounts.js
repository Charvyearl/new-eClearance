import React, { useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, SectionList, TouchableOpacity, TextInput, Button } from 'react-native';

export default function AdminAccounts(props) {
  const { styles, users, loading, handleDelete, onUpdateUser } = props;

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('admins'); // 'admins' | 'departments' | 'students'

  function beginEdit(user) {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
  }

  async function saveEdit() {
    if (!editingUser) return;
    if (!editName.trim() || !editEmail.trim()) return;
    try {
      setSaving(true);
      await onUpdateUser(editingUser.id, { name: editName.trim(), email: editEmail.trim() });
      setEditingUser(null);
      setEditName('');
      setEditEmail('');
    } finally {
      setSaving(false);
    }
  }

  const sections = useMemo(() => {
    const admins = (users || []).filter((u) => u.role === 'admin');
    const departments = (users || []).filter((u) => u.role === 'department');
    const students = (users || []).filter((u) => u.role === 'student');
    if (activeTab === 'admins') return [{ title: 'Admins', data: admins }];
    if (activeTab === 'departments') return [{ title: 'Departments', data: departments }];
    if (activeTab === 'students') return [{ title: 'Students', data: students }];
    return [];
  }, [users, activeTab]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.adminSection}>
        <Text style={styles.sectionTitle}>Admin Panel - Accounts</Text>
      </View>

      {/* Role Tabs */}
      <View style={[styles.registrationToggle, { marginHorizontal: 16 }]}>
        <TouchableOpacity
          style={[styles.regToggleBtn, activeTab === 'admins' && styles.regToggleBtnActive]}
          onPress={() => setActiveTab('admins')}
        >
          <Text style={[styles.regToggleText, activeTab === 'admins' && styles.regToggleTextActive]}>Admins</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.regToggleBtn, activeTab === 'departments' && styles.regToggleBtnActive]}
          onPress={() => setActiveTab('departments')}
        >
          <Text style={[styles.regToggleText, activeTab === 'departments' && styles.regToggleTextActive]}>Departments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.regToggleBtn, activeTab === 'students' && styles.regToggleBtnActive]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.regToggleText, activeTab === 'students' && styles.regToggleTextActive]}>Students</Text>
        </TouchableOpacity>
      </View>

      {editingUser && (
        <View style={[styles.formRow, { marginHorizontal: 12 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Edit Account</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={editName}
            onChangeText={setEditName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={editEmail}
            onChangeText={setEditEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title={saving ? 'Saving...' : 'Save'} onPress={saveEdit} disabled={saving} />
            <View style={{ width: 8 }} />
            <Button title="Cancel" color="#888" onPress={() => setEditingUser(null)} disabled={saving} />
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 16 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderSectionHeader={({ section: { title, data } }) => (
            data.length > 0 ? (
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>{title}</Text>
            ) : null
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => beginEdit(item)}>
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={(
            <Text style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>No users</Text>
          )}
        />
      )}
    </View>
  );
}


