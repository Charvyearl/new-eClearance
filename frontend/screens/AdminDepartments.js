import React, { useState } from 'react';
import { View, Text, ActivityIndicator, SectionList, TouchableOpacity, TextInput, Button } from 'react-native';

export default function AdminDepartments({ styles, departments, loading, onRefresh, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  function beginEdit(dept) {
    setEditing(dept);
    setName(dept.name || '');
    setDescription(dept.description || '');
  }

  async function save() {
    if (!editing) return;
    if (!name.trim()) return;
    try {
      setSaving(true);
      await onUpdate(editing.id, { name: name.trim(), description: description.trim() });
      setEditing(null);
      setName('');
      setDescription('');
      if (onRefresh) onRefresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Departments</Text>
        <Button title="Refresh" onPress={onRefresh} />
      </View>

      {editing && (
        <View style={[styles.formRow, { marginHorizontal: 12 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Edit Department</Text>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
          <View style={{ flexDirection: 'row' }}>
            <Button title={saving ? 'Saving...' : 'Save'} onPress={save} disabled={saving} />
            <View style={{ width: 8 }} />
            <Button title="Cancel" color="#888" onPress={() => setEditing(null)} disabled={saving} />
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 16 }} />
      ) : (
        <SectionList
          sections={[{ title: 'All Departments', data: departments || [] }]}
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
                {!!item.description && <Text style={styles.userEmail}>{item.description}</Text>}
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => beginEdit(item)}>
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>No departments</Text>}
        />
      )}
    </View>
  );
}


