import React, { useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, SectionList, TouchableOpacity, TextInput, Button, ScrollView, Image } from 'react-native';

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
    <ScrollView style={styles.adminAccountsContainer} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.adminAccountsCard}>
        <View style={styles.adminAccountsHeader}>
          <View style={styles.adminAccountsTitleContainer}>
            <Text style={styles.adminAccountsTitle}>👥 Account Management</Text>
            <Text style={styles.adminAccountsSubtitle}>Manage user accounts and permissions</Text>
          </View>
          <View style={styles.adminAccountsIcon}>
            <Text style={styles.adminAccountsIconText}>⚙️</Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{(users || []).filter(u => u.role === 'admin').length}</Text>
            <Text style={styles.statLabel}>👑 Admins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{(users || []).filter(u => u.role === 'department').length}</Text>
            <Text style={styles.statLabel}>🏢 Departments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{(users || []).filter(u => u.role === 'student').length}</Text>
            <Text style={styles.statLabel}>🎓 Students</Text>
          </View>
        </View>

        {/* Role Tabs */}
        <View style={styles.roleTabs}>
          <TouchableOpacity
            style={[styles.roleTab, activeTab === 'admins' && styles.roleTabActive]}
            onPress={() => setActiveTab('admins')}
          >
            <Text style={[styles.roleTabText, activeTab === 'admins' && styles.roleTabTextActive]}>Admins</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleTab, activeTab === 'departments' && styles.roleTabActive]}
            onPress={() => setActiveTab('departments')}
          >
            <Text style={[styles.roleTabText, activeTab === 'departments' && styles.roleTabTextActive]}>Departments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleTab, activeTab === 'students' && styles.roleTabActive]}
            onPress={() => setActiveTab('students')}
          >
            <Text style={[styles.roleTabText, activeTab === 'students' && styles.roleTabTextActive]}>Students</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit User Form */}
      {editingUser && (
        <View style={styles.editUserCard}>
          <View style={styles.editUserHeader}>
            <Text style={styles.editUserTitle}>✏️ Edit Account</Text>
            <Text style={styles.editUserSubtitle}>Update user information</Text>
          </View>
          
          <View style={styles.editUserForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Enter full name"
                  placeholderTextColor="#9e9e9e"
                  value={editName}
                  onChangeText={setEditName}
                  autoCapitalize="words"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Enter email address"
                  placeholderTextColor="#9e9e9e"
                  value={editEmail}
                  onChangeText={setEditEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
            
            <View style={styles.editUserActions}>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={saveEdit}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingUser(null)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Users List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a237e" />
          <Text style={styles.loadingText}>Loading accounts...</Text>
        </View>
      ) : (
        <View style={styles.usersListCard}>
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.usersListContent}
            renderSectionHeader={({ section: { title, data } }) => (
              data.length > 0 ? (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderTitle}>{title}</Text>
                  <Text style={styles.sectionHeaderCount}>{data.length} {data.length === 1 ? 'account' : 'accounts'}</Text>
                </View>
              ) : null
            )}
            ItemSeparatorComponent={() => <View style={styles.userSeparator} />}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {item.role === 'admin' ? '👑' : item.role === 'department' ? '🏢' : '🎓'}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.userRoleBadge}>
                      <Text style={styles.userRoleText}>
                        {item.role === 'admin' ? 'Administrator' : 
                         item.role === 'department' ? 'Department Staff' : 'Student'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.userActions}>
                  <TouchableOpacity style={styles.editUserBtn} onPress={() => beginEdit(item)}>
                    <Text style={styles.editUserBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteUserBtn} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteUserBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={(
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>👥</Text>
                <Text style={styles.emptyStateTitle}>No {activeTab} found</Text>
                <Text style={styles.emptyStateSubtitle}>No {activeTab} accounts have been created yet</Text>
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}


