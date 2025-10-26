import React, { useState } from 'react';
import { View, Text, ActivityIndicator, SectionList, TouchableOpacity, TextInput, Button, ScrollView, Image } from 'react-native';

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
    <ScrollView style={styles.adminDepartmentsContainer} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.adminDepartmentsCard}>
        <View style={styles.adminDepartmentsHeader}>
          <View style={styles.adminDepartmentsTitleContainer}>
            <Text style={styles.adminDepartmentsTitle}>🏢 Department Management</Text>
            <Text style={styles.adminDepartmentsSubtitle}>Manage departments and their settings</Text>
          </View>
          <View style={styles.adminDepartmentsIcon}>
            <Text style={styles.adminDepartmentsIconText}>⚙️</Text>
          </View>
        </View>

        {/* Statistics Card */}
        <View style={styles.departmentStatsContainer}>
          <View style={styles.departmentStatCard}>
            <Text style={styles.departmentStatNumber}>{(departments || []).length}</Text>
            <Text style={styles.departmentStatLabel}>Total Departments</Text>
          </View>
          <View style={styles.departmentStatCard}>
            <Text style={styles.departmentStatNumber}>
              {(departments || []).filter(d => d.description && d.description.trim()).length}
            </Text>
            <Text style={styles.departmentStatLabel}>With Descriptions</Text>
          </View>
        </View>
      </View>

      {/* Edit Department Form */}
      {editing && (
        <View style={styles.editDepartmentCard}>
          <View style={styles.editDepartmentHeader}>
            <Text style={styles.editDepartmentTitle}>✏️ Edit Department</Text>
            <Text style={styles.editDepartmentSubtitle}>Update department information</Text>
          </View>
          
          <View style={styles.editDepartmentForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Department Name</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🏛️</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Enter department name"
                  placeholderTextColor="#9e9e9e"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📝</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Enter department description"
                  placeholderTextColor="#9e9e9e"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
            
            <View style={styles.editDepartmentActions}>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={save}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditing(null)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Departments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Loading departments...</Text>
        </View>
      ) : (
        <View style={styles.departmentsListCard}>
          <SectionList
            sections={[{ title: 'All Departments', data: departments || [] }]}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.departmentsListContent}
            renderSectionHeader={({ section: { title, data } }) => (
              data.length > 0 ? (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderTitle}>{title}</Text>
                  <Text style={styles.sectionHeaderCount}>{data.length} {data.length === 1 ? 'department' : 'departments'}</Text>
                </View>
              ) : null
            )}
            ItemSeparatorComponent={() => <View style={styles.departmentSeparator} />}
            renderItem={({ item }) => (
              <View style={styles.departmentCard}>
                <View style={styles.departmentInfo}>
                  <View style={styles.departmentAvatar}>
                    <Text style={styles.departmentAvatarText}>🏛️</Text>
                  </View>
                  <View style={styles.departmentDetails}>
                    <Text style={styles.departmentName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.departmentDescription}>{item.description}</Text>
                    )}
                    <View style={styles.departmentBadge}>
                      <Text style={styles.departmentBadgeText}>Department</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.departmentActions}>
                  <TouchableOpacity style={styles.editDepartmentBtn} onPress={() => beginEdit(item)}>
                    <Text style={styles.editDepartmentBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteDepartmentBtn} onPress={() => onDelete(item.id)}>
                    <Text style={styles.deleteDepartmentBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={(
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🏢</Text>
                <Text style={styles.emptyStateTitle}>No departments found</Text>
                <Text style={styles.emptyStateSubtitle}>No departments have been created yet</Text>
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}


