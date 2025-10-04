import React, { useState } from 'react';
import { View, Text, ActivityIndicator, SectionList, TouchableOpacity, TextInput, Button } from 'react-native';

export default function AdminAccounts(props) {
  const { styles, users, loading, handleDelete, onUpdateUser } = props;

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

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

  const sections = [
    { title: 'Admins', data: (users || []).filter((u) => u.role === 'admin') },
    { title: 'Departments', data: (users || []).filter((u) => u.role === 'department') },
    { title: 'Students', data: (users || []).filter((u) => u.role === 'student') },
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
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


